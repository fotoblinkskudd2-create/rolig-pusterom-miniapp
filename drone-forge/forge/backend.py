"""Model boundary. The forge calls a Backend; it never talks to a model directly."""

import json
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path

from .validate import validation_errors

SKILL_FILE = Path(__file__).resolve().parent.parent / "skills" / "drone-forge" / "SKILL.md"
_SECTION = re.compile(r"^## node: (\S+)\s*$", re.MULTILINE)


class BackendError(Exception):
    """The call failed: crash, non-zero exit or unusable transport."""


class BackendTimeout(BackendError):
    """The call exceeded its node timeout."""


class InvalidOutput(Exception):
    """The call returned, but the output breaks the schema or a domain rule."""


class BudgetExhausted(Exception):
    """The call would exceed the run budget."""


@dataclass
class Context:
    config: dict
    backend: object
    run_dir: Path


class Backend:
    def call(self, node_id, tier, prompt, payload, timeout_s):
        raise NotImplementedError


class CommandBackend(Backend):
    """Sends one JSON request on stdin to an external command and reads one JSON object from stdout.

    Wire the command to OpenClaw with a wrapper script of your own. This class only
    knows the stdin/stdout contract, not OpenClaw's CLI flags.

    Request:  {"node": str, "tier": "local|mid|frontier", "prompt": str, "input": {...}}
    Response: one JSON object that matches the node's schema.
    """

    def __init__(self, argv):
        self.argv = list(argv)

    def call(self, node_id, tier, prompt, payload, timeout_s):
        request = {"node": node_id, "tier": tier, "prompt": prompt, "input": payload}
        try:
            proc = subprocess.run(
                self.argv,
                input=json.dumps(request, ensure_ascii=False),
                capture_output=True,
                text=True,
                timeout=timeout_s,
            )
        except subprocess.TimeoutExpired as exc:
            raise BackendTimeout(f"{node_id} exceeded {timeout_s}s") from exc
        if proc.returncode != 0:
            raise BackendError(f"exit {proc.returncode}: {proc.stderr.strip()[-1000:]}")
        try:
            raw = json.loads(proc.stdout)
        except json.JSONDecodeError as exc:
            raise InvalidOutput(f"stdout is not JSON: {exc}") from exc
        if not isinstance(raw, dict):
            raise InvalidOutput("top-level JSON must be an object")
        return raw


def load_prompt(node_id):
    text = SKILL_FILE.read_text(encoding="utf-8")
    matches = list(_SECTION.finditer(text))
    for i, match in enumerate(matches):
        if match.group(1) == node_id:
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            return text[match.end():end].strip()
    raise KeyError(f"no '## node: {node_id}' section in {SKILL_FILE}")


def spend(state, tier):
    budget, used = state["budget"], state["budget_used"]
    if tier == "frontier" and used["frontier_calls"] >= budget["max_frontier_calls"]:
        raise BudgetExhausted(f"frontier budget of {budget['max_frontier_calls']} calls is spent")
    used["agent_calls"] += 1
    if tier == "frontier":
        used["frontier_calls"] += 1


def checked_output(raw, schema):
    partial = bool(raw.pop("_partial", False))
    errors = validation_errors(schema, raw)
    if errors:
        raise InvalidOutput("; ".join(errors[:3]))
    return raw, partial
