import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiUsers } from "react-icons/fi";

import api from "../../api/axiosInstance";
import { usePatients } from "../../queries/patients";
import { qk } from "../../queries/queryKeys";

import BackButton from "../../components/ui/BackButton";
import PatientsControls from "./PatientsControls";
import PatientsTable from "./PatientsTable";
import AddPatientForm from "../../components/AddPatientForm/AddPatientForm";

export default function PatientsListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  // Sessions (for "Last session" column)
  const [sessions, setSessions] = useState([]);

  // Data
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

  // URL -> modal state (single source of truth)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setShowAdd(params.get("add") === "1");
  }, [location.search]);

  // Fetch sessions once (needed for last session date per patient)
  useEffect(() => {
    api
      .get("/sessions/")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.results || [];
        setSessions(list);
      })
      .catch(() => {
        setSessions([]);
      });
  }, []);

  // Derived: filter patients by search + gender
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

  // Build map: patientId -> latest session datetime (created_at preferred)
  const lastSessionByPatientId = useMemo(() => {
    const map = new Map();

    for (const s of sessions) {
      const pid = s?.patient;
      const dt = s?.created_at || s?.session_date || s?.updated_at || null;
      if (!pid || !dt) continue;

      const prev = map.get(pid);
      if (!prev || new Date(dt) > new Date(prev)) {
        map.set(pid, dt);
      }
    }

    return map;
  }, [sessions]);

  // Enrich filtered patients with last_session_date so PatientsTable can render it
  const filteredPatientsEnriched = useMemo(() => {
    return filteredPatients.map((p) => ({
      ...p,
      last_session_date: lastSessionByPatientId.get(p.id) || null,
    }));
  }, [filteredPatients, lastSessionByPatientId]);

  const totalLabel = useMemo(() => {
    if (isLoading) return "Loading…";
    if (error) return "—";
    return `${filteredPatientsEnriched.length} shown`;
  }, [isLoading, error, filteredPatientsEnriched.length]);

  // Handlers
  const handleViewProfile = (p) => navigate(`/patients/${p.id}`);

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
    // optional: refresh sessions too so last_session updates after adding sessions elsewhere
    api
      .get("/sessions/")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.results || [];
        setSessions(list);
      })
      .catch(() => {});
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
                <FiUsers className="text-[#3078E2]" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Patients
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your patients list.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Controls */}
        <PatientsControls
          totalLabel={totalLabel}
          search={search}
          onSearchChange={setSearch}
          filterGender={filterGender}
          onFilterGenderChange={setFilterGender}
          onAddPatient={handleAddPatient}
        />

        {/* Table */}
        <PatientsTable
          loading={isLoading}
          error={errorMsg}
          patients={filteredPatientsEnriched}
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
    </div>
  );
}
