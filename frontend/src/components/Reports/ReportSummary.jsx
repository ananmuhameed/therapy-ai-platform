import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const ReportSummary = ({ report }) => {
  if (!report) return null;

  // Helper to ensure we render lists correctly 
  // Helper to ensure we render lists correctly
  const renderList = (data) => {
    if (!data) return <p className="text-gray-400 text-sm italic">None detected</p>;

    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) return <p className="text-gray-400 text-sm italic">None detected</p>;

    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, idx) => {
          // If item is an object (e.g., risk flag), render its fields
          if (item && typeof item === "object") {
            const type = item.type ?? "risk";
            const severity = item.severity ?? "unknown";
            const note = item.note ?? "";

            return (
              <li key={idx} className="text-gray-700 text-sm">
                <span className="font-semibold">{String(type)}</span>
                {" "}
                <span className="uppercase text-xs font-bold">
                  ({String(severity)})
                </span>
                {note ? `: ${String(note)}` : ""}
              </li>
            );
          }

          // Otherwise render as string
          return (
            <li key={idx} className="text-gray-700 text-sm">
              {String(item)}
            </li>
          );
        })}
      </ul>
    );
  };


  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Activity size={18} />
          </div>
          <h2 className="font-semibold text-gray-800">Clinical AI Summary</h2>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${report.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {report.status}
        </span>
      </div>

      <div className="p-6 grid gap-6">
        {/* Generated Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FileText size={14} /> Executive Summary
          </h3>
          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
            {report.generated_summary || "No summary generated yet."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Points */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={14} /> Key Points
            </h3>
            <div className="bg-white p-4 rounded-lg border border-gray-100 h-full">
              {renderList(report.key_points)}
            </div>
          </div>

          {/* Risk Flags */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={14} /> Risk Flags
            </h3>
            <div className="bg-red-50/30 p-4 rounded-lg border border-red-100 h-full">
              {renderList(report.risk_flags)}
            </div>
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Suggested Treatment Plan
          </h3>
          <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100">
            {renderList(report.treatment_plan)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;