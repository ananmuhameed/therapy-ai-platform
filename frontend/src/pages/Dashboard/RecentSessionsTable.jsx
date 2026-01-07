import React, { useMemo } from "react";
import { FiEye } from "react-icons/fi";
import Skeleton from "../../components/ui/Skeleton";
import StatusPill from "../../components/ui/StatusPill";
import { formatDate, classNames } from "../../utils/helpers";

export default function RecentSessionsTable({
  sessions = [],
  loading,
  error,
  onViewAll,
  onRowClick,
}) {
  const capitalize = (s) =>
  typeof s === "string" && s.length
    ? s.charAt(0).toUpperCase() + s.slice(1)
    : s;

  const recent5 = useMemo(() => {
    const list = Array.isArray(sessions)
      ? sessions
      : Array.isArray(sessions?.results)
      ? sessions.results
      : [];


    return [...list]
      .sort((a, b) => {
        const aDate = a?.created_at || a?.session_date || a?.updated_at || 0;
        const bDate = b?.created_at || b?.session_date || b?.updated_at || 0;
        return new Date(bDate) - new Date(aDate);
      })
      .slice(0, 3);
  }, [sessions]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-semibold text-gray-800">Recent Sessions</div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-medium text-[#3078E2] hover:underline"
        >
          View all
        </button>
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 text-xs font-medium text-gray-500 pb-2">
        <div className="col-span-2 text-left">#</div>
        <div className="col-span-2 text-left">Patient</div>
        <div className="col-span-3 text-center">Status</div>
        <div className="col-span-3 text-center">Created</div>
        <div className="col-span-1 text-right">Open</div>
      </div>


      {/* Rows (no inner table container) */}
      {loading && (
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="p-5">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && recent5.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-600">No sessions yet.</p>
        </div>
      )}

      {!loading &&
        !error &&
        recent5.map((row, idx) => {
          const createdLike =
            row?.created_at || row?.session_date || row?.updated_at || null;

          return (
            <div
              key={row.id}
              onClick={() => onRowClick(row.id)}
              className="grid grid-cols-12 items-center py-3 border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
            >
              <div className="col-span-2 text-sm text-gray-700 text-left">
                {idx + 1}
              </div>

              <div className="col-span-2 min-w-0 text-left">
                <div className="text-sm text-gray-800 font-medium truncate">
                  {row.name ||
                    row.patient_name ||
                    (row.patient ? `Patient #${row.patient}` : "—")}
                </div>
              </div>

              <div className="col-span-3 flex justify-center">
                <StatusPill status={capitalize(row.status)} />
              </div>

              <div className="col-span-3 text-sm text-gray-700 whitespace-nowrap text-center">

                {createdLike
                  ? formatDate(createdLike, {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })
                  : "—"}
              </div>

              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(row.id);
                  }}
                  className={classNames(
                    "inline-flex items-center justify-center rounded-full p-2",
                    "text-[#3078E2] hover:bg-[#3078E2]/10"
                  )}
                  title="Open session"
                >
                  <FiEye />
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
