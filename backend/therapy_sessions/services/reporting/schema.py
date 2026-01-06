from typing import List, Literal
from pydantic import BaseModel, Field


class RiskFlag(BaseModel):
    type: str = Field(..., description="Risk category (e.g. anxiety, self-harm)")
    severity: Literal["low", "medium", "high"]
    note: str


class ReportSchema(BaseModel):
    summary: str
    key_points: List[str]
    risk_flags: List[RiskFlag] = []
    treatment_plan: List[str]
