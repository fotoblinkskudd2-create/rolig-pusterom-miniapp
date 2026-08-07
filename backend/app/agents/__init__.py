from app.agents.arctic_ops import ArcticOpsAgent
from app.agents.base import BaseAgent
from app.agents.biomimicry import BiomimicryAgent
from app.agents.drone_rd import DroneRDAgent
from app.agents.gonzo_critique import GonzoCritiqueAgent
from app.agents.mvp_factory import MVPFactoryAgent
from app.agents.panicsafe import PanicSafeAgent
from app.agents.patent import PatentAgent
from app.agents.roi_tracker import ROITrackerAgent

ALL_AGENTS: list[type[BaseAgent]] = [
    DroneRDAgent,
    BiomimicryAgent,
    ArcticOpsAgent,
    PanicSafeAgent,
    PatentAgent,
    MVPFactoryAgent,
    ROITrackerAgent,
    GonzoCritiqueAgent,
]

__all__ = ["ALL_AGENTS", "BaseAgent"] + [c.__name__ for c in ALL_AGENTS]
