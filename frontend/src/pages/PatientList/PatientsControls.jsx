import React from "react";
import { FaChevronDown } from "react-icons/fa";
import SearchInput from "../../components/ui/SearchInput";

export default function PatientsControls({
  totalLabel,
  filterGender,
  onFilterGenderChange,
  search,
  onSearchChange,
  onAddPatient,
}) {
  const selectClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 cursor-pointer appearance-none pr-10";

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-4 sm:p-5 mb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Counts */}
        <div>
          <div className="text-sm font-semibold text-gray-900">All Patients</div>
          <div className="text-xs text-gray-500">{totalLabel}</div>
        </div>

        {/* Right: Filters + Search + Add */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Gender Filter */}
          <div className="relative w-full sm:w-[200px]">
            <select
              value={filterGender}
              onChange={(e) => onFilterGenderChange(e.target.value)}
              className={selectClass}
            >
              <option value="all">All genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Search */}
          <div className="w-full sm:w-[320px]">
            <SearchInput
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name…"
            />
          </div>

          {/* Add */}
          <button
            onClick={onAddPatient}
            className="inline-flex items-center justify-center rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
            type="button"
          >
            Add Patient
          </button>
        </div>
      </div>
    </div>
  );
}
