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
    setIsSaving(false);
  };

  const cancelEdit = () => {
    setForm(originalForm);
    setIsEditing(false);
  };

  const renderEditableList = (items, field) => (
    <textarea
      rows={4}
      className="w-full bg-gray-50 p-3 rounded border text-sm"
      value={JSON.stringify(items, null, 2)}
      onChange={(e) =>
        setForm({ ...form, [field]: JSON.parse(e.target.value || "[]") })
      }
    />
  );

  const renderList = (items) => {
    if (!items || items.length === 0)
      return <p className="text-gray-400 text-sm italic">None detected</p>;

    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-gray-700 text-sm">
            {typeof item === "object"
              ? `${item.type || "Risk"}${item.severity ? ` (${item.severity})` : ""}${item.note ? `: ${item.note}` : ""}`

              : item}
          </li>
        ))}
      </ul>
    );
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 border-white">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold flex items-center gap-2">
          <Activity size={18} /> Clinical AI Summary
        </h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded"
          >
            <Pencil size={14} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={saveAll}
              disabled={isSaving}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              <Save size={14} /> Save
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded text-xs"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* SUMMARY */}
      <div className=" border-gray-100 border p-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
          Executive Summary
        </h3>

        {isEditing ? (
          <textarea
            rows={5}
            className="w-full bg-gray-50 p-4 rounded border"
            value={form.generated_summary}
            onChange={(e) =>
              setForm({ ...form, generated_summary: e.target.value })
            }
          />
        ) : (
          <p className="text-gray-700 text-sm whitespace-pre-line">
            {form.generated_summary}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <div className=" border-gray-100 border p-3">
          <h3 className="text-xs font-bold uppercase mb-2 flex items-center gap-1">
            <CheckCircle size={14} /> Key Points
          </h3>
          {isEditing
            ? renderEditableList(form.key_points, "key_points")
            : renderList(form.key_points)}
        </div>

        <div className=" border-gray-100 border p-3">
          <h3 className="text-xs font-bold uppercase mb-2 flex items-center gap-1 text-red-500">
            <AlertTriangle size={14} /> Risk Flags
          </h3>
          {isEditing
            ? renderEditableList(form.risk_flags, "risk_flags")
            : renderList(form.risk_flags)}
        </div>
      </div>

      <div className=" border-gray-100 border p-3">
        <h3 className="text-xs font-bold uppercase mb-2">Treatment Plan</h3>
        {isEditing
          ? renderEditableList(form.treatment_plan, "treatment_plan")
          : renderList(form.treatment_plan)}
      </div>
    </div>
  );
};

export default ReportSummary;
