import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import { FiRefreshCw, FiMic, FiEye, FiFileText } from "react-icons/fi";
import { formatDate } from "../../utils/helpers";

import BackButton from "../../components/ui/BackButton";
import StatusPill from "../../components/ui/StatusPill";
import SearchInput from "../../components/ui/SearchInput";
import Skeleton from "../../components/ui/Skeleton";

export default function SessionsListPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
        const [sRes, pRes] = await Promise.all([api.get("/sessions/"), api.get("/patients/")]);
        setSessions(sRes.data?.results || sRes.data || []);
        setPatients(pRes.data?.results || pRes.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(() => {
    const pMap = new Map(patients.map(p => [p.id, p.full_name || `Patient ${p.id}`]));
    return sessions.map(s => ({ ...s, patientName: pMap.get(s.patient) }))
      .filter(s => !search || s.patientName?.toLowerCase().includes(search.toLowerCase()));
  }, [sessions, patients, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="mb-6 flex justify-between">
         <div className="flex gap-3 items-center">
            <BackButton onClick={() => navigate("/dashboard")} />
            <h1 className="text-2xl font-semibold">Sessions</h1>
         </div>
         <Link to="/sessions/new" className="bg-[#3078E2] text-white px-4 py-2 rounded-full flex items-center gap-2"><FiMic/> New</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 mb-4 flex justify-between">
         <SearchInput value={search} onChange={e => setSearch(e.target.value)} className="w-[300px]" />
         <button onClick={loadAll} className="flex items-center gap-2 text-sm text-gray-700"><FiRefreshCw /> Refresh</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {loading ? <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full"/>)}</div> : (
          <div className="divide-y divide-gray-100">
             {filtered.map(s => (
                <div key={s.id} onClick={() => navigate(`/sessions/${s.id}`)} className="grid grid-cols-12 p-4 hover:bg-gray-50 cursor-pointer items-center">
                   <div className="col-span-5 font-medium">{s.patientName}</div>
                   <div className="col-span-3 text-sm text-gray-600">{formatDate(s.session_date)}</div>
                   <div className="col-span-3"><StatusPill status={s.status} /></div>
                   <div className="col-span-1 text-right text-[#3078E2]"><FiEye /></div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}