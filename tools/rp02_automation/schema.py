from __future__ import annotations

import re
from typing import Any, Mapping

from .canonical import REQUEST_ID_RE, SHA40_RE, TOKEN_RE
from .errors import Classification, GatewayError

SCHEMA_VERSION = "1.0"
PROJECT_ID = "RP02"
REPOSITORY = "hamad933/Enterprise-Operations-Control"
DEFAULT_BRANCH = "main"
CENTRAL_CONTROLLER = "RP02_CENTRAL_CONTROLLER"
INDEPENDENT_REVIEWER = "RP02_INDEPENDENT_REVIEWER"
RESOURCE_SEGMENT_RE = re.compile(r"^[^/\s\x00-\x1f\x7f]{1,160}$")

READ_ACTIONS = frozenset({"inspect_sources", "inspect_sessions", "inspect_session", "inspect_activities"})
DECLARED_MUTATION_ACTIONS = frozenset({"create_session", "send_message", "approve_plan"})
RECONCILIATION_ACTIONS = frozenset({"reconcile_write_intent"})
PUBLICATION_ACTIONS = frozenset({"publish_candidate"})
ALL_ACTIONS = READ_ACTIONS | DECLARED_MUTATION_ACTIONS | RECONCILIATION_ACTIONS | PUBLICATION_ACTIONS

COMMON_REQUIRED = frozenset({
    "schema_version", "request_id", "project_id", "controller_id", "logical_task_id",
    "action", "repository", "starting_branch", "expected_sha"
})
BASE_OPTIONAL = frozenset({"lane", "authority_ref", "authority_event"})

ACTION_REQUIRED = {
    "inspect_sources": frozenset(),
    "inspect_sessions": frozenset(),
    "inspect_session": frozenset({"session_id"}),
    "inspect_activities": frozenset({"session_id"}),
    "create_session": frozenset({"write_domain"}),
    "send_message": frozenset({"write_domain", "session_id", "expected_session_state", "expected_session_update_time"}),
    "approve_plan": frozenset({"write_domain", "session_id", "expected_session_state", "expected_session_update_time"}),
    "reconcile_write_intent": frozenset({"write_domain", "target_request_id", "target_intent_identity"}),
    "publish_candidate": frozenset({"write_domain"}),
}

ACTION_OPTIONAL = {action: frozenset() for action in ALL_ACTIONS}


def _text(value: Any, field: str, *, regex=None) -> str:
    text = str(value or "").strip()
    if not text:
        raise GatewayError(Classification.INVALID_REQUEST, f"{field} is required")
    if regex is not None and not regex.fullmatch(text):
        raise GatewayError(Classification.INVALID_REQUEST, f"{field} has an invalid format")
    return text


def _field_regex(field: str):
    if field == "session_id":
        return RESOURCE_SEGMENT_RE
    if field == "target_request_id":
        return REQUEST_ID_RE
    if field in {"expected_session_update_time"}:
        return None
    return TOKEN_RE


def normalize_request(raw: Mapping[str, Any]) -> dict[str, Any]:
    if not isinstance(raw, Mapping):
        raise GatewayError(Classification.INVALID_REQUEST, "request must be a JSON object")
    action = _text(raw.get("action"), "action")
    if action not in ALL_ACTIONS:
        raise GatewayError(Classification.INVALID_REQUEST, "unsupported action", {"action": action})

    allowed = COMMON_REQUIRED | BASE_OPTIONAL | ACTION_REQUIRED[action] | ACTION_OPTIONAL[action]
    unknown = sorted(str(k) for k in raw if k not in allowed)
    if unknown:
        raise GatewayError(Classification.INVALID_REQUEST, "unknown request fields", {"fields": unknown})
    missing = sorted(k for k in (COMMON_REQUIRED | ACTION_REQUIRED[action]) if k not in raw or raw.get(k) in (None, ""))
    if missing:
        raise GatewayError(Classification.INVALID_REQUEST, "missing required fields", {"fields": missing})

    normalized: dict[str, Any] = {
        "schema_version": _text(raw.get("schema_version"), "schema_version"),
        "request_id": _text(raw.get("request_id"), "request_id", regex=REQUEST_ID_RE),
        "project_id": _text(raw.get("project_id"), "project_id"),
        "controller_id": _text(raw.get("controller_id"), "controller_id", regex=TOKEN_RE),
        "logical_task_id": _text(raw.get("logical_task_id"), "logical_task_id", regex=TOKEN_RE),
        "action": action,
        "repository": _text(raw.get("repository"), "repository"),
        "starting_branch": _text(raw.get("starting_branch"), "starting_branch", regex=TOKEN_RE),
        "expected_sha": _text(raw.get("expected_sha"), "expected_sha").lower(),
    }
    for key in sorted(allowed - COMMON_REQUIRED):
        if raw.get(key) not in (None, ""):
            normalized[key] = _text(raw.get(key), key, regex=_field_regex(key))

    if normalized["schema_version"] != SCHEMA_VERSION:
        raise GatewayError(Classification.INVALID_REQUEST, "unsupported schema_version")
    if normalized["project_id"] != PROJECT_ID:
        raise GatewayError(Classification.AUTHORITY_DENIED, "project_id is outside RP02")
    if normalized["repository"].casefold() != REPOSITORY.casefold():
        raise GatewayError(Classification.AUTHORITY_DENIED, "repository is outside RP02")
    if normalized["starting_branch"] != DEFAULT_BRANCH:
        raise GatewayError(Classification.AUTHORITY_DENIED, "foundation transport is pinned to main")
    if not SHA40_RE.fullmatch(normalized["expected_sha"]):
        raise GatewayError(Classification.INVALID_REQUEST, "expected_sha must be 40 lowercase hex characters")
    return normalized
