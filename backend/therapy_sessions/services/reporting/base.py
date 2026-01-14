from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class GeneratedReport:
    summary: str
    key_points: List[str] = field(default_factory=list)
    risk_flags: List[Dict[str, Any]] = field(default_factory=list)
    treatment_plan: List[str] = field(default_factory=list)
    model_name: str = "unknown"
    raw: Optional[Dict[str, Any]] = None  # optional for debugging/provider response


class BaseReportProvider(ABC):
    @abstractmethod
    def generate(
        self,
        *,
        transcript_text: str,
        session_context: Optional[Dict[str, Any]] = None,
        language: str = "en",
    ) -> GeneratedReport:
        """Generate a structured report from transcript text."""
        raise NotImplementedError
