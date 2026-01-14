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
  filterOptions = [],

  // extra buttons
  children,
}) {
  const selectClass =
    "w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] shadow-sm outline-none transition focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]/20 cursor-pointer appearance-none pr-10";

  return (
    <div className="rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-4 sm:p-5 mb-4 transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Counts */}
        <div>
          <div className="text-sm font-semibold text-[rgb(var(--text))]">
            {title}
          </div>
          <div className="text-xs text-[rgb(var(--text-muted))]">
            {totalLabel}
          </div>
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
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
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
