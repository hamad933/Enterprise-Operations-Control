from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from .errors import Classification, GatewayError

DEFAULT_API_BASE = "https://jules.googleapis.com/v1alpha"


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
    def _valid_session_id(value: Any) -> str:
        text = str(value or "")
        if not text.isdigit() or len(text) > 32:
            raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules session identity is malformed")
        return text

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
                    payload = json.loads(raw.decode("utf-8")) if raw else {}
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

    def list_sessions(self, *, page_size: int = 100, max_pages: int = 10) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        token: str | None = None
        for _ in range(max_pages):
            query: dict[str, Any] = {"pageSize": min(max(page_size, 1), 100)}
            if token:
                query["pageToken"] = token
            payload = self._get("/sessions?" + urllib.parse.urlencode(query))
            page = payload.get("sessions")
            if not isinstance(page, list) or any(not isinstance(x, dict) for x in page):
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules sessions collection is malformed")
            for item in page:
                self._valid_session_id(item.get("id"))
            items.extend(page)
            token = payload.get("nextPageToken") or None
            if not token:
                break
            if not isinstance(token, str) or len(token) > 4096:
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules nextPageToken is malformed")
        return items

    def get_session(self, session_id: str) -> dict[str, Any]:
        if not session_id.isdigit() or len(session_id) > 32:
            raise GatewayError(Classification.INVALID_REQUEST, "session_id must be a provider numeric identity")
        payload = self._get("/sessions/" + urllib.parse.quote(session_id, safe=""))
        if self._valid_session_id(payload.get("id")) != session_id:
            raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules session identity mismatch")
        return payload

    def list_activities(self, session_id: str, *, page_size: int = 100, max_pages: int = 10) -> list[dict[str, Any]]:
        if not session_id.isdigit() or len(session_id) > 32:
            raise GatewayError(Classification.INVALID_REQUEST, "session_id must be a provider numeric identity")
        items: list[dict[str, Any]] = []
        token: str | None = None
        sid = urllib.parse.quote(session_id, safe="")
        for _ in range(max_pages):
            query: dict[str, Any] = {"pageSize": min(max(page_size, 1), 100)}
            if token:
                query["pageToken"] = token
            payload = self._get(f"/sessions/{sid}/activities?" + urllib.parse.urlencode(query))
            page = payload.get("activities")
            if not isinstance(page, list) or any(not isinstance(x, dict) for x in page):
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules activities collection is malformed")
            for item in page:
                name = str(item.get("name") or "")
                if not name.startswith(f"sessions/{session_id}/activities/"):
                    raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "cross-session activity identity rejected")
            items.extend(page)
            token = payload.get("nextPageToken") or None
            if not token:
                break
            if not isinstance(token, str) or len(token) > 4096:
                raise GatewayError(Classification.PROVIDER_PROTOCOL_FAILED, "Jules nextPageToken is malformed")
        return items
