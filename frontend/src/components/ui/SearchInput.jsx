import React from "react";
import { FaSearch } from "react-icons/fa";
import { classNames } from "../../utils/helpers";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={classNames("relative w-full", className)}>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 pr-10 text-sm text-[rgb(var(--text))] shadow-sm outline-none transition focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]/20 disabled:bg-[rgb(var(--bg-secondary))] disabled:text-[rgb(var(--text-muted))]"
      />
      <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
    </div>
  );
}
