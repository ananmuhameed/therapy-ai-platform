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
            <div className="col-span-2 text-sm text-gray-700">{r.indexLabel}</div>

            <div className="col-span-2 min-w-0">
              <div className="text-sm text-gray-900 font-medium truncate">
                {r.patientName}
              </div>
              {/* <div className="mt-0.5 text-xs text-gray-500 font-normal">
                Session ID:{" "}
                <span className="font-mono">{r.sessionId ?? "—"}</span>
              </div> */}
            </div>

            <div className="col-span-3 text-sm text-gray-700 text-center">{r.date}</div>

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
          </ClickableRow>
        );
      })}
    </TableCard>
  );
}
