from __future__ import annotations

import hashlib
import json
import re
from typing import Any, Mapping

REQUEST_ID_RE = re.compile(r"^[A-Z0-9][A-Z0-9._:-]{5,127}$")
TOKEN_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$")
SHA40_RE = re.compile(r"^[0-9a-f]{40}$")


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_hex(value: str | bytes) -> str:
    raw = value.encode("utf-8") if isinstance(value, str) else value
    return hashlib.sha256(raw).hexdigest()


def intent_identity(request: Mapping[str, Any]) -> str:
    return sha256_hex(canonical_json(dict(request)))


def request_key(request_id: str) -> str:
    return sha256_hex(f"rp02:request:{request_id}")[:32]


def effect_key(*, repository: str, write_domain: str, logical_task_id: str) -> str:
    material = canonical_json({
        "repository": repository.casefold(),
        "write_domain": write_domain,
        "logical_task_id": logical_task_id,
    })
    return sha256_hex("rp02:effect:" + material)[:32]
