import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PatientsList from "../components/PatientsList";
import AddPatientForm from "../components/AddPatientForm/AddPatientForm";

const PatientsListPage = () => {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // open modal if URL has ?add=1 (from Dashboard button)
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setShowAddPatient(true);
    }
  }, [searchParams]);

  // ESC + scroll lock
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

  const closeAddPatient = () => {
    setShowAddPatient(false);
    // remove ?add=1 from URL so refresh/back doesn't reopen it
    searchParams.delete("add");
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="w-full flex justify-center px-10 py-14">
      <PatientsList
        onAddPatient={() => setShowAddPatient(true)}
        onViewProfile={(p) => console.log("view profile", p)}
      />

      {showAddPatient && (
        <Modal onClose={closeAddPatient}>
          <AddPatientForm onClose={closeAddPatient} />
        </Modal>
      )}
    </div>
  );
};

export default PatientsListPage;

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[520px] rounded-2xl bg-white shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}
