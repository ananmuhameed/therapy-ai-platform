import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiPlus, FiUsers, FiX } from "react-icons/fi";
import PatientsList from "../components/PatientsList";
import AddPatientForm from "../components/AddPatientForm/AddPatientForm";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Skeleton({ className }) {
  return (
    <div className={classNames("animate-pulse rounded-md bg-gray-200/70", className)} />
  );
}

export default function PatientsListPage() {
  const navigate = useNavigate();
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const cardBase = "rounded-2xl bg-white shadow-sm ring-1 ring-gray-100";

  useEffect(() => {
    if (searchParams.get("add") === "1") setShowAddPatient(true);
  }, [searchParams]);

  const closeAddPatient = () => {
    setShowAddPatient(false);
    const next = new URLSearchParams(searchParams);
    next.delete("add");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!showAddPatient) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeAddPatient();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddPatient]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-screen-2xl px-2 py-6">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3078E2]/10">
              <FiUsers size={20} className="text-[#3078E2]" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
              <p className="text-sm text-gray-600">
                Manage your patients and open profiles.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddPatient(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
            type="button"
          >
            <FiPlus />
            Add Patient
          </button>
        </div>

        {/* Content Card (Shell) */}
        <div className={classNames(cardBase, "p-4 sm:p-6")}>
        

          <PatientsList
            // no duplication: PatientsList uses classNames internally (it must),
            // but Skeleton/card wrapper are only here
            cardBase={cardBase}
            onAddPatient={() => setShowAddPatient(true)}
            onViewProfile={(p) => navigate(`/patients/${p.id}`)}
            onRenderSkeleton={(count = 6) => (
              <div className="p-4 sm:p-6 space-y-3">
                {Array.from({ length: count }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            )}
          />
        </div>

        {showAddPatient && (
          <Modal onClose={closeAddPatient}>
            <AddPatientForm onClose={closeAddPatient} />
          </Modal>
        )}
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative w-full max-w-[560px] rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            {/* <div className="text-sm font-semibold text-gray-900">{title}</div> */}
            {/* {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null} */}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
            aria-label="Close"
            title="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
