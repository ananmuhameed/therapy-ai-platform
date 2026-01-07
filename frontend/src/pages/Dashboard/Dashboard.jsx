import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import { getUser, getAccessToken, clearAuth } from "../../auth/storage";
import { FiUsers, FiMic, FiFileText, FiPlus } from "react-icons/fi";
import { formatDate } from "../../utils/helpers";

import StatBox from "./StatBox";
import RecentSessionsTable from "./RecentSessionsTable";
import GradientButton from "../../components/ui/GradientButton";
import AddPatientForm from "../../components/AddPatientForm/AddPatientForm";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    patients_count: 0,
    sessions_this_week: 0,
    reports_ready_this_week: 0,
  });

  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);

  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  const [showAddPatient, setShowAddPatient] = useState(false);

  const fetchDashboardData = () => {
    // Stats
    api
      .get("/dashboard/")
      .then(({ data }) => {
        setStats({
          patients_count: data?.patients_count ?? 0,
          sessions_this_week: data?.sessions_this_week ?? 0,
          reports_ready_this_week: data?.reports_ready_this_week ?? 0,
        });
      })
      .catch((err) => {
        console.error(err);
        setStats({
          patients_count: 0,
          sessions_this_week: 0,
          reports_ready_this_week: 0,
        });
      });

    // Sessions + Patients for recent table
    setSessionsLoading(true);
    setSessionsError("");

    Promise.all([api.get("/sessions/"), api.get("/patients/")])
      .then(([sRes, pRes]) => {
        const sList = Array.isArray(sRes.data) ? sRes.data : sRes.data?.results || [];
        const pList = Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || [];
        setSessions(sList);
        setPatients(pList);
      })
      .catch((err) => {
        console.error(err);
        setSessionsError("Failed to load sessions");
        setSessions([]);
        setPatients([]);
      })
      .finally(() => setSessionsLoading(false));
  };

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login", { replace: true });
      return;
    }

    const cached = getUser();
    if (cached) setUser(cached);

    api
      .get("/auth/me/")
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {
        clearAuth();
        navigate("/login");
      });

    fetchDashboardData();
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
    patients.forEach((p) =>
      pMap.set(p.id, p.full_name || p.name || `Patient #${p.id}`)
    );

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

  const handlePatientAdded = () => {
    setShowAddPatient(false);
    fetchDashboardData();
  };

  if (!user) return <div className="p-8"><h2>Loading...</h2></div>;

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

      <div className="flex gap-4 items-center">
        <GradientButton onClick={() => setShowAddPatient(true)}>
          <FiPlus size={18} /> Add Patient
        </GradientButton>

        <Link to="/sessions/new" className="no-underline">
          <GradientButton>
            <FiMic size={18} /> New Session
          </GradientButton>
        </Link>
      </div>

      <RecentSessionsTable
        sessions={recentSessionsFormatted}
        loading={sessionsLoading}
        error={sessionsError}
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
