import React from "react";
import { FiArrowLeft } from "react-icons/fi";

export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
      aria-label="Back"
      type="button"
    >
      <FiArrowLeft className="text-[#3078E2]" size={20} />
    </button>
  );
}