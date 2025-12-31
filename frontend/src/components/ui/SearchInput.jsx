import React from "react";
import { FaSearch } from "react-icons/fa";
import { classNames } from "../../utils/helpers";

export default function SearchInput({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={classNames("relative w-full", className)}>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 disabled:bg-gray-50 disabled:text-gray-500"
      />
      <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}