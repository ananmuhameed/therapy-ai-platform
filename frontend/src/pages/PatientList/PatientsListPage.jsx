import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import Swal from "sweetalert2";

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

  const [showAdd, setShowAdd] = useState(false);
  const [profileBlocked, setProfileBlocked] = useState(false); 

  // --- Alert ---
  const showProfileAlert = () => {
    Swal.fire({
      icon: "warning",
      iconColor: "#3078E2",
      title: "Profile incomplete",
      text: "Please complete your profile first.",
      showCancelButton: true,
      confirmButtonText: "Go to profile",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3078E2",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-2xl",
        cancelButton: "rounded-2xl",
      },
    }).then((res) => {
      if (res.isConfirmed) {
        navigate("/therapistprofile");
      }
    });
  };

  // --- Data ---
  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/patients/");
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setPatients(list);
    } catch (err) {
      const status = err?.response?.status;
      let msg = "Failed to load patients.";

      if (status === 401) msg = "Unauthorized. Please login again.";
      else if (status === 403) msg = "Forbidden. You don’t have permission.";

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

      return (!q || name.includes(q)) && (g === "all" || gender === g);
    });
  }, [patients, search, filterGender]);

  const totalLabel = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return "—";
    return `${filteredPatients.length} shown`;
  }, [loading, error, filteredPatients.length]);

  // --- Handlers ---
  const handleViewProfile = (p) => navigate(`/patients/${p.id}`);

  // 🔒 BACKEND-DRIVEN add patient
  const openAddModal = async () => {
    if (profileBlocked) {
      showProfileAlert();
      return;
    }

    try {
      // dry-run permission check
      await api.post("/patients/", {});
    } catch (err) {
      if (err.response?.status === 403) {
        setProfileBlocked(true);
        showProfileAlert();
        return;
      }
    }

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
        addDisabled={profileBlocked} 
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
        addDisabled={profileBlocked} 
      />

      {/* Add Patient Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeAddModal}
          />

          <div className="relative z-10 flex min-h-full items-center justify-center p-4">
            <AddPatientForm onClose={closeAddModal} />
          </div>
        </div>
      )}
    </div>
  );
}
