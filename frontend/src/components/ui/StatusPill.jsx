import React from "react";
import { classNames } from "../../utils/helpers";

export default function StatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  
  const styles = {
    empty: "bg-gray-100 text-gray-700 ring-gray-200",
    uploaded: "bg-blue-50 text-blue-700 ring-blue-100",
    recorded: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    transcribing: "bg-amber-50 text-amber-700 ring-amber-100",
    analyzing: "bg-purple-50 text-purple-700 ring-purple-100",
    completed: "bg-green-50 text-green-700 ring-green-100",
    failed: "bg-red-50 text-red-700 ring-red-100",
    draft: "bg-gray-100 text-gray-700 ring-gray-200",
    ready: "bg-green-50 text-green-700 ring-green-100",
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[s] || "bg-gray-100 text-gray-600 ring-gray-200"
      )}
    >
      {status || "—"}
    </span>
  );
}