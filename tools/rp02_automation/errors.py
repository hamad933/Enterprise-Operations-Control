from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class Classification(StrEnum):
    INVALID_REQUEST = "INVALID_REQUEST"
    AUTHORITY_DENIED = "AUTHORITY_DENIED"
    STALE_BASELINE = "STALE_BASELINE"
    CONFLICTING_REQUEST_ID = "CONFLICTING_REQUEST_ID"
    READ_FAILED = "READ_FAILED"
    READ_BUDGET_EXCEEDED = "READ_BUDGET_EXCEEDED"
    PROVIDER_PROTOCOL_FAILED = "PROVIDER_PROTOCOL_FAILED"
    SECRET_UNAVAILABLE = "SECRET_UNAVAILABLE"
    MUTATION_DISABLED = "MUTATION_DISABLED"
    UNKNOWN_PRIOR_WRITE_OUTCOME = "UNKNOWN_PRIOR_WRITE_OUTCOME"
    RECONCILIATION_REQUIRED = "RECONCILIATION_REQUIRED"


@dataclass(slots=True)
class GatewayError(RuntimeError):
    classification: Classification
    message: str
    details: dict[str, Any] = field(default_factory=dict)

    def __str__(self) -> str:
        return f"{self.classification}: {self.message}"

    def as_dict(self) -> dict[str, Any]:
        return {
            "classification": self.classification.value,
            "message": self.message,
            "details": self.details,
        }
