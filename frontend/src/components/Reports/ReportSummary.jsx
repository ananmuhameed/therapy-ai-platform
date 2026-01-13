import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const ReportSummary = ({ report }) => {
  if (!report) return null;

  const renderList = (data) => {
    if (!data)
      return <p className="text-[rgb(var(--text-muted))] text-sm italic">None detected</p>;

    const items = Array.isArray(data) ? data : [];
    if (items.length === 0)
      return <p className="text-[rgb(var(--text-muted))] text-sm italic">None detected</p>;

    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, idx) => {
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
      <div className="bg-black/5 dark:bg-white/5 px-6 py-4 border-b border-[rgb(var(--border))] flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] rounded-lg">
            <Activity size={18} />
          </div>
          <h2 className="font-semibold text-[rgb(var(--text))]">
            Clinical AI Summary
          </h2>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-bold uppercase ${
            report.status === 'completed'
              ? 'bg-green-500/10 text-green-400'
              : 'bg-yellow-500/10 text-yellow-400'
          }`}
        >
          {report.status}
        </span>
      </div>

      <div className="p-6 grid gap-6">
        {/* Generated Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider flex items-center gap-2">
            <FileText size={14} /> Executive Summary
          </h3>
          <p className="text-[rgb(var(--text))] leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-[rgb(var(--border))]">
            {report.generated_summary || "No summary generated yet."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Points */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={14} /> Key Points
            </h3>
            <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))] h-full">
              {renderList(report.key_points)}
            </div>
          </div>

          {/* Risk Flags */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={14} /> Risk Flags
            </h3>
            <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/20 h-full">
              {renderList(report.risk_flags)}
            </div>
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Suggested Treatment Plan
          </h3>
          <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
            {renderList(report.treatment_plan)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;
