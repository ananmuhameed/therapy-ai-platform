import React from "react";
import { FiChevronDown } from "react-icons/fi";

export default function PatientSelector({ patients, selectedId, onChange }) {
  return (
    <div className="relative w-full max-w-[520px]">
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[58px] rounded-[18px] border border-black/5 bg-[#F5F5F5] pl-6 pr-14 text-base font-light text-[#727473] outline-none appearance-none focus:ring-2 focus:ring-[#3078E2]/20 transition-all"
      >
        <option value="" disabled>
          Select patient
        </option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
             {p.name || p.full_name || p.fullName || `Patient #${p.id}`}
          </option>
        ))}
      </select>

      <span className="absolute right-[18px] top-1/2 -translate-y-1/2 text-black/70 pointer-events-none">
        <FiChevronDown size={18} />
      </span>
    </div>
  );
}