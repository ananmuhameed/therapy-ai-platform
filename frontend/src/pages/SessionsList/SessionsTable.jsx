import React from "react";
import { FiEye } from "react-icons/fi";
import { classNames } from "../../utils/helpers";
import StatusPill from "../../components/ui/StatusPill";

import TableCard from "../../components/ui/TableCard";
import ClickableRow from "../../components/ui/ClickableRow";

export default function SessionsTable({ loading, error, sessions, onOpen }) {
  return (
    <TableCard
      columns={[
        { label: "#", className: "col-span-1" },
        { label: "Patient", className: "col-span-5" },
        { label: "Date", className: "col-span-3" },
        { label: "Status", className: "col-span-2" },
        { label: "Open", className: "col-span-1 text-right" },
      ]}
      loading={loading}
      error={error}
      rowsCount={sessions.length}
      emptyTitle="No sessions found."
      emptySubtitle="Try changing search."
      skeletonRows={7}
    >
      {sessions.map((s) => {
        const canOpen = Boolean(s.openPath);
        return (
          <ClickableRow
            key={s.id}
            canOpen={canOpen}
            onOpen={() => onOpen(s.openPath)}
            title={canOpen ? "Open session" : "No session to open"}
          >
            <div className="col-span-1 text-sm text-[rgb(var(--text-muted))]">
              {s.indexLabel}
            </div>

            <div className="col-span-5 min-w-0">
              <div className="text-sm text-[rgb(var(--text))] font-medium truncate">
                {s.patientName}
              </div>
              <div className="mt-0.5 text-xs text-[rgb(var(--text-muted))] font-normal">
                Session ID: <span className="font-mono">{s.id}</span>
              </div>
            </div>

            <div className="col-span-3 text-sm text-[rgb(var(--text-muted))]">
              {s.date}
            </div>

            <div className="col-span-2">
              <StatusPill status={s.status} />
            </div>

            <div className="col-span-1 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canOpen) onOpen(s.openPath);
                }}
                disabled={!canOpen}
                className={classNames(
                  "inline-flex items-center justify-center rounded-full p-2 transition",
                  canOpen
                    ? "text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 cursor-pointer"
                    : "text-gray-500 cursor-not-allowed"
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
