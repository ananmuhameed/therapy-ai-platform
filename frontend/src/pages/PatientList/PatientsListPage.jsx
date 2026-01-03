import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { User } from "lucide-react";
import api from "../../api/axiosInstance";

import BackButton from "../../components/ui/BackButton";
import PatientsControls from "./PatientsControls";
import PatientsTable from "./PatientsTable";
import AddPatientForm from "../../components/AddPatientForm/AddPatientForm";

export default function PatientsListPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");

  const [showModal, setShowModal] = useState(false);

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

  const handleViewProfile = (p) => navigate(`/patients/${p.id}`);

  const handleAddPatient = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    fetchPatients();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-screen-2xl px-2 py-6">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate("/dashboard")} />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3078E2]/10">
                <User className="text-[#3078E2]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
                <p className="text-sm text-gray-600">Manage your patient list.</p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchPatients}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
            type="button"
            title="Refresh"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {/* Controls */}
        <PatientsControls
          totalLabel={totalLabel}
          filterGender={filterGender}
          onFilterGenderChange={setFilterGender}
          search={search}
          onSearchChange={setSearch}
          onAddPatient={handleAddPatient}
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
          onAddPatient={handleAddPatient}
        />

        {/* Modal (keep your behavior, just matches style) */}
        {showModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setShowModal(false)} />
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <AddPatientForm onClose={handleCloseModal} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
