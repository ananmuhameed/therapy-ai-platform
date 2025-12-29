import React from "react";
import { FiEye } from "react-icons/fi";
import { classNames } from "../../utils/helpers";
import StatusPill from "../../components/ui/StatusPill";
import Skeleton from "../../components/ui/Skeleton";

export default function ReportsTable({ loading, error, reports, onOpen }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 border-b border-gray-100 bg-white">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Patient</div>
        <div className="col-span-3">Date</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Open</div>
      </div>

      <div className="min-h-[420px] bg-white">
        {/* Loading State */}
        {loading && (
          <div className="p-4 sm:p-6 space-y-3">
            {Array.from({ length: 7 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <p className="mt-2 text-sm text-gray-600">
              Check your token / permissions and the reports endpoint.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && reports.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-700 font-medium">No reports found.</p>
            <p className="mt-1 text-xs text-gray-500">Try changing filters or search.</p>
          </div>
        )}

        {/* Data Rows */}
        {!loading && !error && reports.length > 0 && (
          <div className="divide-y divide-gray-100">
            {reports.map((r) => {
              const canOpen = Boolean(r.openPath);
              return (
                <div
                  key={`${r.sessionId ?? ""}-${r.id}`}
                  onClick={() => canOpen && onOpen(r.openPath)}
                  className={classNames(
                    "grid grid-cols-12 items-center px-4 sm:px-6 py-3 bg-white transition",
                    canOpen ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                  )}
                  role={canOpen ? "button" : undefined}
                  tabIndex={canOpen ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (!canOpen) return;
                    if (e.key === "Enter" || e.key === " ") onOpen(r.openPath);
                  }}
                  title={canOpen ? "Open session" : "No session to open"}
                >
                  <div className="col-span-1 text-sm text-gray-700">{r.indexLabel}</div>

                  <div className="col-span-5 min-w-0">
                    <div className="text-sm text-gray-900 font-medium truncate">{r.patientName}</div>
                    <div className="mt-0.5 text-xs text-gray-500 font-normal">
                      Session ID: <span className="font-mono">{r.sessionId ?? "—"}</span>
                    </div>
                  </div>

                  <div className="col-span-3 text-sm text-gray-700">{r.date}</div>

                  <div className="col-span-2">
                    <StatusPill status={r.status} />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canOpen) onOpen(r.openPath);
                      }}
                      disabled={!canOpen}
                      className={classNames(
                        "inline-flex items-center justify-center rounded-full p-2",
                        canOpen
                          ? "text-[#3078E2] hover:bg-[#3078E2]/10 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed"
                      )}
                      aria-label="View"
                      title="View"
                      type="button"
                    >
                      <FiEye />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}