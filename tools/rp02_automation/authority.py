from __future__ import annotations

from typing import Mapping, Any

from .errors import Classification, GatewayError
from .schema import (
    CENTRAL_CONTROLLER, DECLARED_MUTATION_ACTIONS, DEFAULT_BRANCH, INDEPENDENT_REVIEWER,
    PUBLICATION_ACTIONS, READ_ACTIONS, RECONCILIATION_ACTIONS, REPOSITORY,
)


def authorize(
    request: Mapping[str, Any],
    *,
    actor: str | None = None,
    repository_owner: str = "hamad933",
    runtime_repository: str | None = None,
    runtime_ref: str | None = None,
) -> None:
    controller = str(request.get("controller_id") or "")
    action = str(request.get("action") or "")
    if action in READ_ACTIONS:
        if controller not in {CENTRAL_CONTROLLER, INDEPENDENT_REVIEWER}:
            raise GatewayError(Classification.AUTHORITY_DENIED, "controller is not authorized for inspection")
    elif action in DECLARED_MUTATION_ACTIONS | RECONCILIATION_ACTIONS | PUBLICATION_ACTIONS:
        if controller != CENTRAL_CONTROLLER:
            raise GatewayError(Classification.AUTHORITY_DENIED, "only the RP02 Central Controller may request mutating/control effects")
        if not request.get("write_domain"):
            raise GatewayError(Classification.INVALID_REQUEST, "write_domain is required for effect-bearing actions")
    else:
        raise GatewayError(Classification.AUTHORITY_DENIED, "action has no authority mapping")

    if actor is not None and actor != repository_owner:
        raise GatewayError(Classification.AUTHORITY_DENIED, "GitHub transport actor must be the repository owner")
    if runtime_repository is not None and runtime_repository.casefold() != REPOSITORY.casefold():
        raise GatewayError(Classification.AUTHORITY_DENIED, "runtime repository is outside RP02")
    if runtime_ref is not None and runtime_ref != f"refs/heads/{DEFAULT_BRANCH}":
        raise GatewayError(Classification.AUTHORITY_DENIED, "runtime ref is outside the governed default branch")
