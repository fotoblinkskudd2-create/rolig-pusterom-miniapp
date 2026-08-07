"""Base class every REGNViking agent implements."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from app import memory
from app.audit import log


class BaseAgent(ABC):
    name: str = "base"
    description: str = ""

    def remember(self, key: str, value: Any) -> None:
        memory.remember(self.name, key, value)

    def recall(self, key: str, default: Any = None) -> Any:
        return memory.recall(self.name, key, default)

    @abstractmethod
    def handle(self, kind: str, payload: dict) -> dict:
        """Execute one unit of work. Must be side-effect-safe to retry."""
        raise NotImplementedError

    def run(self, kind: str, payload: dict) -> dict:
        log(self.name, "task.start", {"kind": kind, "payload": payload})
        result = self.handle(kind, payload)
        log(self.name, "task.done", {"kind": kind, "result_keys": list(result.keys())})
        return result
