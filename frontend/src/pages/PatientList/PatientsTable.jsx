import React from "react";
import { FiEye } from "react-icons/fi";
import Skeleton from "../../components/ui/Skeleton";
import GenderPill from "./GenderPill";
import { calculateAge, classNames } from "../../utils/helpers";

export default function PatientsTable({
  loading,
  error,
  patients,
  onViewProfile,
  onClearFilters,
  onAddPatient,
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 border-b border-gray-100 bg-white">
        <div className="col-span-5">Patient</div>
        <div className="col-span-2">Gender</div>
        <div className="col-span-2">Age</div>
        <div className="col-span-2">Last session</div>
        <div className="col-span-1 text-right">Open</div>
      </div>

      <div className="min-h-[420px] bg-white">
        {/* Loading */}
        {loading && (
          <div className="p-4 sm:p-6 space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-6">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <p className="mt-2 text-sm text-gray-600">
              Check your token / permissions and the patients endpoint.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && patients.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-700 font-medium">No patients found.</p>
            <p className="mt-1 text-xs text-gray-500">Try changing filters or search.</p>

            <div className="mt-4 flex justify-center gap-2">
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
          </div>
        )}

        {/* Rows */}
        {!loading && !error && patients.length > 0 && (
          <div className="divide-y divide-gray-100">
            {patients.map((p) => {
              const name = p.full_name || p.name || "—";
              const age = p.age ?? calculateAge(p.date_of_birth);
              const lastSession =
                p.last_session || p.last_session_date || p.lastSession || "—";

              return (
                <div
                  key={p.id}
                  onClick={() => onViewProfile?.(p)}
                  className="grid grid-cols-12 items-center px-4 sm:px-6 py-3 bg-white transition hover:bg-gray-50 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onViewProfile?.(p);
                  }}
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
