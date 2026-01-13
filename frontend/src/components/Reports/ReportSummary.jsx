import React, { useEffect, useState } from "react";
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

const ReportSummary = ({ report }) => {
  const [form, setForm] = useState({
    generated_summary: "",
    key_points: [],
    risk_flags: [],
    treatment_plan: [],
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
      };
      setForm(data);
      setOriginalForm(data);
    }
  }, [report]);

  const saveAll = async () => {
    try {
      setIsSaving(true);

      const payload = {
        ...form,
        risk_flags: (form.risk_flags || []).map((f) =>
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

      setOriginalForm(form);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm(originalForm);
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
      {/* HEADER */}
      <div className="bg-black/5 dark:bg-white/5 px-6 py-4 border-b border-[rgb(var(--border))] flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] rounded-lg">
            <Activity size={18} />
          </div>
          <h2 className="font-semibold text-[rgb(var(--text))]">
            Clinical AI Summary
          </h2>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs bg-black/5 dark:bg-white/5 px-3 py-1 rounded"
          >
            <Pencil size={14} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={saveAll}
              disabled={isSaving}
              className="flex items-center gap-1 bg-[rgb(var(--primary))] text-white px-3 py-1 rounded text-xs"
            >
              <Save size={14} /> Save
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1 bg-black/10 dark:bg-white/10 px-3 py-1 rounded text-xs"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}
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
              {renderList(form.key_points)}
            </div>
          </div>

          {/* Risk Flags */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={14} /> Risk Flags
            </h3>
            <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/20 h-full">
              {renderList(form.risk_flags)}
            </div>
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Suggested Treatment Plan
          </h3>
          <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
            {renderList(form.treatment_plan)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;
