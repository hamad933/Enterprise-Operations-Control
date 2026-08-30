from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from .errors import Classification, GatewayError

DEFAULT_API_BASE = "https://jules.googleapis.com/v1alpha"
RESOURCE_SEGMENT_RE = re.compile(r"^[^/\s\x00-\x1f\x7f]{1,160}$")


class JulesReadOnlyClient:
    """GET-only Jules adapter. This class intentionally exposes no provider mutation method."""

    def __init__(self, api_key: str, *, api_base: str = DEFAULT_API_BASE, timeout_seconds: float = 20.0, max_reads: int = 200, read_attempts: int = 2) -> None:
        if not api_key:
            raise GatewayError(Classification.SECRET_UNAVAILABLE, "JULES_API_KEY is unavailable")
        self._api_key = api_key
        self.api_base = api_base.rstrip("/")
        self.timeout_seconds = min(max(float(timeout_seconds), 1.0), 45.0)
        self.max_reads = min(max(int(max_reads), 1), 2_000)
        self.read_attempts = min(max(int(read_attempts), 1), 3)
        self.read_count = 0

    @staticmethod
    def _valid_resource_segment(value: Any, *, field: str = "resource segment") -> str:
        text = str(value or "")
        if not RESOURCE_SEGMENT_RE.fullmatch(text):
            raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, f"Jules {field} is malformed")
        return text

    @classmethod
    def _session_name(cls, value: Any) -> str:
        text = str(value or "")
        prefix = "sessions/"
        segment = text[len(prefix):] if text.startswith(prefix) else ""
        cls._valid_resource_segment(segment, field="session resource name")
        if text != f"sessions/{segment}":
            raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules session resource name is malformed")
        return text

    @staticmethod
    def _source_name(value: Any) -> str:
        text = str(value or "")
        if not text.startswith("sources/") or len(text) <= len("sources/") or len(text) > 512:
            raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules source resource name is malformed")
        if any(ord(ch) < 32 or ord(ch) == 127 or ch.isspace() for ch in text):
            raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules source resource name is malformed")
        return text

    @classmethod
    def _activity_name_for_session(cls, name: Any, session_id: str) -> str:
        text = str(name or "")
        prefix = f"sessions/{session_id}/activities/"
        suffix = text[len(prefix):] if text.startswith(prefix) else ""
        cls._valid_resource_segment(suffix, field="activity resource name")
        if text != prefix + suffix:
            raise GatewayError(
                Classification.PROVIDER_PROTOCOL_FAILED,
                "Jules activity identity is malformed or cross-session",
                {"expected_session_id": session_id},
            )
        return text

    @staticmethod
    def _next_token(payload: dict[str, Any]) -> str | None:
        value = payload.get("nextPageToken")
        if value in (None, ""):
            return None
        if not isinstance(value, str) or len(value) > 4096:
            raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules nextPageToken is malformed")
        return value

    def _consume_read(self) -> None:
        if self.read_count >= self.max_reads:
            raise GatewayError(Classification.READ_BUDGET_EXCEEDED, "Jules read budget exhausted")
        self.read_count += 1

    def _get(self, path: str) -> dict[str, Any]:
        url = self.api_base + path
        last_error: Exception | None = None
        for attempt in range(1, self.read_attempts + 1):
            try:
                self._consume_read()
                req = urllib.request.Request(url, method="GET", headers={
                    "x-goog-api-key": self._api_key,
                    "Accept": "application/json",
                    "User-Agent": "rp02-automation-gateway/0.1",
                })
                with urllib.request.urlopen(req, timeout=self.timeout_seconds) as response:
                    raw = response.read()
                    try:
                        payload = json.loads(raw.decode("utf-8")) if raw else {}
                    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                        raise GatewayError(
                            Classification.PROVIDER_PROTOCOL_FAILED,
                            "Jules returned malformed JSON",
                            {"blind_retry": False},
                        ) from exc
                    if not isinstance(payload, dict):
                        raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules returned a non-object JSON payload")
                    return payload
            except urllib.error.HTTPError as exc:
                last_error = exc
                transient = exc.code == 429 or exc.code >= 500
                if not transient or attempt >= self.read_attempts:
                    raise GatewayError(Classification.READ_FAILED, "Jules GET failed", {"http_status": exc.code, "blind_retry": False}) from exc
            except (urllib.error.URLError, TimeoutError, OSError) as exc:
                last_error = exc
                if attempt >= self.read_attempts:
                    raise GatewayError(Classification.READ_FAILED, "Jules GET transport failed", {"blind_retry": False}) from exc
            time.sleep(min(2 ** (attempt - 1), 2))
        raise GatewayError(Classification.READ_FAILED, "Jules GET failed", {"error": type(last_error).__name__ if last_error else "unknown"})

    def list_sources(self, *, page_size: int = 100, max_pages: int = 10) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        token: str | None = None
        seen_tokens: set[str] = set()
        for _ in range(max_pages):
            query: dict[str, Any] = {"pageSize": min(max(page_size, 1), 100)}
            if token:
                query["pageToken"] = token
            payload = self._get("/sources?" + urllib.parse.urlencode(query))
            page = payload.get("sources")
            if not isinstance(page, list) or any(not isinstance(item, dict) for item in page):
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules sources collection is malformed")
            for item in page:
                self._source_name(item.get("name"))
            items.extend(page)
            next_token = self._next_token(payload)
            if not next_token:
                return items
            if next_token in seen_tokens:
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules pagination token repeated")
            seen_tokens.add(next_token)
            token = next_token
        raise GatewayError(
            Classification.INVENTORY_INCOMPLETE,
            "Jules source inventory exceeded the configured page bound",
            {"max_pages": max_pages, "items_observed": len(items), "blind_retry": False},
        )

    def list_sessions(self, *, page_size: int = 100, max_pages: int = 10) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        token: str | None = None
        seen_tokens: set[str] = set()
        for _ in range(max_pages):
            query: dict[str, Any] = {"pageSize": min(max(page_size, 1), 100)}
            if token:
                query["pageToken"] = token
            payload = self._get("/sessions?" + urllib.parse.urlencode(query))
            page = payload.get("sessions")
            if not isinstance(page, list) or any(not isinstance(item, dict) for item in page):
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules sessions collection is malformed")
            for item in page:
                self._session_name(item.get("name"))
                if "id" in item and (not isinstance(item["id"], str) or not item["id"]):
                    raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules session id field is malformed")
            items.extend(page)
            next_token = self._next_token(payload)
            if not next_token:
                return items
            if next_token in seen_tokens:
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules pagination token repeated")
            seen_tokens.add(next_token)
            token = next_token
        raise GatewayError(
            Classification.INVENTORY_INCOMPLETE,
            "Jules session inventory exceeded the configured page bound",
            {"max_pages": max_pages, "items_observed": len(items), "blind_retry": False},
        )

    def get_session(self, session_id: str) -> dict[str, Any]:
        try:
            safe_id = self._valid_resource_segment(session_id, field="session id")
        except GatewayError as exc:
            raise GatewayError(Classification.INVALID_REQUEST, "session_id is not a safe Jules resource segment") from exc
        payload = self._get("/sessions/" + urllib.parse.quote(safe_id, safe=""))
        actual_name = self._session_name(payload.get("name"))
        if actual_name != f"sessions/{safe_id}":
            raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules session resource identity mismatch")
        if "id" in payload and (not isinstance(payload["id"], str) or not payload["id"]):
            raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules session id field is malformed")
        return payload

    def list_activities(self, session_id: str, *, page_size: int = 100, max_pages: int = 10) -> list[dict[str, Any]]:
        try:
            safe_id = self._valid_resource_segment(session_id, field="session id")
        except GatewayError as exc:
            raise GatewayError(Classification.INVALID_REQUEST, "session_id is not a safe Jules resource segment") from exc
        items: list[dict[str, Any]] = []
        token: str | None = None
        seen_tokens: set[str] = set()
        sid = urllib.parse.quote(safe_id, safe="")
        for _ in range(max_pages):
            query: dict[str, Any] = {"pageSize": min(max(page_size, 1), 100)}
            if token:
                query["pageToken"] = token
            payload = self._get(f"/sessions/{sid}/activities?" + urllib.parse.urlencode(query))
            page = payload.get("activities")
            if not isinstance(page, list) or any(not isinstance(item, dict) for item in page):
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules activities collection is malformed")
            for item in page:
                self._activity_name_for_session(item.get("name"), safe_id)
            items.extend(page)
            next_token = self._next_token(payload)
            if not next_token:
                return items
            if next_token in seen_tokens:
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules pagination token repeated")
            seen_tokens.add(next_token)
            token = next_token
        raise GatewayError(
            Classification.INVENTORY_INCOMPLETE,
            "Jules activity inventory exceeded the configured page bound",
            {"session_id": safe_id, "max_pages": max_pages, "items_observed": len(items), "blind_retry": False},
        )
