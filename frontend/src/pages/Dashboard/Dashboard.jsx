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
  const [user, setUser] = useState(null);

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

  const sessionsThisWeekClient = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    // Monday as start of week
    const day = (start.getDay() + 6) % 7; // Mon=0 ... Sun=6
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);

    return sessions.filter((s) => {
      const dt = s?.created_at;
      return dt && new Date(dt) >= start;
    }).length;
  }, [sessions]);

  const recentSessionsFormatted = useMemo(() => {
    const pMap = new Map();
    patients.forEach((p) => pMap.set(p.id, p.full_name));

    return [...sessions]
      .sort(
        (a, b) =>
          new Date(b.created_at || b.session_date || 0) -
          new Date(a.created_at || a.session_date || 0)
      )
      .slice(0, 5)
      .map((s, i) => ({
        id: s.id,
        indexLabel: `${i + 1}`,
        name: pMap.get(s.patient) || (s.patient ? `Patient #${s.patient}` : "—"),
        created_at: s.created_at || s.session_date || null,
        status: s.status,
      }));
  }, [sessions, patients]);

  if (!userLoaded) return <div>Loading...</div>;

  return (
    <div className="p-10 space-y-8 relative">
      <h1 style={{ fontSize: 32, color: "#727473" }} className="font-semibold">
        Welcome{user?.first_name ? `, ${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1)}` : ""}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox icon={<FiUsers size={22} />} label="Patients" value={stats.patients_count} />
        <StatBox
          icon={<FiMic size={22} />}
          label="Sessions this week"
          value={sessionsThisWeekClient}
        />
        <StatBox
          icon={<FiFileText size={22} />}
          label="Reports Ready (this week)"
          value={stats.reports_ready_this_week}
        />
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
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAddPatient(false)}
          />
          <div className="relative z-10 flex min-h-full items-center justify-center p-4">
            <AddPatientForm onClose={handlePatientAdded} />
          </div>
        </div>
      )}

    </div>
  );
}
