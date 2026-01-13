import { FiEye } from "react-icons/fi";
import { classNames } from "../../utils/helpers";
import StatusPill from "../../components/ui/StatusPill";
import Skeleton from "../../components/ui/Skeleton";

export default function SessionsCard({ sessions, loading, error, onOpenSession }) {
  const cardBase =
    "rounded-2xl bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))]";

  return (
    <div className={classNames(cardBase, "p-6 lg:col-span-2 text-[rgb(var(--text))]")}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Sessions</h2>
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {sessions.length} total
        </span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 text-xs font-medium text-[rgb(var(--text-muted))] px-3 pb-2">
        <div className="col-span-2">#</div>
        <div className="col-span-4">Date</div>
        <div className="col-span-4">Status</div>
        <div className="col-span-2 text-right">Open</div>
      </div>

      <div className="divide-y divide-[rgb(var(--border))] rounded-2xl border border-[rgb(var(--border))] overflow-hidden">
        {loading && (
          <div className="p-4 space-y-3 bg-[rgb(var(--card))]">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-6 bg-[rgb(var(--card))]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="p-10 bg-[rgb(var(--card))] text-center">
            <p className="text-sm text-[rgb(var(--text-muted))]">No sessions yet.</p>
            <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
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
              className="grid grid-cols-12 items-center px-3 py-3 bg-[rgb(var(--card))] hover:bg-[rgb(var(--hover))] transition cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpenSession(row.id);
              }}
              title="Open session"
            >
              <div className="col-span-2 text-sm text-[rgb(var(--text-muted))]">
                {row.indexLabel}
              </div>
              <div className="col-span-4 text-sm text-[rgb(var(--text-muted))]">
                {row.date}
              </div>
              <div className="col-span-4">
                <StatusPill status={row.status} />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSession(row.id);
                  }}
                  className="inline-flex items-center justify-center rounded-full p-2 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 cursor-pointer"
                  title="View session"
                  type="button"
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
