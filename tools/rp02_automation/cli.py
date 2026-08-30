from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys

from .authority import authorize
from .canonical import intent_identity, request_key
from .errors import Classification, GatewayError
from .evidence import EvidenceBundle
from .jules import JulesReadOnlyClient
from .schema import READ_ACTIONS, normalize_request


def _load_request() -> dict:
    raw = os.environ.get("RP02_AUTOMATION_REQUEST_JSON", "")
    if not raw:
        raise GatewayError(Classification.INVALID_REQUEST, "RP02_AUTOMATION_REQUEST_JSON is required")
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise GatewayError(Classification.INVALID_REQUEST, "request JSON is malformed") from exc
    return normalize_request(value)


def _git_head() -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip().lower()


def inspect(output_dir: str) -> int:
    api_key = os.environ.get("JULES_API_KEY", "")
    bundle = EvidenceBundle(output_dir, secret_values=(api_key,))
    try:
        request = _load_request()
        bundle.emit("normalized_request", request)
        authorize(request, actor=os.environ.get("GITHUB_ACTOR"))
        if request["action"] not in READ_ACTIONS:
            raise GatewayError(Classification.MUTATION_DISABLED, "foundation stage exposes read-only Jules operations only")
        actual_sha = _git_head()
        if actual_sha != request["expected_sha"]:
            raise GatewayError(Classification.STALE_BASELINE, "checked-out SHA differs from expected_sha", {"actual_sha": actual_sha})
        client = JulesReadOnlyClient(
            api_key,
            timeout_seconds=float(os.environ.get("RP02_JULES_READ_TIMEOUT", "20")),
            max_reads=int(os.environ.get("RP02_JULES_MAX_READS", "200")),
            read_attempts=int(os.environ.get("RP02_JULES_READ_ATTEMPTS", "2")),
        )
        action = request["action"]
        if action == "inspect_sources":
            result = {"sources": client.list_sources()}
        elif action == "inspect_sessions":
            result = {"sessions": client.list_sessions()}
        elif action == "inspect_session":
            result = {"session": client.get_session(request["session_id"])}
        else:
            result = {"activities": client.list_activities(request["session_id"])}
        bundle.emit("provider_response", result)
        post = {
            "classification": "PASS",
            "operation_kind": "READ_ONLY",
            "provider_mutation_performed": False,
            "external_effects_dispatched": 0,
            "new_tasks_or_sessions_created": 0,
            "safe_to_blind_retry": False,
            "request_id": request["request_id"],
            "request_key": request_key(request["request_id"]),
            "intent_identity": intent_identity(request),
            "provider_reads": client.read_count,
            "exact_sha": actual_sha,
        }
        bundle.emit("postcondition", post)
        print(json.dumps(post, sort_keys=True))
        return 0
    except GatewayError as exc:
        bundle.emit("postcondition", {
            "classification": exc.classification.value,
            "message": exc.message,
            "details": exc.details,
            "provider_mutation_performed": False,
            "external_effects_dispatched": 0,
            "new_tasks_or_sessions_created": 0,
            "safe_to_blind_retry": False,
        })
        print(json.dumps(exc.as_dict(), sort_keys=True), file=sys.stderr)
        return 2


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="rp02-automation")
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("inspect")
    p.add_argument("--output-dir", required=True)
    args = parser.parse_args(argv)
    return inspect(args.output_dir)


if __name__ == "__main__":
    raise SystemExit(main())
