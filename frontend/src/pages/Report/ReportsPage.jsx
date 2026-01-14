import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiFileText } from "react-icons/fi";
import { formatDate } from "../../utils/helpers";

import BackButton from "../../components/ui/BackButton";
import ReportsControls from "./ReportsControls";
import ReportsTable from "./ReportsTable";
import ThemeWrapper from "../../components/ui/ThemeWraper";

import { usePatients } from "../../queries/patients";
import { useReportsPrefer } from "../../queries/reports";

export default function ReportsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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
    <ThemeWrapper className="min-h-screen">
      <div className="mx-auto max-w-screen-2xl px-2 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate("/dashboard")} />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgb(var(--bg-secondary))]">
                <FiFileText className="text-[rgb(var(--primary))]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">
                  Reports
                </h1>
                <p className="text-sm text-[rgb(var(--text-muted))]">
                  View completed session reports.
                </p>
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <ReportsControls
          totalLabel={totalLabel}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          search={search}
          onSearchChange={setSearch}
        />

        <ReportsTable
          loading={loading}
          error={errorMsg}
          reports={filtered}
          onOpen={navigate}
        />
      </div>
    </ThemeWrapper>
  );
}
