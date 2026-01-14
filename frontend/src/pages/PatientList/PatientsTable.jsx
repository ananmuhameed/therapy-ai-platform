import React from "react";
import { FiEye } from "react-icons/fi";
import GenderPill from "./GenderPill";
import { calculateAge, classNames, formatDate } from "../../utils/helpers";

import TableCard from "../../components/ui/TableCard";
import ClickableRow from "../../components/ui/ClickableRow";

export default function PatientsTable({
  loading,
  error,
  patients,
  onViewProfile,
  onClearFilters,
  onAddPatient,
}) {
  const formatLastSession = (value) => {
    if (!value) return "—";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return String(value);
    return formatDate(dt, { year: "numeric", month: "short", day: "2-digit" });
  };

  return (
    <TableCard
      columns={[
        { label: "#", className: "col-span-2 text-left" },
        { label: "Name", className: "col-span-3" },
        { label: "Gender", className: "col-span-2 text-center" },
        { label: "Age", className: "col-span-2 text-center" },
        { label: "Last session", className: "col-span-2 text-center" },
        { label: "Open", className: "col-span-1 text-right" },
      ]}
      loading={loading}
      error={error}
      rowsCount={patients.length}
      emptyTitle="No patients found."
      emptySubtitle="Try changing filters or search."
      skeletonRows={7}
      emptyActions={
        <div className="flex justify-center gap-2">
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--card))] px-4 py-2 text-sm font-medium text-[rgb(var(--text))] border border-[rgb(var(--border))] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            type="button"
          >
            Clear filters
          </button>

          <button
            onClick={onAddPatient}
            className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer transition-colors"
            type="button"
          >
            Add Patient
          </button>
        </div>
      }
    >
      {patients.map((p, index) => {
        const name = p.full_name || p.name || "—";
        const age = p.age ?? calculateAge(p.date_of_birth);

        const lastSessionRaw =
          p.last_session_date ??
          p.last_session ??
          p.lastSessionDate ??
          p.lastSession ??
          p.last_session_created_at ??
          p.lastSessionCreatedAt ??
          null;

        const lastSession = formatLastSession(lastSessionRaw);

        const canOpen = Boolean(onViewProfile);

        return (
          <ClickableRow
            key={p.id}
            canOpen={canOpen}
            onOpen={() => onViewProfile?.(p)}
            title="Open patient profile"
          >
            <div className="col-span-2 text-sm text-[rgb(var(--text-muted))] text-left font-mono">
              {index + 1}
            </div>

            <div className="col-span-3 min-w-0">
              <div className="text-sm text-[rgb(var(--text))] font-medium truncate">
                {name}
              </div>
            </div>

            <div className="col-span-2 text-center">
              <GenderPill gender={p.gender} />
            </div>

            <div className="col-span-2 text-sm text-[rgb(var(--text-muted))] text-center">
              {age ?? "—"}
            </div>

            <div className="col-span-2 text-sm text-[rgb(var(--text-muted))] truncate text-center">
              {lastSession}
            </div>

            <div className="col-span-1 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile?.(p);
                }}
                className={classNames(
                  "inline-flex items-center justify-center rounded-full p-2 transition-colors",
                  "text-[rgb(var(--primary))] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
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
