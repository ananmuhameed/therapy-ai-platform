import React, { useEffect, useState } from "react";
import { FileText, AlertTriangle, CheckCircle, Activity, Save, X } from "lucide-react";
import api from "../../api/axiosInstance";

const ReportSummary = ({ report }) => {
  const [summary, setSummary] = useState("");
  const [originalSummary, setOriginalSummary] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (report?.generated_summary) {
      setSummary(report.generated_summary);
      setOriginalSummary(report.generated_summary);
    }
  }, [report]);

  const saveSummary = async () => {
    setIsSaving(true);
    await api.patch(`/sessions/${report.session}/report/`, {
      generated_summary: summary,
    });
    setOriginalSummary(summary);
    setIsEditing(false);
    setIsSaving(false);
  };

  const renderList = (items) => {
    if (!items || items.length === 0)
      return <p className="text-gray-400 text-sm italic">None detected</p>;

    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-gray-700 text-sm">
            {typeof item === "object"
              ? `${item.type} (${item.severity}): ${item.note || ""}`
              : item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
      <h2 className="font-semibold flex items-center gap-2">
        <Activity size={18} /> Clinical AI Summary
      </h2>

      {/* EDITABLE SUMMARY */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
          Executive Summary
        </h3>

        <textarea
          value={summary}
          onChange={(e) => {
            setSummary(e.target.value);
            setIsEditing(true);
          }}
          rows={5}
          className="w-full bg-gray-50 p-4 rounded border"
        />

        {isEditing && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={saveSummary}
              disabled={isSaving}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              <Save size={14} /> Save
            </button>
            <button
              onClick={() => {
                setSummary(originalSummary);
                setIsEditing(false);
              }}
              className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded text-xs"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-bold uppercase mb-2 flex items-center gap-1">
            <CheckCircle size={14} /> Key Points
          </h3>
          {renderList(report.key_points)}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase mb-2 flex items-center gap-1 text-red-500">
            <AlertTriangle size={14} /> Risk Flags
          </h3>
          {renderList(report.risk_flags)}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase mb-2">Treatment Plan</h3>
        {renderList(report.treatment_plan)}
      </div>
    </div>
  );
};

export default ReportSummary;
