import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { getAccessToken, clearAuth } from "../../auth/storage";
import { FiUsers, FiMic, FiFileText, FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";

import StatBox from "./StatBox";
import RecentSessionsTable from "./RecentSessionsTable";
import GradientButton from "../../components/ui/GradientButton";
import AddPatientForm from "../../components/AddPatientForm/AddPatientForm";

export default function Dashboard() {
  const navigate = useNavigate();

  const [userLoaded, setUserLoaded] = useState(false);
  const [profileBlocked, setProfileBlocked] = useState(false); 

  const [stats, setStats] = useState({
    patients_count: 0,
    sessions_this_week: 0,
    reports_ready_this_week: 0,
  });
  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showAddPatient, setShowAddPatient] = useState(false);

  // ---- Alert ----
  const handlePermissionError = () => {
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

  // ---- Actions ----
  const openAddPatient = async () => {
    if (profileBlocked) {
      handlePermissionError();
      return;
    }

    try {
      await api.post("/patients/", {}); // backend permission check
    } catch (err) {
      if (err.response?.status === 403) {
        setProfileBlocked(true);
        handlePermissionError();
        return;
      }
    }

    setShowAddPatient(true);
  };

  const startNewSession = async () => {
    if (profileBlocked) {
      handlePermissionError();
      return;
    }

    try {
      await api.post("/sessions/", {}); // backend permission check
    } catch (err) {
      if (err.response?.status === 403) {
        setProfileBlocked(true);
        handlePermissionError();
        return;
      }
    }

    navigate("/sessions/new");
  };

  // ---- Load dashboard ----
  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login", { replace: true });
      return;
    }

    Promise.all([
      api.get("/dashboard/"),
      api.get("/sessions/"),
      api.get("/patients/"),
    ])
      .then(([d, s, p]) => {
        setStats(d.data);
        setSessions(s.data || []);
        setPatients(p.data || []);
        setUserLoaded(true);
      })
      .catch(() => {
        clearAuth();
        navigate("/login");
      });
  }, [navigate]);

  const recentSessionsFormatted = useMemo(() => {
    const pMap = new Map();
    patients.forEach((p) => pMap.set(p.id, p.full_name));

    return sessions.slice(0, 3).map((s, i) => ({
      id: s.id,
      indexLabel: `${i + 1}`,
      name: pMap.get(s.patient),
      created_at: s.created_at,
      status: s.status,
    }));
  }, [sessions, patients]);

  if (!userLoaded) return <div>Loading...</div>;

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-semibold text-[#727473]">
        Therapist Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox icon={<FiUsers />} label="Patients" value={stats.patients_count} />
        <StatBox icon={<FiMic />} label="Sessions this week" value={stats.sessions_this_week} />
        <StatBox icon={<FiFileText />} label="Reports Ready" value={stats.reports_ready_this_week} />
      </div>

      <div className="flex gap-4">
        <GradientButton
          disabled={profileBlocked}
          onClick={openAddPatient}
        >
          <FiPlus /> Add Patient
        </GradientButton>

        <GradientButton
          disabled={profileBlocked}
          onClick={startNewSession}
        >
          <FiMic /> New Session
        </GradientButton>
      </div>

      <RecentSessionsTable
        sessions={recentSessionsFormatted}
        onViewAll={() => navigate("/sessions")}
        onRowClick={(id) => navigate(`/sessions/${id}`)}
      />

      {showAddPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <AddPatientForm onClose={() => setShowAddPatient(false)} />
        </div>
      )}
    </div>
  );
}
