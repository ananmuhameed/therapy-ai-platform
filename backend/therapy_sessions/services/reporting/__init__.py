# backend/therapy_sessions/services/reporting/__init__.py
from __future__ import annotations

from django.conf import settings

from .base import BaseReportProvider
from .mock import MockReportProvider
# from .llm import LLMReportProvider


class ReportProviderConfigError(RuntimeError):
    pass


def get_report_provider() -> BaseReportProvider:
    """
    Central factory for report generators.

    Controlled via settings:
        REPORT_PROVIDER = "mock" | "llm"
    """
    provider = getattr(settings, "REPORT_PROVIDER", "mock").lower().strip()

    if provider == "mock":
        return MockReportProvider()

    # if provider == "llm":
    #     return LLMReportProvider(
    #         model_name=getattr(settings, "REPORT_MODEL", "llm-v1")
    #     )

    raise ReportProviderConfigError(f"Unknown REPORT_PROVIDER: {provider}")
