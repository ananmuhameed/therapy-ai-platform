import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import {
  FiArrowLeft,
  FiEye,
  FiRefreshCw,
  FiMic,
  FiFileText,
} from "react-icons/fi";
import { FaChevronDown, FaSearch } from "react-icons/fa";

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
    empty: "bg-gray-100 text-gray-700 ring-gray-200",
    uploaded: "bg-blue-50 text-blue-700 ring-blue-100",
    recorded: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    transcribing: "bg-amber-50 text-amber-700 ring-amber-100",
    analyzing: "bg-purple-50 text-purple-700 ring-purple-100",
    completed: "bg-green-50 text-green-700 ring-green-100",
    failed: "bg-red-50 text-red-700 ring-red-100",
  };

  const labelMap = {
    empty: "Empty",
    uploaded: "Uploaded",
    recorded: "Recorded",
    transcribing: "Transcribing",
    analyzing: "Analyzing",
    completed: "Completed",
    failed: "Failed",
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[s] || styles.empty
      )}
    >
      {labelMap[s] || status || "—"}
    </span>
  );
}

export default function SessionsListPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const inputBase =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 disabled:bg-gray-50 disabled:text-gray-500";
  const cardBase = "rounded-2xl bg-white shadow-sm ring-1 ring-gray-100";

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

  const loadAll = async () => {
    setLoading(true);
    setError("");

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
      console.error(err);
      const status = err?.response?.status;
      let msg = "Failed to load sessions.";
      if (status === 401) msg = "Unauthorized. Please login again.";
      else if (status === 403) msg = "Forbidden. You don’t have permission.";
      setError(msg);
      setSessions([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const patientNameById = useMemo(() => {
    const map = new Map();
    for (const p of patients) {
      map.set(p.id, p.full_name || p.name || `Patient ${p.id}`);
    }
    return map;
  }, [patients]);

  const normalized = useMemo(() => {
    const copy = [...sessions];
    copy.sort((a, b) => {
      const ta = new Date(a?.session_date || a?.created_at || 0).getTime();
      const tb = new Date(b?.session_date || b?.created_at || 0).getTime();
      return tb - ta;
    });

    return copy.map((s, idx) => ({
      id: s.id,
      indexLabel: String(idx + 1), // ✅ no "#"
      patientId: s.patient,
      patientName:
        patientNameById.get(s.patient) || `Patient ${String(s.patient ?? "—")}`,
      date: formatDate(s.session_date || s.created_at),
      status: s.status || "—",
      hasReport:
        Boolean(s.report) ||
        Boolean(s.report_id) ||
        Boolean(s.report_status === "completed"),
    }));
  }, [sessions, patientNameById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const st = String(filterStatus || "all").toLowerCase();

    return normalized.filter((row) => {
      const matchSearch =
        !q || String(row.patientName || "").toLowerCase().includes(q);

      const matchStatus = st === "all" || String(row.status).toLowerCase() === st;

      return matchSearch && matchStatus;
    });
  }, [normalized, search, filterStatus]);

  const totalLabel = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return "—";
    return `${filtered.length} shown`;
  }, [loading, error, filtered.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-screen-2xl px-2 py-6">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
              aria-label="Back"
              title="Back"
              type="button"
            >
              <FiArrowLeft className="text-[#3078E2]" />
            </button>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Sessions</h1>
              <p className="text-sm text-gray-600">Browse and open session details.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
              type="button"
              title="Refresh"
            >
              <FiRefreshCw />
              Refresh
            </button>

            <Link to="/sessions/new" className="no-underline">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
                type="button"
              >
                <FiMic />
                New Session
              </button>
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className={classNames(cardBase, "p-4 sm:p-5 mb-4")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">All Sessions</div>
              <div className="text-xs text-gray-500">{totalLabel}</div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Status filter */}
              <div className="relative w-full sm:w-[200px]">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={classNames(inputBase, "appearance-none pr-10 cursor-pointer")}
                >
                  <option value="all">All statuses</option>
                  <option value="empty">Empty</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="recorded">Recorded</option>
                  <option value="transcribing">Transcribing</option>
                  <option value="analyzing">Analyzing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-[320px]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient name…"
                  className={classNames(inputBase, "pr-10")}
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={classNames(cardBase, "overflow-hidden")}>
          <div className="grid grid-cols-12 px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 border-b border-gray-100 bg-white">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Patient</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Open</div>
          </div>

          <div className="min-h-[420px] bg-white">
            {loading && (
              <div className="p-4 sm:p-6 space-y-3">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="p-6">
                <p className="text-sm font-medium text-red-600">{error}</p>
                <p className="mt-2 text-sm text-gray-600">
                  Check your token / permissions and the sessions endpoint.
                </p>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-sm text-gray-700 font-medium">No sessions found.</p>
                <p className="mt-1 text-xs text-gray-500">
                  Try changing filters or search.
                </p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="divide-y divide-gray-100">
                {filtered.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => navigate(`/sessions/${row.id}`)}
                    className="grid grid-cols-12 items-center px-4 sm:px-6 py-3 bg-white hover:bg-gray-50 transition cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigate(`/sessions/${row.id}`);
                      }
                    }}
                    title="Open session"
                  >
                    <div className="col-span-1 text-sm text-gray-700">
                      {row.indexLabel}
                    </div>

                    <div className="col-span-5 min-w-0">
                      <div className="text-sm text-gray-900 font-medium truncate">
                        {row.patientName}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500 font-normal">
                        Patient ID: <span className="font-mono">{row.patientId ?? "—"}</span>
                        {row.hasReport ? (
                          <span className="ml-2 inline-flex items-center gap-1 text-[#3078E2]">
                            <FiFileText />
                            Report
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="col-span-3 text-sm text-gray-700">{row.date}</div>

                    <div className="col-span-2">
                      <StatusPill status={row.status} />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sessions/${row.id}`);
                        }}
                        className="inline-flex items-center justify-center rounded-full p-2 text-[#3078E2] hover:bg-[#3078E2]/10 cursor-pointer"
                        aria-label="View session"
                        title="View session"
                        type="button"
                      >
                        <FiEye />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
