from io import BytesIO
from django.template.loader import render_to_string
from weasyprint import HTML
from django.utils import timezone
from therapy_sessions.serializers.report import _safe_json_load


def generate_report_pdf(session):
    report = session.report

    html = render_to_string(
        "reports/session_report.html",
        {
            "patient_name": session.patient.full_name,
            "session_date": timezone.now().strftime("%d %b %Y %H:%M"),
            "summary": report.generated_summary,
            "key_points": _safe_json_load(report.key_points, []),
            "risk_flags": _safe_json_load(report.risk_flags, []),
            "treatment_plan": _safe_json_load(report.treatment_plan, []),
            "therapist_notes": report.therapist_notes,
        },
    )

    pdf_io = BytesIO()
    HTML(string=html).write_pdf(target=pdf_io)
    pdf_io.seek(0)
    return pdf_io
