import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePatients } from "../../queries/patients";
import { qk } from "../../queries/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

// Components
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

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      const name = (p.full_name || p.name || "").toLowerCase();
      const gender = String(p.gender || "").toLowerCase();
      const matchSearch = !q || name.includes(q);
      const matchGender =
        filterGender === "all" || gender === filterGender.toLowerCase();
      return matchSearch && matchGender;
    });
  }, [patients, search, filterGender]);

  const totalLabel = useMemo(() => {
    if (isLoading) return "Loading…";
    if (error) return "—";
    return `${filteredPatients.length} shown`;
  }, [isLoading, error, filteredPatients.length]);

  const handleViewProfile = (p) => {
    navigate(`/patients/${p.id}`);
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
        onAddPatient={handleAddPatient}
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
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
              <AddPatientForm onClose={closeAddModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
