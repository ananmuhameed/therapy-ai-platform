import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";

import PatientsControls from "./PatientsControls";
import PatientsTable from "./PatientsTable";
import AddPatientForm from "../../components/AddPatientForm/AddPatientForm";

export default function PatientsListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- State ---
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");

  // Modal driven by URL: /patients?add=1
  const [showAdd, setShowAdd] = useState(false);

  // --- Data ---
  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/patients/");
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setPatients(list);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      let msg = "Failed to load patients.";
      if (status === 401) msg = "Unauthorized. Please login again.";
      else if (status === 403) msg = "Forbidden. You don’t have permission.";
      else if (status === 404) msg = "Patients not found.";
      else if (data?.detail) msg = data.detail;

      setError(msg);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

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
    if (loading) return "Loading…";
    if (error) return "—";
    return `${filteredPatients.length} shown`;
  }, [loading, error, filteredPatients.length]);

  // --- Handlers ---
  const handleViewProfile = (p) => navigate(`/patients/${p.id}`);

  // Open/close modal using URL (single source of truth)
  const openAddModal = () => {
    navigate("/patients?add=1", { replace: true });
  };

  const closeAddModal = () => {
    navigate("/patients", { replace: true });
    fetchPatients();
  };

  return (
    <div className="w-full p-6 sm:p-8">
      {/* Controls */}
      <PatientsControls
        totalLabel={totalLabel}
        search={search}
        setSearch={setSearch}
        filterGender={filterGender}
        setFilterGender={setFilterGender}
        onRefresh={fetchPatients}
        onAddPatient={openAddModal}
      />

      {/* Table */}
      <PatientsTable
        loading={loading}
        error={error}
        patients={filteredPatients}
        onViewProfile={handleViewProfile}
        onClearFilters={() => {
          setSearch("");
          setFilterGender("all");
        }}
        onAddPatient={openAddModal}
      />

      {/* Add Patient Modal */}
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
