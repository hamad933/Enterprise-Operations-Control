from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .redaction import redact


def write_json(path: Path, value: Any, *, secret_values: tuple[str, ...] = ()) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    safe = redact(value, secret_values=secret_values)
    path.write_text(json.dumps(safe, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")


class EvidenceBundle:
    def __init__(self, output_dir: str | Path, *, secret_values: tuple[str, ...] = ()) -> None:
        self.output_dir = Path(output_dir)
        self.secret_values = secret_values
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def emit(self, name: str, value: Any) -> Path:
        if not name.endswith(".json"):
            name += ".json"
        path = self.output_dir / name
        write_json(path, value, secret_values=self.secret_values)
        return path
