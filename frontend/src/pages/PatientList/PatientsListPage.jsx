import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePatients } from "../../queries/patients";
import { qk } from "../../queries/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

import PatientsControls from "./PatientsControls";
import PatientsTable from "./PatientsTable";
import AddPatientForm from "../../components/AddPatientForm/AddPatientForm";

export default function PatientsListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  // --- Logic ---
  const {
    data: patients = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePatients();

  const errorMsg = useMemo(() => {
    if (!error) return "";
    return "Failed to load patients.";
  }, [error]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setShowAdd(params.get("add") === "1");
  }, [location.search]);

  // URL -> modal state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setShowAdd(params.get("add") === "1");
  }, [location.search]);

  // --- Derived ---
  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    const g = String(filterGender).toLowerCase();

    return patients.filter((p) => {
      const name = String(p.full_name || p.name || "").toLowerCase();
      const gender = String(p.gender || "").toLowerCase();

      const matchSearch = !q || name.includes(q);
      const matchGender = g === "all" || gender === g;

      return matchSearch && matchGender;
    });
  }, [patients, search, filterGender]);

  const totalLabel = useMemo(() => {
    if (isLoading) return "Loading…";
    if (error) return "—";
    return `${filteredPatients.length} shown`;
  }, [isLoading, error, filteredPatients.length]);

  // --- Handlers ---
  const handleViewProfile = (p) => navigate(`/patients/${p.id}`);

  // Open/close modal using URL (single source of truth)
  const openAddModal = () => {
    navigate("/patients?add=1", { replace: true });
  };

  const handleAddPatient = () => {
    navigate("/patients?add=1");
  };
  const closeAddModal = () => {
    setShowAdd(false);
    navigate("/patients", { replace: true });
    queryClient.invalidateQueries({ queryKey: qk.patients });
  };

  return (
    <div className="w-full p-6 sm:p-8">
      {/* 1. Controls Section */}
      {/* Controls */}
      <PatientsControls
        totalLabel={totalLabel}
        search={search}
        setSearch={setSearch}
        filterGender={filterGender}
        setFilterGender={setFilterGender}
        onRefresh={refetch}
        onAddPatient={handleAddPatient}
      />

      {/* 2. Table Section */}
      <PatientsTable
        loading={isLoading}
        error={errorMsg}
        patients={filteredPatients}
        onViewProfile={handleViewProfile}
        onClearFilters={() => {
          setSearch("");
          setFilterGender("all");
        }}
        onAddPatient={openAddModal}
      />
      {/*Add Patient Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeAddModal}
          />

          {/* modal */}
          <div className="relative z-10 flex min-h-full items-center justify-center p-4">
            {/* AddPatientForm already has its own width/bg/shadow */}
            <AddPatientForm onClose={closeAddModal} />
          </div>
        </div>
      )}
    </div>
  );
}
