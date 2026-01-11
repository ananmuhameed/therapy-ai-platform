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

    // If it's already a nice label (not a date), keep it
    // Otherwise format as a date.
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
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
            type="button"
          >
            Clear filters
          </button>

          <button
            onClick={onAddPatient}
            className="inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
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

        // ✅ support multiple possible backend keys
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
            {/* # */}
            <div className="col-span-2 text-sm text-gray-700 text-left font-mono">
              {index + 1}
            </div>

            {/* Name */}
            <div className="col-span-3 min-w-0">
              <div className="text-sm text-gray-900 font-medium truncate">
                {name}
              </div>
            </div>

            <div className="col-span-2 text-center">
              <GenderPill gender={p.gender} />
            </div>

            <div className="col-span-2 text-sm text-gray-700 text-center">
              {age ?? "—"}
            </div>

            <div className="col-span-2 text-sm text-gray-700 truncate text-center">
              {lastSession}
            </div>

            <div className="col-span-1 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile?.(p);
                }}
                className={classNames(
                  "inline-flex items-center justify-center rounded-full p-2",
                  "text-[#3078E2] hover:bg-[#3078E2]/10 cursor-pointer"
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
