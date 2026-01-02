import React, { useMemo } from "react";
import { FiEye } from "react-icons/fi";
import Skeleton from "../../components/ui/Skeleton";
import StatusPill from "../../components/ui/StatusPill";

export default function RecentSessionsTable({
  sessions = [],
  loading,
  error,
  onViewAll,
  onRowClick,
}) {
  // ✅ always show ONLY the most recent 3 (by created_at)
  const recent3 = useMemo(() => {
    const list = Array.isArray(sessions) ? sessions : [];

    const sorted = [...list].sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime();
      const bTime = new Date(b.created_at || 0).getTime();
      return bTime - aTime;
    });

    return sorted.slice(0, 3);
  }, [sessions]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-semibold text-gray-800">Recent Sessions</div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-medium text-[#3078E2] hover:underline cursor-pointer"
        >
          View all
        </button>
      </div>

      <div className="grid grid-cols-12 text-xs font-medium text-gray-500 px-2 pb-2">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Patient</div>
        <div className="col-span-3">Status</div>
        <div className="col-span-2">Created</div>
        <div className="col-span-1 text-right">Open</div>
      </div>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
        {loading && (
          <div className="p-4 space-y-3 bg-white">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-5 bg-white">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && recent3.length === 0 && (
          <div className="p-8 bg-white text-center">
            <p className="text-sm text-gray-600">No sessions yet.</p>
          </div>
        )}

        {!loading &&
          !error &&
          recent3.map((row, idx) => (
            <div
              key={row.id}
              onClick={() => onRowClick(row.id)}
              className="grid grid-cols-12 items-center px-2 py-3 bg-white hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="col-span-1 text-sm text-gray-700">
                {row.indexLabel ?? idx + 1}
              </div>

              <div className="col-span-5 min-w-0">
                <div className="text-sm text-gray-800 font-medium truncate">
                  {row.name || row.patient_name || `Patient #${row.patient}`}
                </div>
              </div>

              <div className="col-span-3">
                <StatusPill status={row.status} />
              </div>

              {/* ✅ CREATED AT ONLY */}
              <div className="col-span-2 text-sm text-gray-700">
                {row.created_at
                  ? new Date(row.created_at).toLocaleDateString()
                  : "-"}
              </div>

              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(row.id);
                  }}
                  className="inline-flex items-center justify-center rounded-full p-2 text-[#3078E2] hover:bg-[#3078E2]/10"
                  title="Open session"
                >
                  <FiEye />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
