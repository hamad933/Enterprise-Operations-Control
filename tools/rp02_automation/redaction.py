from __future__ import annotations

from typing import Any

SENSITIVE_KEYS = {
    "authorization", "x-goog-api-key", "api_key", "apikey", "token", "secret",
    "password", "credential", "private_key", "github_token", "jules_api_key",
}


def redact(value: Any, *, secret_values: tuple[str, ...] = ()) -> Any:
    live = tuple(s for s in secret_values if s)
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            if str(key).casefold() in SENSITIVE_KEYS:
                result[key] = "[REDACTED]"
            else:
                result[key] = redact(item, secret_values=live)
        return result
    if isinstance(value, list):
        return [redact(item, secret_values=live) for item in value]
    if isinstance(value, tuple):
        return [redact(item, secret_values=live) for item in value]
    if isinstance(value, str):
        text = value
        for secret in live:
            text = text.replace(secret, "[REDACTED]")
        return text
    return value
