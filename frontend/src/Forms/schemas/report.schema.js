import * as Yup from "yup";
export const reportEditSchema = Yup.object({
  summary: Yup.string()
    .trim()
    .min(10, "Summary is too short")
    .max(20000, "Summary is too long")
    .required("Summary is required"),

  recommendations: Yup.string().trim().max(20000, "Too long").nullable(),
  highlights: Yup.string().trim().max(20000, "Too long").nullable(),
  status: Yup.string().oneOf(["draft", "completed"], "Invalid status").nullable(),
});

export function toReportPayload(values) {
  return {
    summary: values.summary,
    recommendations: values.recommendations || "",
    highlights: values.highlights || "",
    status: values.status ?? null,
  };
}

export function mapReportFieldErrors(fe = {}) {
  const map = {
    summary: "summary",
    recommendations: "recommendations",
    highlights: "highlights",
    status: "status",
  };
  const out = {};
  Object.entries(fe).forEach(([k, v]) => {
    out[map[k] || k] = v;
  });
  return out;
}
