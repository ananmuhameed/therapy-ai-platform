import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import { getUser, getAccessToken, clearAuth } from "../../auth/storage";
import { FiUsers, FiMic, FiFileText, FiPlus } from "react-icons/fi";
import { formatDate } from "../../utils/helpers";

import StatBox from "./StatBox";
import RecentSessionsTable from "./RecentSessionsTable";
import GradientButton from "../../components/ui/GradientButton";
import AddPatientForm from "../../components/AddPatientForm/AddPatientForm"; // 1. Import the form

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ patients_count: 0, sessions_this_week: 0, reports_ready: 0 });
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [patients, setPatients] = useState([]);

  // 2. Add state for the modal
  const [showAddPatient, setShowAddPatient] = useState(false);

  // Helper to fetch data (so we can reuse it)
  const fetchDashboardData = () => {
     api.get("/dashboard/").then(({ data }) => setStats(data)).catch(console.error);
     
     setSessionsLoading(true);
     Promise.all([api.get("/sessions/"), api.get("/patients/")])
      .then(([sRes, pRes]) => {
        setSessions(Array.isArray(sRes.data) ? sRes.data : sRes.data?.results || []);
        setPatients(Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || []);
      })
      .catch(() => setSessionsError("Failed to load sessions"))
      .finally(() => setSessionsLoading(false));
  };

  useEffect(() => {
    if (!getAccessToken()) { navigate("/login", { replace: true }); return; }
    const cached = getUser();
    if (cached) setUser(cached);

    api.get("/auth/me/").then(({ data }) => { 
        setUser(data); 
        localStorage.setItem("user", JSON.stringify(data)); 
    }).catch(() => { clearAuth(); navigate("/login"); });

    fetchDashboardData();
  }, [navigate]);

  const recentSessionsFormatted = useMemo(() => {
    const map = new Map();
    patients.forEach(p => map.set(p.id, p.full_name || p.name || `Patient #${p.id}`));
    
    return [...sessions]
      .sort((a, b) => new Date(b.session_date || 0) - new Date(a.session_date || 0))
      .slice(0, 3)
      .map((s, i) => ({
        id: s.id,
        indexLabel: `${i + 1}`,
        name: map.get(s.patient) || `Patient #${s.patient}`,
        date: formatDate(s.session_date),
        status: s.status,
      }));
  }, [sessions, patients]);

  const handlePatientAdded = () => {
    setShowAddPatient(false);
    fetchDashboardData(); // Refresh stats to show new patient count
  };

  if (!user) return <div className="p-8"><h2>Loading...</h2></div>;

  return (
    <div className="p-10 space-y-8 relative">
      <h1 style={{ fontSize: 32, color: "#727473" }} className="font-semibold">Therapist Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox icon={<FiUsers size={22} />} label="Patients" value={stats.patients_count} />
        <StatBox icon={<FiMic size={22} />} label="Sessions this week" value={stats.sessions_this_week} />
        <StatBox icon={<FiFileText size={22} />} label="Reports Ready" value={stats.reports_ready} />
      </div>

      <div className="flex gap-4 items-center">
        {/* 3. Update onClick to open Modal instead of navigating */}
        <GradientButton onClick={() => setShowAddPatient(true)}>
            <FiPlus size={18} /> Add Patient
        </GradientButton>
        
        <Link to="/sessions/new" className="no-underline">
          <GradientButton><FiMic size={18} /> New Session</GradientButton>
        </Link>
      </div>

      <RecentSessionsTable 
        sessions={recentSessionsFormatted} 
        loading={sessionsLoading} 
        error={sessionsError} 
        onViewAll={() => navigate("/sessions")}
        onRowClick={(id) => navigate(`/sessions/${id}`)}
      />

      {/* 4. Render the Modal Overlay */}
      {showAddPatient && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          {/* Close on click outside */}
          <div className="absolute inset-0" onClick={() => setShowAddPatient(false)}></div>
          
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
             <AddPatientForm onClose={handlePatientAdded} />
          </div>
        </div>
      )}
    </div>
  );
}