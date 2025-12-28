import  { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

// Components
import PatientsControls from "./PatientsControls";
import PatientsTable from "./PatientsTable";

export default function PatientsListPage() {
  const navigate = useNavigate();

  // --- State ---
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");

  // --- Logic ---
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

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      const name = (p.full_name || p.name || "").toLowerCase();
      const gender = String(p.gender || "").toLowerCase();
      const matchSearch = !q || name.includes(q);
      const matchGender = filterGender === "all" || gender === filterGender.toLowerCase();
      return matchSearch && matchGender;
    });
  }, [patients, search, filterGender]);

  const totalLabel = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return "—";
    return `${filteredPatients.length} shown`;
  }, [loading, error, filteredPatients.length]);

  const handleViewProfile = (p) => {
    navigate(`/patients/${p.id}`);
  };

  const handleAddPatient = () => {
    // Navigate with query param to trigger modal in MainLayout or local modal logic
    navigate("/patients?add=1");
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
        onRefresh={fetchPatients}
        onAddPatient={handleAddPatient}
      />

      {/* 2. Table Section */}
      <PatientsTable 
        loading={loading}
        error={error}
        patients={filteredPatients}
        onViewProfile={handleViewProfile}
        onClearFilters={() => {
            setSearch("");
            setFilterGender("all");
        }}
        onAddPatient={handleAddPatient}
      />
    </div>
  );
}