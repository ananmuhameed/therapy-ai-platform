from io import BytesIO
from django.template.loader import render_to_string
from weasyprint import HTML


def generate_report_pdf(session):
    report = session.report

    html = render_to_string(
        "reports/session_report.html",
        {
            "patient_name": session.patient.full_name,
            "session_date": session.session_date.strftime("%d %b %Y")
            if session.session_date
            else "",
            "summary": report.generated_summary,
            "key_points": report.key_points or [],
            "risk_flags": report.risk_flags or [],
            "treatment_plan": report.treatment_plan or [],
            "therapist_notes": report.therapist_notes,
        },
    )

    pdf_io = BytesIO()
    HTML(string=html).write_pdf(target=pdf_io)
    pdf_io.seek(0)
    return pdf_io
