import React from "react";
import { FiEye } from "react-icons/fi";
import { classNames } from "../../utils/helpers";
import StatusPill from "../../components/ui/StatusPill";
import TableCard from "../../components/ui/TableCard";
import ClickableRow from "../../components/ui/ClickableRow";

export default function ReportsTable({ loading, error, reports, onOpen }) {
  return (
    <TableCard
      columns={[
        { label: "#", className: "col-span-2" },
        { label: "Patient", className: "col-span-2" },
        { label: "Date", className: "col-span-3 text-center" },
        { label: "Status", className: "col-span-3 text-center" },
        { label: "Open", className: "col-span-1 text-right" },
      ]}
      loading={loading}
      error={error}
      rowsCount={reports.length}
      emptyTitle="No reports found."
      emptySubtitle="Try changing filters or search."
      skeletonRows={7}
    >
      {reports.map((r) => {
        const canOpen = Boolean(r.openPath);
        const key = `${r.sessionId ?? ""}-${r.id}`;

        return (
          <ClickableRow
            key={key}
            canOpen={canOpen}
            onOpen={() => onOpen(r.openPath)}
            title={canOpen ? "Open session" : "No session to open"}
          >
            <div className="col-span-2 text-sm text-[rgb(var(--text-muted))]">
              {r.indexLabel}
            </div>

            <div className="col-span-2 min-w-0">
              <div className="text-sm text-[rgb(var(--text))] font-medium truncate">
                {r.patientName}
              </div>
            </div>

            <div className="col-span-3 text-sm text-[rgb(var(--text-muted))] text-center">
              {r.date}
            </div>

            <div className="col-span-3 text-center">
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
                  "inline-flex items-center justify-center rounded-full p-2 transition-colors",
                  canOpen
                    ? "text-[rgb(var(--primary))] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    : "text-[rgb(var(--text-muted))] cursor-not-allowed opacity-50"
                )}
                aria-label="View"
                title="View"
                type="button"
              >
                <FiEye />
              </button>
            </div>
          </ClickableRow>
        );
      })}
    </TableCard>
  );
}
