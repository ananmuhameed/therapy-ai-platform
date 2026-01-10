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
      if (res.isConfirmed) navigate("/therapistprofile");
    });
  };

  // ---- Profile gate (single source of truth) ----
  const refreshProfileBlocked = async () => {
    const { data } = await api.get("/therapist/profile/");
    const completed = data?.is_completed === true;
    setProfileBlocked(!completed);
    return completed;
  };

  // ---- Modal close ----
  const handlePatientAdded = async (created = false) => {
    setShowAddPatient(false);
    if (!created) return;

    try {
      const [pRes, dRes] = await Promise.all([
        api.get("/patients/"),
        api.get("/dashboard/"),
      ]);
      setPatients(pRes.data || []);
      setStats(dRes.data);
    } catch {}
  };


  // ---- Actions ----
  const openAddPatient = async () => {
    const completed = await refreshProfileBlocked();
    if (!completed) return handlePermissionError();
    setShowAddPatient(true);
  };

  const startNewSession = async () => {
    const completed = await refreshProfileBlocked();
    if (!completed) return handlePermissionError();
    navigate("/sessions/new");
  };

  // ---- Load dashboard ----
  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        const [meRes, dRes, sRes, pRes, profRes] = await Promise.all([
          api.get("/auth/me/"),
          api.get("/dashboard/"),
          api.get("/sessions/"),
          api.get("/patients/"),
          api.get("/therapist/profile/"), // ✅ source of truth
        ]);

        setUser(meRes.data);

        const completed = profRes.data?.is_completed === true;
        setProfileBlocked(!completed);

        setStats(dRes.data);
        setSessions(sRes.data || []);
        setPatients(pRes.data || []);
        setUserLoaded(true);
      } catch (err) {
        clearAuth();
        navigate("/login");
      }
    })();
  }, [navigate]);

  const sessionsThisWeekClient = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

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
        Welcome
        {user?.first_name
          ? `, ${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1)}`
          : ""}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox icon={<FiUsers size={22} />} label="Patients" value={stats.patients_count} />
        <StatBox icon={<FiMic size={22} />} label="Sessions this week" value={sessionsThisWeekClient} />
        <StatBox
          icon={<FiFileText size={22} />}
          label="Reports Ready (this week)"
          value={stats.reports_ready_this_week}
        />
      </div>

      <div className="flex gap-4">
        <GradientButton onClick={openAddPatient}>
          <FiPlus /> Add Patient
        </GradientButton>

        <GradientButton onClick={startNewSession}>
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddPatient(false)} />
          <div className="relative z-10 flex min-h-full items-center justify-center p-4">
            <AddPatientForm onClose={handlePatientAdded} />
          </div>
        </div>
      )}
    </div>
  );
}
