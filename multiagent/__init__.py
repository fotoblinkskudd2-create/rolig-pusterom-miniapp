"""Stille Verksted: multiagent-simulering for idévurdering og forbedring."""
from .agents import default_agents
from .orchestrator import evaluate, improve, tournament
from .seeds import seed_ideas

__all__ = ["default_agents", "evaluate", "improve", "tournament", "seed_ideas"]
