import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiEye } from "react-icons/fi";
import { Mic } from "lucide-react";
import api from "../../api/axiosInstance";
import { formatDate, classNames } from "../../utils/helpers";

import BackButton from "../../components/ui/BackButton";
import StatusPill from "../../components/ui/StatusPill";
import SearchInput from "../../components/ui/SearchInput";
import Skeleton from "../../components/ui/Skeleton";

export default function SessionsListPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [sRes, pRes] = await Promise.all([api.get("/sessions/"), api.get("/patients/")]);

      const sList = Array.isArray(sRes.data) ? sRes.data : sRes.data?.results || [];
      const pList = Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || [];

      setSessions(sList);
      setPatients(pList);
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

  const rows = useMemo(() => {
    const pMap = new Map(
      patients.map((p) => [p.id, p.full_name || p.name || `Patient ${p.id}`])
    );

    return sessions.map((s, idx) => ({
      id: s.id,
      indexLabel: String(idx + 1),
      patientId: s.patient,
      patientName: pMap.get(s.patient) || (s.patient ? `Patient ${s.patient}` : "—"),
      date: formatDate(s.session_date || s.created_at, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      status: String(s.status || "draft").toLowerCase(),
      openPath: `/sessions/${s.id}`,
    }));
  }, [sessions, patients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.patientName.toLowerCase().includes(q));
  }, [rows, search]);

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
            <BackButton onClick={() => navigate("/dashboard")} />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3078E2]/10">
                <Mic className="text-[#3078E2]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Sessions</h1>
                <p className="text-sm text-gray-600">View and manage therapy sessions.</p>
              </div>
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

            <Link
              to="/sessions/new"
              className="inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90"
              title="New Session"
            >
              <FiRefreshCw className="hidden" />
              <Mic className="h-4 w-4" />
              New Session
            </Link>
          </div>
        </div>

        {/* Controls Card (like ReportsControls) */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-4 sm:p-5 mb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Counts */}
            <div>
              <div className="text-sm font-semibold text-gray-900">All Sessions</div>
              <div className="text-xs text-gray-500">{totalLabel}</div>
            </div>

            {/* Right: Search */}
            <div className="w-full sm:w-[320px]">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient name…"
              />
            </div>
          </div>
        </div>

        {/* Table Card (like ReportsTable) */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 border-b border-gray-100 bg-white">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Patient</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Open</div>
          </div>

          <div className="min-h-[420px] bg-white">
            {/* Loading */}
            {loading && (
              <div className="p-4 sm:p-6 space-y-3">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="p-6">
                <p className="text-sm font-medium text-red-600">{error}</p>
                <p className="mt-2 text-sm text-gray-600">
                  Check your token / permissions and the sessions endpoint.
                </p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-sm text-gray-700 font-medium">No sessions found.</p>
                <p className="mt-1 text-xs text-gray-500">Try changing search.</p>
              </div>
            )}

            {/* Rows */}
            {!loading && !error && filtered.length > 0 && (
              <div className="divide-y divide-gray-100">
                {filtered.map((s) => {
                  const canOpen = Boolean(s.openPath);

                  return (
                    <div
                      key={s.id}
                      onClick={() => canOpen && navigate(s.openPath)}
                      className={classNames(
                        "grid grid-cols-12 items-center px-4 sm:px-6 py-3 bg-white transition",
                        canOpen ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                      )}
                      role={canOpen ? "button" : undefined}
                      tabIndex={canOpen ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (!canOpen) return;
                        if (e.key === "Enter" || e.key === " ") navigate(s.openPath);
                      }}
                      title={canOpen ? "Open session" : "No session to open"}
                    >
                      <div className="col-span-1 text-sm text-gray-700">{s.indexLabel}</div>

                      <div className="col-span-5 min-w-0">
                        <div className="text-sm text-gray-900 font-medium truncate">
                          {s.patientName}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500 font-normal">
                          Session ID: <span className="font-mono">{s.id}</span>
                        </div>
                      </div>

                      <div className="col-span-3 text-sm text-gray-700">{s.date}</div>

                      <div className="col-span-2">
                        <StatusPill status={s.status} />
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canOpen) navigate(s.openPath);
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
