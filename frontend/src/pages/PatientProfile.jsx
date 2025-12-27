import api from "../api/axiosInstance";

import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiEye,
} from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
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

function Skeleton({ className }) {
  return (
    <div
      className={classNames(
        "animate-pulse rounded-md bg-gray-200/70",
        className
      )}
    />
  );
}

export default function PatientProfile() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  /*STATE*/
  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState({
    full_name: "",
    gender: "",
    date_of_birth: "",
    contact_phone: "",
    contact_email: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  /* =========================
     HELPERS
  ========================== */
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : "";
  };

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

  const inputBase =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 disabled:bg-gray-50 disabled:text-gray-500 cursor-text";
  const cardBase = "rounded-2xl bg-white shadow-sm ring-1 ring-gray-100";

  useEffect(() => {
    const fetchPatientAndSessions = async () => {
      setLoading(true);
      setError("");
      setSessionsError("");

      try {
        const patientRes = await api.get(`/patients/${patientId}/`);
        setPatient(patientRes.data);

        setSessionsLoading(true);
        try {
          const sessionsRes = await api.get("/sessions/");
          const allSessions = Array.isArray(sessionsRes.data)
            ? sessionsRes.data
            : sessionsRes.data?.results || [];

          const pid = Number(patientId);

          const filtered = allSessions
            .filter((s) => Number(s.patient) === pid)
            .sort((a, b) => {
              const ta = new Date(a?.session_date || a?.created_at || 0).getTime();
              const tb = new Date(b?.session_date || b?.created_at || 0).getTime();
              return tb - ta;
            });

          setSessions(filtered);
        } catch (err) {
          console.error("Failed to load sessions list:", err);
          setSessionsError("Failed to load sessions for this patient.");
          setSessions([]);
        } finally {
          setSessionsLoading(false);
        }
      } catch (err) {
        console.error(err);
        const status = err?.response?.status;
        let msg = "Failed to load patient profile.";
        if (status === 401) msg = "Unauthorized. Please login again.";
        else if (status === 403) msg = "Forbidden. You don’t have permission.";
        else if (status === 404) msg = "Patient not found.";
        setError(msg);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) fetchPatientAndSessions();
  }, [patientId]);

  const sessionsRows = useMemo(() => {
    return sessions.map((s, i) => ({
      id: s.id,
      indexLabel: `${i + 1}`,
      date: formatDate(s.session_date || s.created_at),
      status: statusLabel(s.status),
    }));
  }, [sessions]);

  /* =========================
     HANDLERS
  ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setError("");

      const payload = {
        full_name: patient.full_name,
        gender: patient.gender,
        date_of_birth: patient.date_of_birth,
        contact_phone: patient.contact_phone,
        contact_email: patient.contact_email,
        notes: patient.notes,
      };

      const res = await api.patch(`/patients/${patientId}/`, payload);
      setPatient(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      let msg = "Failed to save changes.";
      if (status === 400) msg = "Invalid data. Please check the fields.";
      else if (status === 401) msg = "Unauthorized. Please login again.";
      else if (status === 403) msg = "Forbidden. You don’t have permission.";
      setError(msg);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patient profile?"
    );
    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/patients/${patientId}/`);
      navigate("/patients");
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      let msg = "Failed to delete patient.";
      if (status === 401) msg = "Unauthorized. Please login again.";
      else if (status === 403) msg = "Forbidden. You don’t have permission.";
      setError(msg);
    }
  };

  /* =========================
     RENDER
  ========================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-full px-2 sm:px-3 md:px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>

          <div className={classNames(cardBase, "p-6 mb-6")}>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>

          <div className={classNames(cardBase, "p-6 mb-6")}>
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={classNames(cardBase, "p-6 lg:col-span-2")}>
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className={classNames(cardBase, "p-6")}>
              <Skeleton className="h-5 w-20 mb-4" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-full px-2 sm:px-3 md:px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate("/patients")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
              aria-label="Back"
            >
              <FiArrowLeft size={20} className="text-[#3078E2]" />
            </button>
          </div>

          <div className={classNames(cardBase, "p-6")}>
            <p className="text-sm font-medium text-red-600">{error}</p>
            <p className="mt-2 text-sm text-gray-600">
              If this keeps happening, check your token / permissions and the
              patients endpoint.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(patient.date_of_birth);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-full px-2 sm:px-3 md:px-4 py-8">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/patients")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
            aria-label="Back to patients"
          >
            <FiArrowLeft size={20} className="text-[#3078E2]" />
          </button>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
                >
                  <FiEdit />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E23030] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
                >
                  <FiTrash2 />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
                >
                  <FiCheck />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
                >
                  <FiX />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Header Card */}
        <div className={classNames(cardBase, "p-6 mb-6")}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3078E2]/10">
                <IoPersonOutline size={22} className="text-[#3078E2]" />
              </div>

              <div>
                {isEditing ? (
                  <input
                    name="full_name"
                    value={patient.full_name}
                    onChange={handleChange}
                    placeholder="Patient name"
                    className={classNames(inputBase, "max-w-md")}
                  />
                ) : (
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {patient.full_name || "Patient"}
                  </h1>
                )}

                {!isEditing ? (
                  <p className="mt-1 text-sm text-gray-600">
                    {patient.gender || "Gender"}{" "}
                    {age ? (
                      <>
                        <span className="mx-1">•</span>
                        {age} years
                      </>
                    ) : null}
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      name="gender"
                      value={patient.gender}
                      onChange={handleChange}
                      placeholder="Gender"
                      className={inputBase}
                    />
                    <input
                      type="date"
                      name="date_of_birth"
                      value={patient.date_of_birth}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="hidden md:block text-right">
                <div className="text-xs text-gray-500">Patient ID</div>
                <div className="font-mono text-sm text-gray-800">
                  {patientId}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className={classNames(cardBase, "p-6 mb-6")}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Contact</h2>
            <span className="text-xs text-gray-500">Phone & Email</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <FiPhone className="text-[#3078E2]" />
              {isEditing ? (
                <input
                  name="contact_phone"
                  value={patient.contact_phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className={classNames(inputBase, "bg-white")}
                />
              ) : patient.contact_phone ? (
                <a
                  className="text-sm text-gray-700 hover:text-[#3078E2] cursor-pointer"
                  href={`tel:${patient.contact_phone}`}
                >
                  {patient.contact_phone}
                </a>
              ) : (
                <span className="text-sm text-gray-500">No phone</span>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <FiMail className="text-[#3078E2]" />
              {isEditing ? (
                <input
                  name="contact_email"
                  value={patient.contact_email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={classNames(inputBase, "bg-white")}
                />
              ) : patient.contact_email ? (
                <a
                  className="text-sm text-gray-700 hover:text-[#3078E2] cursor-pointer"
                  href={`mailto:${patient.contact_email}`}
                >
                  {patient.contact_email}
                </a>
              ) : (
                <span className="text-sm text-gray-500">No email</span>
              )}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions */}
          <div className={classNames(cardBase, "p-6 lg:col-span-2")}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Sessions</h2>
              <span className="text-xs text-gray-500">
                {sessionsRows.length} total
              </span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 text-xs font-medium text-gray-500 px-3 pb-2">
              <div className="col-span-2">#</div>
              <div className="col-span-4">Date</div>
              <div className="col-span-4">Status</div>
              <div className="col-span-2 text-right">Open</div>
            </div>

            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
              {sessionsLoading && (
                <div className="p-4 space-y-3 bg-white">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              )}

              {!sessionsLoading && sessionsError && (
                <div className="p-6 bg-white">
                  <p className="text-sm text-red-600">{sessionsError}</p>
                </div>
              )}

              {!sessionsLoading && !sessionsError && sessionsRows.length === 0 && (
                <div className="p-10 bg-white text-center">
                  <p className="text-sm text-gray-600">No sessions yet.</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Create a new session for this patient to start the workflow.
                  </p>
                </div>
              )}

              {!sessionsLoading &&
                !sessionsError &&
                sessionsRows.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => navigate(`/sessions/${row.id}`)}
                    className="grid grid-cols-12 items-center px-3 py-3 bg-white hover:bg-gray-50 transition cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigate(`/sessions/${row.id}`);
                      }
                    }}
                    aria-label={`Open session ${row.id}`}
                    title="Open session"
                  >
                    <div className="col-span-2 text-sm text-gray-700">
                      {row.indexLabel}
                    </div>
                    <div className="col-span-4 text-sm text-gray-700">
                      {row.date}
                    </div>
                    <div className="col-span-4">
                      <StatusPill status={row.status} />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sessions/${row.id}`);
                        }}
                        className="inline-flex items-center justify-center rounded-full p-2 text-[#3078E2] hover:bg-[#3078E2]/10 cursor-pointer"
                        aria-label={`View session ${row.id}`}
                        title="View session"
                      >
                        <FiEye />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Notes */}
          <div className={classNames(cardBase, "p-6")}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
              {isEditing ? (
                <span className="text-xs text-gray-500">Editable</span>
              ) : (
                <span className="text-xs text-gray-500">Read only</span>
              )}
            </div>

            {isEditing ? (
              <textarea
                name="notes"
                value={patient.notes}
                onChange={handleChange}
                placeholder="Write notes about the patient..."
                className={classNames(inputBase, "min-h-[160px] resize-none")}
              />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {patient.notes || "No notes."}
              </p>
            )}
          </div>
        </div>

        {/* Bottom hint */}
        {isEditing && (
          <div className="mt-6 text-xs text-gray-500">
            Tip: Don’t forget to hit <span className="font-semibold">Save</span>.
          </div>
        )}
      </div>
    </div>
  );
}
