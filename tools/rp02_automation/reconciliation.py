from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any

from .canonical import intent_identity


class ReconciliationState(StrEnum):
    APPLIED = "APPLIED"
    NOT_APPLIED = "NOT_APPLIED"
    UNKNOWN_PRIOR_WRITE_OUTCOME = "UNKNOWN_PRIOR_WRITE_OUTCOME"
    RECONCILIATION_REQUIRED = "RECONCILIATION_REQUIRED"


@dataclass(frozen=True, slots=True)
class WriteIntent:
    request_id: str
    logical_task_id: str
    write_domain: str
    action: str
    target_identity: str
    intent_identity: str
    timestamp: str
    blind_retry: bool = False

    @classmethod
    def from_request(cls, request: dict[str, Any], *, target_identity: str) -> "WriteIntent":
        return cls(
            request_id=request["request_id"],
            logical_task_id=request["logical_task_id"],
            write_domain=request["write_domain"],
            action=request["action"],
            target_identity=target_identity,
            intent_identity=intent_identity(request),
            timestamp=datetime.now(timezone.utc).isoformat(),
            blind_retry=False,
        )

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


def classify_authoritative_poststate(*, effect_present: bool | None) -> ReconciliationState:
    if effect_present is True:
        return ReconciliationState.APPLIED
    if effect_present is False:
        return ReconciliationState.NOT_APPLIED
    return ReconciliationState.RECONCILIATION_REQUIRED


def retry_permitted(state: ReconciliationState) -> bool:
    return state == ReconciliationState.NOT_APPLIED
