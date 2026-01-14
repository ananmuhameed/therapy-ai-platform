import { FiEye, FiTrash2 } from "react-icons/fi";
import { classNames } from "../../utils/helpers";
import StatusPill from "../../components/ui/StatusPill";
import Skeleton from "../../components/ui/Skeleton";


export default function SessionsCard({
  sessions,
  loading,
  error,
  onOpenSession,
  onDeleteSession,
}) {
  const cardBase = "rounded-2xl bg-white shadow-sm ring-1 ring-gray-100";

  return (
    <div className={classNames(cardBase, "p-6 lg:col-span-2")}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Sessions</h2>
        <span className="text-xs text-gray-500">{sessions.length} total</span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 text-xs font-medium text-gray-500 px-3 pb-2">
        <div className="col-span-2">#</div>
        <div className="col-span-4">Date</div>
        <div className="col-span-4">Status</div>
        <div className="col-span-2 text-right">Open</div>
      </div>

      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
        {loading && (
          <div className="p-4 space-y-3 bg-white">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-6 bg-white">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="p-10 bg-white text-center">
            <p className="text-sm text-gray-600">No sessions yet.</p>
            <p className="mt-1 text-xs text-gray-500">
              Create a new session for this patient to start the workflow.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          sessions.map((row) => (
            <div
              key={row.id}
              onClick={() => onOpenSession(row.id)}
              className="grid grid-cols-12 items-center px-3 py-3 bg-white hover:bg-gray-50 transition cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpenSession(row.id);
              }}
              title="Open session"
            >
              <div className="col-span-2 text-sm text-gray-700">{row.indexLabel}</div>
              <div className="col-span-4 text-sm text-gray-700">{row.date}</div>
              <div className="col-span-4">
                <StatusPill status={row.status} />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSession(row.id);
                  }}
                  className="inline-flex items-center justify-center rounded-full p-2 text-[#3078E2] hover:bg-[#3078E2]/10 cursor-pointer"
                  title="View session"
                >
                  <FiEye />
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(row.id);
                  }}
                  className="inline-flex items-center justify-center rounded-full p-2 text-red-600 hover:bg-red-100 cursor-pointer"
                  title="Delete session"
                >
                  <FiTrash2 color="#d33" className="cursor-pointer" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}