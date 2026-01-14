import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Activity,
  Save,
  X,
  Pencil,
} from "lucide-react";
import api from "../../api/axiosInstance";

const linesToArray = (text) =>
  (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const arrayToLines = (arr) =>
  Array.isArray(arr) ? arr.map((x) => String(x ?? "")).join("\n") : "";

const riskFlagsToLines = (riskFlags) => {
  if (!Array.isArray(riskFlags)) return "";
  return riskFlags
    .map((f) => {
      if (typeof f === "string") return f;
      if (f && typeof f === "object") {
        const type = (f.type ?? "Risk").toString().trim();
        const severity = (f.severity ?? "").toString().trim();
        const note = (f.note ?? "").toString().trim();

        // Format: type | severity | note  (severity optional)
        if (severity || note) return `${type} | ${severity} | ${note}`.trim();
        return type;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
};

const parseRiskFlags = (text) => {
  // Accept:
  // - "Just a note"
  // - "Risk | high | patient mentions self-harm"
  const rawLines = linesToArray(text);

  return rawLines.map((line) => {
    const parts = line.split("|").map((p) => p.trim());

    // If not pipe formatted, keep as string; saveAll will normalize it anyway
    if (parts.length === 1) return parts[0];

    const [type, severity, ...rest] = parts;
    const note = rest.join(" | ").trim();

    return {
      type: type || "Risk",
      severity: severity || "",
      note: note || "",
    };
  });
};

const ReportSummary = ({ report }) => {
  const [form, setForm] = useState({
    generated_summary: "",
    key_points: [],
    risk_flags: [],
    treatment_plan: [],
    session_notes: "",
  });

  // Text buffers used only during edit mode (so editing is smooth)
  const [editBuffers, setEditBuffers] = useState({
    key_points_text: "",
    risk_flags_text: "",
    treatment_plan_text: "",
  });

  const [originalForm, setOriginalForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (report) {
      const data = {
        generated_summary: report.generated_summary || "",
        key_points: report.key_points || [],
        risk_flags: report.risk_flags || [],
        treatment_plan: report.treatment_plan || [],
        session_notes: report.session_notes || "",
      };
      setForm(data);
      setOriginalForm(data);

      // keep buffers in sync with loaded report
      setEditBuffers({
        key_points_text: arrayToLines(data.key_points),
        risk_flags_text: riskFlagsToLines(data.risk_flags),
        treatment_plan_text: arrayToLines(data.treatment_plan),
      });
    }
  }, [report]);

  const reportStatusLabel = useMemo(() => {
    const s = (report?.status || "draft").toUpperCase();
    if (["FINAL", "FINALIZED", "COMPLETED"].includes(s)) return "COMPLETED";
    return s;
  }, [report]);

  const statusClasses = useMemo(() => {
    switch (reportStatusLabel) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      case "DRAFT":
      default:
        return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    }
  }, [reportStatusLabel]);

  const enterEdit = () => {
    setIsEditing(true);

    // ensure buffers reflect current form (in case form changed)
    setEditBuffers({
      key_points_text: arrayToLines(form.key_points),
      risk_flags_text: riskFlagsToLines(form.risk_flags),
      treatment_plan_text: arrayToLines(form.treatment_plan),
    });
  };

  const saveAll = async () => {
    try {
      setIsSaving(true);

      // Convert buffers -> arrays for saving
      const keyPointsArr = linesToArray(editBuffers.key_points_text);
      const treatmentArr = linesToArray(editBuffers.treatment_plan_text);
      const riskParsed = parseRiskFlags(editBuffers.risk_flags_text);

      const payload = {
        generated_summary: form.generated_summary,
        session_notes: form.session_notes,
        key_points: keyPointsArr,
        treatment_plan: treatmentArr,

        // normalize into objects as your backend expects
        risk_flags: (riskParsed || []).map((f) =>
          typeof f === "string"
            ? { type: "Risk", severity: "", note: f }
            : {
                type: f.type || "Risk",
                severity: f.severity || "",
                note: f.note || "",
              }
        ),
      };

      await api.patch(`/sessions/${report.session}/report/`, payload);

      // update local state to reflect what we saved
      const nextForm = {
        ...form,
        key_points: keyPointsArr,
        treatment_plan: treatmentArr,
        risk_flags: payload.risk_flags,
      };

      setForm(nextForm);
      setOriginalForm(nextForm);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm(originalForm);
    setEditBuffers({
      key_points_text: arrayToLines(originalForm?.key_points || []),
      risk_flags_text: riskFlagsToLines(originalForm?.risk_flags || []),
      treatment_plan_text: arrayToLines(originalForm?.treatment_plan || []),
    });
    setIsEditing(false);
  };

  const renderList = (data) => {
    if (!data || data.length === 0)
      return (
        <p className="text-[rgb(var(--text-muted))] text-sm italic">
          None detected
        </p>
      );

    return (
      <ul className="list-disc list-inside space-y-1">
        {data.map((item, idx) => {
          if (item && typeof item === "object") {
            const type = item.type ?? "risk";
            const severity = item.severity ?? "unknown";
            const note = item.note ?? "";

            return (
              <li key={idx} className="text-[rgb(var(--text))] text-sm">
                <span className="font-semibold">{String(type)}</span>{" "}
                <span className="uppercase text-xs font-bold">
                  ({String(severity)})
                </span>
                {note ? `: ${String(note)}` : ""}
              </li>
            );
          }

          return (
            <li key={idx} className="text-[rgb(var(--text))] text-sm">
              {String(item)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-[rgb(var(--card))] rounded-xl shadow-sm border border-[rgb(var(--border))] overflow-hidden">
      {/* HEADER (enhanced) */}
      <div className="px-6 py-4 border-b border-[rgb(var(--border))] bg-white/70 dark:bg-white/5">
        <div className="flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] flex items-center justify-center">
              <Activity size={18} />
            </div>

            <div className="leading-tight">
              <h2 className="font-semibold text-[rgb(var(--text))] text-sm">
                Clinical Summary
              </h2>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                Review and edit before saving.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide ${statusClasses}`}
            >
              {reportStatusLabel}
            </span>

            {!isEditing ? (
              <button
                type="button"
                onClick={enterEdit}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveAll}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgb(var(--primary))] text-white hover:brightness-95 active:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 grid gap-6">
        {/* SUMMARY */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider flex items-center gap-2">
            <FileText size={14} /> Executive Summary
          </h3>

          {isEditing ? (
            <textarea
              rows={5}
              className="w-full bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-[rgb(var(--border))]"
              value={form.generated_summary}
              onChange={(e) =>
                setForm({ ...form, generated_summary: e.target.value })
              }
            />
          ) : (
            <p className="text-[rgb(var(--text))] leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-[rgb(var(--border))]">
              {form.generated_summary || "No summary generated yet."}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Points */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={14} /> Key Points
            </h3>

            <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))] h-full">
              {isEditing ? (
                <>
                  <textarea
                    rows={6}
                    className="w-full bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-[rgb(var(--border))]"
                    value={editBuffers.key_points_text}
                    onChange={(e) =>
                      setEditBuffers((prev) => ({
                        ...prev,
                        key_points_text: e.target.value,
                      }))
                    }
                    placeholder={"One key point per line"}
                  />
                  <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">
                    Tip: write one item per line.
                  </p>
                </>
              ) : (
                renderList(form.key_points)
              )}
            </div>
          </div>

          {/* Risk Flags */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={14} /> Risk Flags
            </h3>

            <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/20 h-full">
              {isEditing ? (
                <>
                  <textarea
                    rows={6}
                    className="w-full bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-[rgb(var(--border))]"
                    value={editBuffers.risk_flags_text}
                    onChange={(e) =>
                      setEditBuffers((prev) => ({
                        ...prev,
                        risk_flags_text: e.target.value,
                      }))
                    }
                    placeholder={
                      "Examples:\nSelf-harm mentioned\nRisk | high | suicidal ideation"
                    }
                  />
                  <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">
                    Format optional: <span className="font-semibold">type | severity | note</span>.
                    If you just write a line, it will be saved as a Risk note.
                  </p>
                </>
              ) : (
                renderList(form.risk_flags)
              )}
            </div>
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Suggested Treatment Plan
          </h3>

          <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
            {isEditing ? (
              <>
                <textarea
                  rows={6}
                  className="w-full bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-[rgb(var(--border))]"
                  value={editBuffers.treatment_plan_text}
                  onChange={(e) =>
                    setEditBuffers((prev) => ({
                      ...prev,
                      treatment_plan_text: e.target.value,
                    }))
                  }
                  placeholder={"One treatment step per line"}
                />
                <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">
                  Tip: one step per line.
                </p>
              </>
            ) : (
              renderList(form.treatment_plan)
            )}
          </div>
        </div>

        {/* Session Notes */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider">
            Session Notes
          </h3>

          {isEditing ? (
            <textarea
              rows={6}
              className="w-full bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-[rgb(var(--border))]"
              value={form.session_notes}
              onChange={(e) =>
                setForm({ ...form, session_notes: e.target.value })
              }
              placeholder="Write your notes for this session..."
            />
          ) : (
            <p className="text-[rgb(var(--text))] leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-[rgb(var(--border))] whitespace-pre-wrap">
              {form.session_notes || "No session notes added."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;
