import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { Mic } from "lucide-react";

import api from "../../api/axiosInstance";
import { formatDate } from "../../utils/helpers";

import BackButton from "../../components/ui/BackButton";
import SessionsControls from "./SessionsControls";
import SessionsTable from "./SessionsTable";

export default function SessionsPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [sRes, pRes] = await Promise.all([
        api.get("/sessions/"),
        api.get("/patients/"),
      ]);

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
      date: formatDate(s.session_date || s.created_at || s.updated_at, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      status: String(s.status || "empty").toLowerCase(),
      openPath: `/sessions/${s.id}`,
    }));
  }, [sessions, patients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const st = String(filterStatus).toLowerCase();

    return rows.filter((r) => {
      const name = String(r.patientName || "").toLowerCase();
      const rowStatus = String(r.status || "").toLowerCase();

      const matchSearch = !q || name.includes(q);
      const matchStatus = st === "all" || rowStatus === st;

      return matchSearch && matchStatus;
    });
  }, [rows, search, filterStatus]);

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
                <p className="text-sm text-gray-600">
                  View and manage therapy sessions.
                </p>
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
              <Mic className="h-4 w-4" />
              New Session
            </Link>
          </div>
        </div>

        {/* Controls */}
        <SessionsControls
          totalLabel={totalLabel}
          search={search}
          onSearchChange={setSearch}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {/* Table */}
        <SessionsTable
          loading={loading}
          error={error}
          sessions={filtered}
          onOpen={navigate}
        />
      </div>
    </div>
  );
}
