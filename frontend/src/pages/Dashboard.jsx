import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { getUser, getAccessToken, clearAuth } from "../auth/storage";
import {
  FiUsers,
  FiMic,
  FiFileText,
  FiPlus,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";

/* =========================
   UI HELPERS
========================= */
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Skeleton({ className }) {
  return (
    <div
      className={classNames("animate-pulse rounded-md bg-gray-200/70", className)}
    />
  );
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

function StatCard({ icon, label, value, hint }) {
  const cardBase = "rounded-2xl bg-white shadow-sm ring-1 ring-gray-100";
  return (
    <div className={classNames(cardBase, "p-5")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {value ?? "—"}
          </div>
          {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3078E2]/10 text-[#3078E2]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function PrimaryPillButton({ children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
    >
      {children}
    </button>
  );
}

function SecondaryPillLink({ children, to, ariaLabel }) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 no-underline cursor-pointer"
    >
      {children}
    </Link>
  );
}

/* =========================
   DASHBOARD
========================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    patients_count: 0,
    sessions_this_week: 0,
    reports_ready: 0,
  });

  const [statsLoading, setStatsLoading] = useState(false);

  // Recent Sessions
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  // Patients map
  const [patients, setPatients] = useState([]);

  const cardBase = "rounded-2xl bg-white shadow-sm ring-1 ring-gray-100";

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
      setStatsLoading(true);
      try {
        const { data } = await api.get("/dashboard/");
        setStats(data);
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setStatsLoading(false);
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
    for (const p of patients) {
      map.set(p.id, p.full_name || p.name || `Patient #${p.id}`);
    }
    return map;
  }, [patients]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
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

    return copy.slice(0, 5).map((s) => ({
      id: s.id,
      patientId: s.patient,
      name: patientNameById.get(s.patient) || `Patient #${s.patient}`,
      date: formatDate(s.session_date || s.created_at),
      status: statusLabel(s.status),
    }));
  }, [sessions, patientNameById]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-screen-2xl px-2 py-6">
          <div className={classNames(cardBase, "p-6")}>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={classNames(cardBase, "p-5")}>
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Skeleton className="h-5 w-40 mb-3" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl mb-3" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.full_name || user?.name || user?.email || "Therapist";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-screen-2xl px-2 py-6 space-y-6">
        {/* Header */}
        <div className={classNames(cardBase, "p-6")}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Therapist Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, <span className="font-medium">{displayName}</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <PrimaryPillButton
                ariaLabel="Add patient"
                onClick={() => navigate("/patients?add=1")}
              >
                <FiPlus />
                Add Patient
              </PrimaryPillButton>

              <SecondaryPillLink ariaLabel="Create new session" to="/sessions/new">
                <FiMic />
                New Session
              </SecondaryPillLink>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<FiUsers size={20} />}
            label="Patients"
            value={statsLoading ? "…" : stats.patients_count}
            hint="Total assigned"
          />
          <StatCard
            icon={<FiMic size={20} />}
            label="Sessions this week"
            value={statsLoading ? "…" : stats.sessions_this_week}
            hint="Last 7 days"
          />
          <StatCard
            icon={<FiFileText size={20} />}
            label="Reports Ready"
            value={statsLoading ? "…" : stats.reports_ready}
            hint="Completed analyses"
          />
        </div>

        {/* Recent Sessions */}
        <div className={classNames(cardBase, "p-6")}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Recent Sessions
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Latest sessions ordered by date.
              </p>
            </div>

            <Link
              to="/sessions"
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 no-underline cursor-pointer"
              title="View all sessions"
            >
              View all
              <FiArrowRight />
            </Link>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 text-xs font-medium text-gray-500 px-3 pb-2">
            <div className="col-span-5">Patient</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-1 text-right">Open</div>
          </div>

          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
            {sessionsLoading && (
              <div className="p-4 space-y-3 bg-white">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            )}

            {!sessionsLoading && sessionsError && (
              <div className="p-6 bg-white">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-red-600">
                    <FiAlertCircle />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      {sessionsError}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Check your sessions endpoint and permissions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!sessionsLoading && !sessionsError && recentSessions.length === 0 && (
              <div className="p-10 bg-white text-center">
                <p className="text-sm text-gray-700 font-medium">
                  No sessions yet.
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Create a new session to start transcription and reporting.
                </p>
                <div className="mt-4 flex justify-center">
                  <Link
                    to="/sessions/new"
                    className="inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 no-underline cursor-pointer"
                  >
                    <FiMic />
                    New Session
                  </Link>
                </div>
              </div>
            )}

            {!sessionsLoading &&
              !sessionsError &&
              recentSessions.map((row) => (
                <Link
                  key={row.id}
                  to={`/sessions/${row.id}`}
                  className="grid grid-cols-12 items-center px-3 py-3 bg-white hover:bg-gray-50 transition no-underline cursor-pointer"
                  title="Open session"
                >
                  <div className="col-span-5">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {row.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Patient ID: <span className="font-mono">{row.patientId}</span>
                    </div>
                  </div>

                  <div className="col-span-3 text-sm text-gray-700">
                    {row.date}
                  </div>

                  <div className="col-span-3">
                    <StatusPill status={row.status} />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <span className="inline-flex items-center justify-center rounded-full p-2 text-[#3078E2] hover:bg-[#3078E2]/10">
                      <FiArrowRight />
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Dev Debug */}
        {import.meta.env.DEV && (
          <pre className="text-xs bg-gray-100 p-4 rounded">
            {JSON.stringify({ user, stats, recentSessions }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
