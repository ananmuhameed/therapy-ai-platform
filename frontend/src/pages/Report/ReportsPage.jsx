import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiFileText } from "react-icons/fi";
import api from "../../api/axiosInstance";
import { formatDate } from "../../utils/helpers";

// Shared Components
import BackButton from "../../components/ui/BackButton";

// Page Components
import ReportsControls from "./ReportsControls";
import ReportsTable from "./ReportsTable";

export default function ReportsPage() {
  const navigate = useNavigate();

  // State
  const [rows, setRows] = useState([]); // normalized rows
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // --- Data Fetching Logic ---
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

      // Normalize rows so UI doesn't care about backend shape
      if (result.source === "reports") {
        const normalized = result.list.map((r, idx) => ({
          id: r.id,
          indexLabel: String(idx + 1),
          patientId: r.patient ?? r.patient_id ?? r.session?.patient,
          sessionId: r.session ?? r.session_id,
          status: r.status || "completed",
          date: formatDate(r.created_at || r.updated_at, { year: "numeric", month: "short", day: "2-digit" }),
          openPath: r.session || r.session_id ? `/sessions/${r.session || r.session_id}` : null,
        }));
        setRows(normalized);
      } else {
        // Fallback from sessions: treat completed sessions as report-ready
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
          status: "ready", // Force 'ready' look for sessions acting as reports
          date: formatDate(s.session_date || s.created_at, { year: "numeric", month: "short", day: "2-digit" }),
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

  // --- Filtering & Transformation ---
  const patientNameById = useMemo(() => {
    const map = new Map();
    for (const p of patients) map.set(p.id, p.full_name || p.name || `Patient ${p.id}`);
    return map;
  }, [patients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const st = String(filterStatus).toLowerCase();

    return rows
      .filter((r) => {
        const name = String(patientNameById.get(r.patientId) || "").toLowerCase();
        const matchSearch = !q || name.includes(q);
        const rowStatus = String(r.status || "").toLowerCase();
        const matchStatus = st === "all" || rowStatus === st;
        return matchSearch && matchStatus;
      })
      .map(r => ({
        ...r,
        patientName: patientNameById.get(r.patientId) || (r.patientId ? `Patient ${r.patientId}` : "—")
      }));
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
            <BackButton onClick={() => navigate("/dashboard")} />
            
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
        <ReportsControls 
          totalLabel={totalLabel}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          search={search}
          onSearchChange={setSearch}
        />

        {/* Table */}
        <ReportsTable 
          loading={loading}
          error={error}
          reports={filtered}
          onOpen={navigate}
        />
      </div>
    </div>
  );
}