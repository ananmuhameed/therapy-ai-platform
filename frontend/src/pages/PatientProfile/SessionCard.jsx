import { FiEye, FiTrash2, FiPlus } from "react-icons/fi";
import { classNames } from "../../utils/helpers";
import StatusPill from "../../components/ui/StatusPill";
import Skeleton from "../../components/ui/Skeleton";


export default function SessionsCard({
  sessions,
  loading,
  error,
  onOpenSession,
  onDeleteSession,
  onCreateSession,
}) {
  // Dark-mode capable base styles (from 2nd file)
  const cardBase =
    "rounded-2xl bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))]";

  const rowBase =
    "grid grid-cols-12 items-center px-3 py-3 bg-[rgb(var(--card))] hover:bg-[rgb(var(--bg-soft))] transition cursor-pointer";

  const textMuted = "text-[rgb(var(--text-muted))]";
  const textMain = "text-[rgb(var(--text))]";

  return (
    <div className={classNames(cardBase, "p-6 lg:col-span-2")}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={classNames("text-sm font-semibold", textMain)}>
          Sessions
        </h2>

        <div className="flex items-center gap-2">
          <span className={classNames("text-xs", textMuted)}>
            {sessions.length} total
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCreateSession?.();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!onCreateSession}
            title="Create a new session"
          >
            <FiPlus /> Create
          </button>
        </div>
      </div>


      {/* Table header */}
      <div
        className={classNames(
          "grid grid-cols-12 text-xs font-medium px-3 pb-2",
          textMuted
        )}
      >
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
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="p-10 bg-[rgb(var(--card))] text-center">
            <p className={classNames("text-sm", textMuted)}>No sessions yet.</p>
            <p className={classNames("mt-1 text-xs", textMuted)}>
              Create a new session for this patient to start the workflow.
            </p>

            {onCreateSession && (
              <button
                type="button"
                onClick={onCreateSession}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90"
              >
                <FiPlus /> Create Session
              </button>
            )}
          </div>
        )}

        {!loading &&
          !error &&
          sessions.map((row) => (
            <div
              key={row.id}
              onClick={() => onOpenSession(row.id)}
              className={rowBase}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpenSession(row.id);
              }}
              title="Open session"
            >
              <div className={classNames("col-span-2 text-sm", textMain)}>
                {row.indexLabel}
              </div>
              <div className={classNames("col-span-4 text-sm", textMain)}>
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
                  className="inline-flex items-center justify-center rounded-full p-2 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 transition"
                  title="View session"
                >
                  <FiEye />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(row.id);
                  }}
                  className="inline-flex items-center justify-center rounded-full p-2 text-red-500 hover:bg-red-500/10 transition"
                  title="Delete session"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
