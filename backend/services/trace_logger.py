"""
Trace Logger Service.
Collects reasoning traces for every step of the pipeline.
Provides full transparency into AI decision-making.
"""

from typing import List, Optional, Dict, Any
from models.schemas import TraceEntry
import logging

logger = logging.getLogger(__name__)


class TraceLogger:
    """
    Collects a list of TraceEntry objects throughout the pipeline.
    Each major service appends its own entries here for full auditability.
    """

    def __init__(self):
        self._entries: List[TraceEntry] = []

    def log(
        self,
        step: str,
        input_summary: str,
        output_summary: str,
        reasoning: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        entry = TraceEntry(
            step=step,
            input_summary=input_summary,
            output_summary=output_summary,
            reasoning=reasoning,
            metadata=metadata or {},
        )
        self._entries.append(entry)
        logger.debug(f"[TRACE] {step}: {reasoning}")

    def get_entries(self) -> List[TraceEntry]:
        return list(self._entries)

    def clear(self) -> None:
        self._entries.clear()
