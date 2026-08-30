from __future__ import annotations

from dataclasses import dataclass

from .canonical import intent_identity
from .errors import Classification, GatewayError


@dataclass(frozen=True, slots=True)
class Registration:
    request_id: str
    intent_identity: str


class IdempotencyRegistry:
    """Deterministic in-memory model used by foundation tests and future durable adapters."""

    def __init__(self) -> None:
        self._items: dict[str, Registration] = {}

    def register(self, request: dict) -> tuple[Registration, bool]:
        rid = str(request["request_id"])
        ident = intent_identity(request)
        existing = self._items.get(rid)
        if existing is None:
            registration = Registration(rid, ident)
            self._items[rid] = registration
            return registration, True
        if existing.intent_identity != ident:
            raise GatewayError(
                Classification.CONFLICTING_REQUEST_ID,
                "request_id was reused with different intent",
                {"request_id": rid},
            )
        return existing, False
