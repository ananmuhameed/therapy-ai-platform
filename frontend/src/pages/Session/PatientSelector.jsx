import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";

export default function PatientSelector({ patients = [], selectedId, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch(""); // optional: clear search when closing
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();

    return patients.filter((p) => {
      const name = (p.name || p.full_name || p.fullName || "").toLowerCase();
      const phone = (p.contact_phone || p.contactPhone || "").toLowerCase();
      const nationalId = (p.patient_id || p.patientId || "").toLowerCase(); // <- add this

      return !q || name.includes(q) || phone.includes(q) || nationalId.includes(q);
    });
  }, [patients, search]);


  const selectedPatient = useMemo(
    () => patients.find((p) => String(p.id) === String(selectedId)),
    [patients, selectedId]
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-[520px]">
      {/* Input */}
      <div
        className="w-full h-[58px] rounded-[18px] border border-[rgb(var(--border))] bg-[rgb(var(--card))] pl-6 pr-14 flex items-center cursor-text outline-none focus-within:ring-2 focus-within:ring-[rgb(var(--primary))]/20 transition-all"
        onClick={() => setOpen(true)}
      >
        <FiSearch className="text-[rgb(var(--text-muted))] mr-3" size={16} />

        <input
          type="text"
          value={open ? search : (selectedPatient?.full_name || selectedPatient?.name || selectedPatient?.fullName || "")}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          placeholder="Search patient…"
          className="flex-1 bg-transparent outline-none text-base font-light text-[rgb(var(--text))]"
        />

        <FiChevronDown
          size={18}
          className={`ml-2 text-[rgb(var(--text-muted))] pointer-events-none transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-[16px] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg overflow-hidden">
          {/* 
            Show "first 5" by height, but allow scroll for the rest.
            Each item ~48px (py-3 + text). 5 items ≈ 240px.
          */}
          <div className="max-h-[240px] overflow-auto">
            {filteredPatients.length === 0 && (
              <div className="px-5 py-3 text-sm text-[rgb(var(--text-muted))]">
                No patients found
              </div>
            )}

            {filteredPatients.map((p) => {
              const label = p.name || p.full_name || p.fullName || `Patient #${p.id}`;
              const isSelected = String(p.id) === String(selectedId);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-5 py-3 hover:bg-black/5 transition-colors ${isSelected ? "bg-black/5" : ""
                    }`}
                >
                  <p className="text-sm font-medium text-[rgb(var(--text))]">
                    {label}
                  </p>

                  {(p.contact_phone || p.contactPhone) && (
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                      {p.contact_phone || p.contactPhone}
                    </p>
                  )}
                  {search.trim() && (p.patient_id || p.patientId) && (
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                      National ID: {p.patient_id || p.patientId}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}