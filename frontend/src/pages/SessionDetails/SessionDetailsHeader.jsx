import React from "react";
import { ArrowLeft, Download, Loader2, Sparkles } from "lucide-react";

export default function SessionDetailsHeader({
  meta,
  generatingReport,
  onBack,
  onGenerateReport,
  onDownloadPdf,
}) {
  const {
    patientLabel,
    sessionLabel,
    dateLabel,
    status,
    reportStatus,
  } = meta;

  const isCompleted = reportStatus === "completed";

  return (
    <header className="flex justify-between items-start mb-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-xl font-bold text-gray-900">{patientLabel}</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 uppercase font-medium bg-gray-100 px-2 py-0.5 rounded">
              {sessionLabel}
            </span>

            <span className="text-xs text-gray-500 uppercase font-medium">
              {dateLabel}
            </span>

            <span
              className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                status === "completed"
                  ? "text-green-600 bg-green-50"
                  : "text-blue-600 bg-blue-50"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      {isCompleted ? (
        <button
          type="button"
          onClick={onDownloadPdf}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition font-medium text-sm"
        >
          <Download size={16} /> Download Report
        </button>
      ) : (
        <button
          type="button"
          onClick={onGenerateReport}
          disabled={generatingReport || status === "analyzing"}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-xl shadow-md transition font-medium text-sm"
        >
          {generatingReport ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          <span>Generate AI Report</span>
        </button>
      )}
    </header>
  );
}
