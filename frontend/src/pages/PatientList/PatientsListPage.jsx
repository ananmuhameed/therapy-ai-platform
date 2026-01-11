import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiUsers } from "react-icons/fi";
import Swal from "sweetalert2";

import api from "../../api/axiosInstance";
import { usePatients } from "../../queries/patients";
import { qk } from "../../queries/queryKeys";

import BackButton from "../../components/ui/BackButton";
import PatientsControls from "./PatientsControls";
import PatientsTable from "./PatientsTable";
import AddPatientForm from "../../components/AddPatientForm/AddPatientForm";

export default function PatientsListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // UI state
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [profileBlocked, setProfileBlocked] = useState(false);

  // sessions for "Last session" column
  const [sessions, setSessions] = useState([]);

  // React Query data
  const {
    data: patients = [],
    isLoading,
    isFetching,
    error,
  } = usePatients();

  // URL controls the modal
  const showAdd = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("add") === "1";
  }, [location.search]);

  // --- Alert ---
  const showProfileAlert = useCallback(() => {
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
      if (res.isConfirmed) navigate("/therapistprofile");
    });
  }, [navigate]);

  // ⚠️ IMPORTANT:
  // This "permission check" is risky if POST /patients/ creates a row.
  // If you *must* check, use a safe endpoint like /therapist/profile/ or a dedicated /permissions/ endpoint.
  // For now, we'll only block if we already detected 403 earlier (e.g., from form submit), not by creating data.

  const openAddModal = useCallback(() => {
    if (profileBlocked) {
      showProfileAlert();
      return;
    }
    navigate("/patients?add=1", { replace: true });
  }, [navigate, profileBlocked, showProfileAlert]);

  const closeAddModal = useCallback(() => {
    navigate("/patients", { replace: true });
    queryClient.invalidateQueries({ queryKey: qk.patients });

    // refresh sessions too (optional)
    api
      .get("/sessions/")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.results || [];
        setSessions(list);
      })
      .catch(() => {});
  }, [navigate, queryClient]);

  // Fetch sessions once (needed for last session date per patient)
  useEffect(() => {
    api
      .get("/sessions/")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.results || [];
        setSessions(list);
      })
      .catch(() => setSessions([]));
  }, []);

  // Derived: filter patients by search + gender
  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    const g = String(filterGender).toLowerCase();

    return (patients || []).filter((p) => {
      const name = String(p.full_name || p.name || "").toLowerCase();
      const gender = String(p.gender || "").toLowerCase();
      return (!q || name.includes(q)) && (g === "all" || gender === g);
    });
  }, [patients, search, filterGender]);

  // Build map: patientId -> latest session datetime
  const lastSessionByPatientId = useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      const pid = s?.patient;
      const dt = s?.created_at || s?.session_date || s?.updated_at || null;
      if (!pid || !dt) continue;

      const prev = map.get(pid);
      if (!prev || new Date(dt) > new Date(prev)) map.set(pid, dt);
    }
    return map;
  }, [sessions]);

  // Enrich patients
  const filteredPatientsEnriched = useMemo(() => {
    return filteredPatients.map((p) => ({
      ...p,
      last_session_date: lastSessionByPatientId.get(p.id) || null,
    }));
  }, [filteredPatients, lastSessionByPatientId]);

  const totalLabel = useMemo(() => {
    if (isLoading || isFetching) return "Loading…";
    if (error) return "—";
    return `${filteredPatientsEnriched.length} shown`;
  }, [isLoading, isFetching, error, filteredPatientsEnriched.length]);

  const handleViewProfile = (p) => navigate(`/patients/${p.id}`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-screen-2xl px-2 py-6">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate("/dashboard")} />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3078E2]/10">
                <FiUsers className="text-[#3078E2]" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
                <p className="text-sm text-gray-600">Manage your patients list.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <PatientsControls
          totalLabel={totalLabel}
          search={search}
          onSearchChange={setSearch}
          filterGender={filterGender}
          onFilterGenderChange={setFilterGender}
          onAddPatient={openAddModal}
          addDisabled={profileBlocked}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: qk.patients })}
        />

        {/* Table */}
        <PatientsTable
          loading={isLoading || isFetching}
          error={error ? "Failed to load patients." : ""}
          patients={filteredPatientsEnriched}
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
              <AddPatientForm
                onClose={closeAddModal}
                // If your AddPatientForm detects 403, setProfileBlocked(true) there and call showProfileAlert()
                // e.g., onPermissionDenied={() => { setProfileBlocked(true); showProfileAlert(); closeAddModal(); }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
