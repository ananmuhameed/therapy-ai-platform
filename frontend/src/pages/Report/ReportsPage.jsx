import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiFileText } from "react-icons/fi";
import { formatDate } from "../../utils/helpers";

// Shared Components
import BackButton from "../../components/ui/BackButton";

// Page Components
import ReportsControls from "./ReportsControls";
import ReportsTable from "./ReportsTable";

// React query hooks
import { usePatients } from "../../queries/patients";
import { useReportsPrefer } from "../../queries/reports";

export default function ReportsPage() {
  const navigate = useNavigate();

  // State
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  //queries ---
  const {
    data: patients = [],
    isLoading: patientsLoading,
    isFetching: patientsFetching,
    error: patientsError,
    refetch: refetchPatients,
  } = usePatients();

  const {
    data: reportsResult,
    isLoading: reportsLoading,
    isFetching: reportsFetching,
    error: reportsError,
    refetch: refetchReports,
  } = useReportsPrefer();

  const loading = patientsLoading || reportsLoading;
  const fetching = patientsFetching || reportsFetching;
  const error = patientsError || reportsError;

  const patientNameById = useMemo(() => {
    const map = new Map();
    for (const p of patients)
      map.set(p.id, p.full_name || p.name || `Patient ${p.id}`);
    return map;
  }, [patients]);

  const rows = useMemo(() => {
    if (!reportsResult?.list) return [];

    if (reportsResult.source === "reports") {
      return reportsResult.list.map((r, idx) => ({
        id: r.id,
        indexLabel: String(idx + 1),
        patientId: r.patient ?? r.patient_id ?? r.session?.patient,
        sessionId: r.session ?? r.session_id,
        status: r.status || "completed",
        date: formatDate(r.created_at || r.updated_at, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
        openPath:
          r.session || r.session_id
            ? `/sessions/${r.session || r.session_id}`
            : null,
      }));
    }

    // fallback from sessions: treat completed sessions as report-ready
    const completed = reportsResult.list
      .filter((s) => String(s.status || "").toLowerCase() === "completed")
      .sort((a, b) => {
        const ta = new Date(a?.session_date || a?.created_at || 0).getTime();
        const tb = new Date(b?.session_date || b?.created_at || 0).getTime();
        return tb - ta;
      });

    return completed.map((s, idx) => ({
      id: s.id,
      indexLabel: String(idx + 1),
      patientId: s.patient,
      sessionId: s.id,
      status: "ready",
      date: formatDate(s.session_date || s.created_at, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      openPath: `/sessions/${s.id}`,
    }));
  }, [reportsResult]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const st = String(filterStatus).toLowerCase();

    return rows
      .filter((r) => {
        const name = String(
          patientNameById.get(r.patientId) || ""
        ).toLowerCase();
        const matchSearch = !q || name.includes(q);
        const rowStatus = String(r.status || "").toLowerCase();
        const matchStatus = st === "all" || rowStatus === st;
        return matchSearch && matchStatus;
      })
      .map((r) => ({
        ...r,
        patientName:
          patientNameById.get(r.patientId) ||
          (r.patientId ? `Patient ${r.patientId}` : "—"),
      }));
  }, [rows, search, filterStatus, patientNameById]);

  const totalLabel = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return "—";
    return `${filtered.length} shown`;
  }, [loading, error, filtered.length]);

  const handleRefresh = async () => {
    await Promise.all([refetchPatients(), refetchReports()]);
  };

  const errorMsg = useMemo(() => {
    if (!error) return "";
    return "Failed to load reports.";
  }, [error]);

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
                <h1 className="text-2xl font-semibold text-gray-900">
                  Reports
                </h1>
                <p className="text-sm text-gray-600">
                  View completed session reports.
                </p>
              </div>
            </div>
          </div>

          {/* <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer disabled:opacity-60"
            type="button"
            title="Refresh"
            disabled={fetching}
          >
            <FiRefreshCw />
            {fetching ? "Refreshing..." : "Refresh"}
          </button> */}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

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
          error={errorMsg}
          reports={filtered}
          onOpen={navigate}
        />
      </div>
    </div>
  );
}
