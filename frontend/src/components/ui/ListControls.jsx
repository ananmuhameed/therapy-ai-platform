import React from "react";
import { FaChevronDown } from "react-icons/fa";
import SearchInput from "./SearchInput";

export default function ListControls({
  title,
  totalLabel,

  // search
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",

  // filter
  filterValue,
  onFilterChange,
  filterPlaceholder = "All",
  filterOptions = [], // [{ value, label }]

  // extra buttons (Add, etc.)
  children,
}) {
  const selectClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 cursor-pointer appearance-none pr-10";

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-4 sm:p-5 mb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Counts */}
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          <div className="text-xs text-gray-500">{totalLabel}</div>
        </div>

        {/* Right: Filter + Search + Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Filter */}
          <div className="relative w-full sm:w-[200px]">
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className={selectClass}
            >
              <option value="all">{filterPlaceholder}</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Search */}
          <div className="w-full sm:w-[320px]">
            <SearchInput
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>

          {/* Actions */}
          {children}
        </div>
      </div>
    </div>
  );
}
