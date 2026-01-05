import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiMic, FiEye } from "react-icons/fi";
import { formatDate } from "../../utils/helpers";

import { useSessions } from "../../queries/sessions";
import { usePatients } from "../../queries/patients";

import BackButton from "../../components/ui/BackButton";
import StatusPill from "../../components/ui/StatusPill";
import SearchInput from "../../components/ui/SearchInput";
import Skeleton from "../../components/ui/Skeleton";

export default function SessionsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    isFetching: sessionsFetching,
    error: sessionsError,
    refetch: refetchSessions,
  } = useSessions();

  const {
    data: patients = [],
    isLoading: patientsLoading,
    isFetching: patientsFetching,
    error: patientsError,
    refetch: refetchPatients,
  } = usePatients();

  const loading = sessionsLoading || patientsLoading;
  const fetching = sessionsFetching || patientsFetching;
  const error = sessionsError || patientsError;

  const filtered = useMemo(() => {
    const pMap = new Map(
      patients.map((p) => [p.id, p.full_name || p.name || `Patient ${p.id}`])
    );

    const q = search.trim().toLowerCase();

    return sessions
      .map((s) => ({
        ...s,
        patientName:
          pMap.get(s.patient) || (s.patient ? `Patient ${s.patient}` : "—"),
      }))
      .filter((s) => !q || s.patientName.toLowerCase().includes(q));
  }, [sessions, patients, search]);

  const handleRefresh = async () => {
    await Promise.all([refetchSessions(), refetchPatients()]);
  };

  const errorMsg = useMemo(() => {
    if (!error) return "";
    if (sessionsError) return "Failed to load sessions.";
    if (patientsError) return "Failed to load patients.";
    return "Failed to load data.";
  }, [error, sessionsError, patientsError]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="mb-6 flex justify-between">
        <div className="flex gap-3 items-center">
          <BackButton onClick={() => navigate("/dashboard")} />
          <h1 className="text-2xl font-semibold">Sessions</h1>
        </div>

        <Link
          to="/sessions/new"
          className="bg-[#3078E2] text-white px-4 py-2 rounded-full flex items-center gap-2"
        >
          <FiMic /> New
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 mb-4 flex justify-between items-center">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[300px]"
        />

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-sm text-gray-700"
          type="button"
          disabled={fetching}
          title="Refresh"
        >
          <FiRefreshCw />
          {fetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/sessions/${s.id}`)}
                className="grid grid-cols-12 p-4 hover:bg-gray-50 cursor-pointer items-center"
              >
                <div className="col-span-5 font-medium">{s.patientName}</div>
                <div className="col-span-3 text-sm text-gray-600">
                  {formatDate(s.session_date || s.created_at)}
                </div>
                <div className="col-span-3">
                  <StatusPill status={s.status} />
                </div>
                <div className="col-span-1 text-right text-[#3078E2]">
                  <FiEye />
                </div>
              </div>
            ))}

            {!filtered.length && (
              <div className="p-6 text-sm text-gray-500">
                No sessions found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
