import React from "react";
import { FiArrowLeft } from "react-icons/fi";

export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--card))] text-[rgb(var(--text))] border border-[rgb(var(--border))] shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
      aria-label="Back"
      type="button"
    >
      <FiArrowLeft className="text-[rgb(var(--primary))]" size={20} />
    </button>
  );
}
