import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { getUser, getAccessToken, clearAuth } from "../auth/storage";
import { FiUsers, FiMic, FiFileText, FiPlus, FiEye } from "react-icons/fi";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Skeleton({ className }) {
  return <div className={classNames("animate-pulse rounded-md bg-gray-200/70", className)} />;
}

function StatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  const styles = {
    empty: "bg-gray-100 text-gray-600 ring-gray-200",
    uploaded: "bg-blue-50 text-blue-700 ring-blue-100",
    recorded: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    transcribing: "bg-amber-50 text-amber-700 ring-amber-100",
    analyzing: "bg-purple-50 text-purple-700 ring-purple-100",
    completed: "bg-green-50 text-green-700 ring-green-100",
    failed: "bg-red-50 text-red-700 ring-red-100",
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[s] || "bg-gray-100 text-gray-600 ring-gray-200"
      )}
    >
      {status || "—"}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    patients_count: 0,
    sessions_this_week: 0,
    reports_ready: 0,
  });

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const cached = getUser();
    if (cached) setUser(cached);

    const loadMe = async () => {
      try {
        const { data } = await api.get("/auth/me/");
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to load /auth/me:", err);
        clearAuth();
        navigate("/login", { replace: true });
      }
    };

    const loadDashboardStats = async () => {
      try {
        const { data } = await api.get("/dashboard/");
        setStats(data);
      } catch (err) {
        console.error("Dashboard stats error:", err);
      }
    };

    const loadRecentSessions = async () => {
      setSessionsLoading(true);
      setSessionsError("");
      try {
        const [sessionsRes, patientsRes] = await Promise.all([
          api.get("/sessions/"),
          api.get("/patients/"),
        ]);

        const sessionsData = Array.isArray(sessionsRes.data)
          ? sessionsRes.data
          : sessionsRes.data?.results || [];

        const patientsData = Array.isArray(patientsRes.data)
          ? patientsRes.data
          : patientsRes.data?.results || [];

        setSessions(sessionsData);
        setPatients(patientsData);
      } catch (err) {
        console.error("Recent sessions error:", err);
        setSessionsError("Failed to load recent sessions.");
        setSessions([]);
        setPatients([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    loadMe();
    loadDashboardStats();
    loadRecentSessions();
  }, [navigate]);

  const patientNameById = useMemo(() => {
    const map = new Map();
    for (const p of patients) map.set(p.id, p.full_name || p.name || `Patient #${p.id}`);
    return map;
  }, [patients]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  };

  const statusLabel = (status) => {
    const s = String(status || "").toLowerCase();
    const map = {
      empty: "Empty",
      uploaded: "Uploaded",
      recorded: "Recorded",
      transcribing: "Transcribing",
      analyzing: "Analyzing",
      completed: "Completed",
      failed: "Failed",
    };
    return map[s] || status || "—";
  };

  const recentSessions = useMemo(() => {
    const copy = [...sessions];
    copy.sort((a, b) => {
      const ta = new Date(a?.session_date || a?.created_at || 0).getTime();
      const tb = new Date(b?.session_date || b?.created_at || 0).getTime();
      return tb - ta;
    });

    return copy.slice(0, 3).map((s, i) => ({
      id: s.id,
      indexLabel: `${i + 1}`,
      name: patientNameById.get(s.patient) || `Patient #${s.patient}`,
      date: formatDate(s.session_date || s.created_at),
      status: statusLabel(s.status),
    }));
  }, [sessions, patientNameById]);

  if (!user) {
    return (
      <div className="p-8">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8">
      {/* Title (keep old UI) */}
      <h1 style={{ fontSize: 32, color: "#727473" }} className="font-semibold">
        Therapist Dashboard
      </h1>

      {/* Stats (keep old UI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox icon={<FiUsers size={22} />} label="Patients" value={stats.patients_count} />
        <StatBox icon={<FiMic size={22} />} label="Sessions this week" value={stats.sessions_this_week} />
        <StatBox icon={<FiFileText size={22} />} label="Reports Ready" value={stats.reports_ready} />
      </div>

      {/* Actions (keep old UI) */}
      <div className="flex gap-4 items-center">
        <GradientButton ariaLabel="Add patient" onClick={() => navigate("/patients?add=1")}>
          <FiPlus size={18} />
          Add Patient
        </GradientButton>

        <Link to="/sessions/new" className="no-underline">
          <GradientButton ariaLabel="Go to new session page">
            <FiMic size={18} />
            New Session
          </GradientButton>
        </Link>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-semibold text-gray-800">Recent Sessions</div>

          <button
            type="button"
            onClick={() => navigate("/sessions")}
            className="text-sm font-medium text-[#3078E2] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* header row (Status is its own column after Patient) */}
        <div className="grid grid-cols-12 text-xs font-medium text-gray-500 px-2 pb-2">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Patient</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Open</div>
        </div>

        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
          {sessionsLoading && (
            <div className="p-4 space-y-3 bg-white">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          )}

          {!sessionsLoading && sessionsError && (
            <div className="p-5 bg-white">
              <p className="text-sm text-red-600">{sessionsError}</p>
            </div>
          )}

          {!sessionsLoading && !sessionsError && recentSessions.length === 0 && (
            <div className="p-8 bg-white text-center">
              <p className="text-sm text-gray-600">No sessions yet.</p>
              <p className="mt-1 text-xs text-gray-500">Create a new session to start the workflow.</p>
            </div>
          )}

          {!sessionsLoading &&
            !sessionsError &&
            recentSessions.map((row) => (
              <div
                key={row.id}
                onClick={() => navigate(`/sessions/${row.id}`)}
                className="grid grid-cols-12 items-center px-2 py-3 bg-white hover:bg-gray-50 transition cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(`/sessions/${row.id}`);
                }}
                title="Open session"
              >
                <div className="col-span-1 text-sm text-gray-700">{row.indexLabel}</div>

                <div className="col-span-5 min-w-0">
                  <div className="text-sm text-gray-800 font-medium truncate">{row.name}</div>
                </div>

                <div className="col-span-3">
                  <StatusPill status={row.status} />
                </div>

                <div className="col-span-2 text-sm text-gray-700">{row.date}</div>

                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/sessions/${row.id}`);
                    }}
                    className="inline-flex items-center justify-center rounded-full p-2 text-[#3078E2] hover:bg-[#3078E2]/10 cursor-pointer"
                    aria-label="View session"
                    title="View session"
                  >
                    <FiEye />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Debug helper (development only) */}
      {import.meta.env.DEV && (
        <pre className="text-xs bg-gray-100 p-4 rounded">
          {JSON.stringify({ user, stats, recentSessions }, null, 2)}
        </pre>
      )}
    </div>
  );
}

/* ---------- UI ---------- */

function StatBox({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 rounded-xl" style={{ backgroundColor: "#F0F3FA" }}>
      {icon}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function GradientButton({ children, ariaLabel, onClick }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="
        flex items-center gap-2
        px-6 py-3
        rounded-full
        text-white font-medium
        shadow-md
        transition
        hover:scale-[1.03]
        active:scale-[0.97]
      "
      style={{
        background: "linear-gradient(90deg, #3078E2 0%, #8AAEE0 50%, #C6D2EC 100%)",
      }}
    >
      {children}
    </button>
  );
}
