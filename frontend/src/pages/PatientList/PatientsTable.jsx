import React from "react";
import { FiEye } from "react-icons/fi";
import GenderPill from "./GenderPill";
import { calculateAge, classNames } from "../../utils/helpers";

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
  return (
    <TableCard
      columns={[
        { label: "Patient", className: "col-span-5" },
        { label: "Gender", className: "col-span-2" },
        { label: "Age", className: "col-span-2" },
        { label: "Last session", className: "col-span-2" },
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
      {patients.map((p) => {
        const name = p.full_name || p.name || "—";
        const age = p.age ?? calculateAge(p.date_of_birth);
        const lastSession = p.last_session || p.last_session_date || p.lastSession || "—";

        const canOpen = Boolean(onViewProfile);
        return (
          <ClickableRow
            key={p.id}
            canOpen={canOpen}
            onOpen={() => onViewProfile?.(p)}
            title="Open patient profile"
          >
            <div className="col-span-5 min-w-0">
              <div className="text-sm text-gray-900 font-medium truncate">{name}</div>
              <div className="mt-0.5 text-xs text-gray-500 font-normal">
                ID: <span className="font-mono">{p.id}</span>
              </div>
            </div>

            <div className="col-span-2">
              <GenderPill gender={p.gender} />
            </div>

            <div className="col-span-2 text-sm text-gray-700">{age}</div>

            <div className="col-span-2 text-sm text-gray-700 truncate">{lastSession}</div>

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
