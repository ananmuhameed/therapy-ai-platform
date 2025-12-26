import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { FiArrowLeft, FiEye, FiRefreshCw, FiFileText } from "react-icons/fi";
import { FaSearch, FaChevronDown } from "react-icons/fa";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Skeleton({ className }) {
  return <div className={classNames("animate-pulse rounded-md bg-gray-200/70", className)} />;
}

function StatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  const styles = {
    draft: "bg-gray-100 text-gray-700 ring-gray-200",
    analyzing: "bg-purple-50 text-purple-700 ring-purple-100",
    completed: "bg-green-50 text-green-700 ring-green-100",
    failed: "bg-red-50 text-red-700 ring-red-100",
    ready: "bg-green-50 text-green-700 ring-green-100",
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[s] || "bg-gray-100 text-gray-700 ring-gray-200"
      )}
    >
      {status || "—"}
    </span>
  );
}

export default function ReportsPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]); // normalized rows
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
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      return Array.isArray(res.data) ? res.data : res.data?.results || [];
    } catch {
      return [];
    }
  };

  const loadReportsPrefer = async () => {
    // 1) Try /reports/
    try {
      const res = await api.get("/reports/");
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      return { source: "reports", list };
    } catch (err) {
      const status = err?.response?.status;
      if (status && status !== 404) throw err; // real error
      // 2) fallback: /sessions/
      const sres = await api.get("/sessions/");
      const sessions = Array.isArray(sres.data) ? sres.data : sres.data?.results || [];
      return { source: "sessions", list: sessions };
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsData, result] = await Promise.all([loadPatients(), loadReportsPrefer()]);
      setPatients(patientsData);

      // normalize rows so UI doesn't care about backend shape
      if (result.source === "reports") {
        // Expected report fields (best effort):
        // report.id, report.session, report.patient, report.status, report.created_at/updated_at
        const normalized = result.list.map((r, idx) => ({
          id: r.id,
          indexLabel: String(idx + 1),
          patientId: r.patient ?? r.patient_id ?? r.session?.patient,
          sessionId: r.session ?? r.session_id,
          status: r.status || "completed",
          date: formatDate(r.created_at || r.updated_at),
          openPath:
            r.session || r.session_id ? `/sessions/${r.session || r.session_id}` : null,
        }));
        setRows(normalized);
      } else {
        // fallback from sessions: treat completed sessions as report-ready
        const completed = result.list
          .filter((s) => String(s.status || "").toLowerCase() === "completed")
          .sort((a, b) => {
            const ta = new Date(a?.session_date || a?.created_at || 0).getTime();
            const tb = new Date(b?.session_date || b?.created_at || 0).getTime();
            return tb - ta;
          });

        const normalized = completed.map((s, idx) => ({
          id: s.id, // session id
          indexLabel: String(idx + 1),
          patientId: s.patient,
          sessionId: s.id,
          status: "ready",
          date: formatDate(s.session_date || s.created_at),
          openPath: `/sessions/${s.id}`,
        }));
        setRows(normalized);
      }
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      let msg = "Failed to load reports.";
      if (status === 401) msg = "Unauthorized. Please login again.";
      else if (status === 403) msg = "Forbidden. You don’t have permission.";
      setError(msg);
      setRows([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const patientNameById = useMemo(() => {
    const map = new Map();
    for (const p of patients) map.set(p.id, p.full_name || p.name || `Patient ${p.id}`);
    return map;
  }, [patients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const st = String(filterStatus).toLowerCase();

    return rows.filter((r) => {
      const name = String(patientNameById.get(r.patientId) || "").toLowerCase();
      const matchSearch = !q || name.includes(q);

      const rowStatus = String(r.status || "").toLowerCase();
      const matchStatus = st === "all" || rowStatus === st;

      return matchSearch && matchStatus;
    });
  }, [rows, search, filterStatus, patientNameById]);

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

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3078E2]/10">
                <FiFileText className="text-[#3078E2]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-600">View completed session reports.</p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
            type="button"
            title="Refresh"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {/* Controls */}
        <div className={classNames(cardBase, "p-4 sm:p-5 mb-4")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">All Reports</div>
              <div className="text-xs text-gray-500">{totalLabel}</div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[200px]">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={classNames(inputBase, "appearance-none pr-10 cursor-pointer")}
                >
                  <option value="all">All statuses</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="draft">Draft</option>
                  <option value="analyzing">Analyzing</option>
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

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
                  Check your token / permissions and the reports endpoint.
                </p>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-sm text-gray-700 font-medium">No reports found.</p>
                <p className="mt-1 text-xs text-gray-500">Try changing filters or search.</p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="divide-y divide-gray-100">
                {filtered.map((r) => {
                  const name =
                    patientNameById.get(r.patientId) ||
                    (r.patientId ? `Patient ${r.patientId}` : "—");

                  const canOpen = Boolean(r.openPath);

                  return (
                    <div
                      key={`${r.sessionId ?? ""}-${r.id}`}
                      onClick={() => canOpen && navigate(r.openPath)}
                      className={classNames(
                        "grid grid-cols-12 items-center px-4 sm:px-6 py-3 bg-white transition",
                        canOpen ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                      )}
                      role={canOpen ? "button" : undefined}
                      tabIndex={canOpen ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (!canOpen) return;
                        if (e.key === "Enter" || e.key === " ") navigate(r.openPath);
                      }}
                      title={canOpen ? "Open session" : "No session to open"}
                    >
                      <div className="col-span-1 text-sm text-gray-700">{r.indexLabel}</div>

                      <div className="col-span-5 min-w-0">
                        <div className="text-sm text-gray-900 font-medium truncate">{name}</div>
                        <div className="mt-0.5 text-xs text-gray-500 font-normal">
                          Session ID: <span className="font-mono">{r.sessionId ?? "—"}</span>
                        </div>
                      </div>

                      <div className="col-span-3 text-sm text-gray-700">{r.date}</div>

                      <div className="col-span-2">
                        <StatusPill status={r.status} />
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canOpen) navigate(r.openPath);
                          }}
                          disabled={!canOpen}
                          className={classNames(
                            "inline-flex items-center justify-center rounded-full p-2",
                            canOpen
                              ? "text-[#3078E2] hover:bg-[#3078E2]/10 cursor-pointer"
                              : "text-gray-300 cursor-not-allowed"
                          )}
                          aria-label="View"
                          title="View"
                          type="button"
                        >
                          <FiEye />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
