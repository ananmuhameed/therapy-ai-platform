import React from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { IoAddCircleOutline } from "react-icons/io5";
import { FiRefreshCw } from "react-icons/fi";
import { classNames } from "../../utils/helpers";

export default function PatientsControls({
  totalLabel,
  search,
  setSearch,
  filterGender,
  setFilterGender,
  onRefresh,
  onAddPatient,
}) {
  const inputBase = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 disabled:bg-gray-50 disabled:text-gray-500";

  return (
    <div className="mb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Title & Refresh */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Patient List</div>
            <div className="text-xs text-gray-500">{totalLabel}</div>
          </div>

          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
            title="Refresh"
            type="button"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {/* Right: Filters & Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Gender Filter */}
          <div className="relative w-full sm:w-[180px]">
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className={classNames(inputBase, "appearance-none pr-10 capitalize cursor-pointer")}
            >
              <option value="all">All genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-[320px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              className={classNames(inputBase, "pr-10")}
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Add Button */}
          <button
            onClick={onAddPatient}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
            type="button"
          >
            <IoAddCircleOutline className="text-xl" />
            Add Patient
          </button>
        </div>
      </div>
    </div>
  );
}