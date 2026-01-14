import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import { formatDate, classNames } from "../../utils/helpers";
import { useDeleteSession } from "../../queries/sessions";


// Icons
import { FiArrowLeft, FiEdit, FiTrash2, FiCheck, FiX } from "react-icons/fi";

// Components
import Skeleton from "../../components/ui/Skeleton";
import PatientInfoCard from "./PatientInfoCard";
import ContactCard from "./ContactCard";
import SessionsCard from "./SessionCard";
import NotesCard from "./NotesCard";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function PatientProfile() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  
  
  // --- State ---
  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState({
    full_name: "",
    gender: "",
    date_of_birth: "",
    contact_phone: "",
    contact_email: "",
    notes: "",
  });
  
  // Snapshot to detect unsaved changes + restore on Cancel
  const [savedPatient, setSavedPatient] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const deleteSession = useDeleteSession(setSessions);
  
  // --- Helpers ---
  const isDirty = useMemo(() => {
    if (!savedPatient) return false;
    return JSON.stringify(patient) !== JSON.stringify(savedPatient);
  }, [patient, savedPatient]);

  // --- Effects ---
  useEffect(() => {
    const fetchPatientAndSessions = async () => {
      setLoading(true);
      setError("");
      setSessionsError("");

      try {
        const patientRes = await api.get(`/patients/${patientId}/`);
        setPatient(patientRes.data);
        setSavedPatient(patientRes.data); // ✅ snapshot baseline

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
              const ta = new Date(
                a?.session_date || a?.created_at || 0
              ).getTime();
              const tb = new Date(
                b?.session_date || b?.created_at || 0
              ).getTime();
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

   const handleDeleteSessionFromPatientProfile = (sessionId) => {
    deleteSession.mutate(sessionId)
  };

  // --- Helpers ---
  const sessionsRows = useMemo(() => {
    return sessions.map((s, i) => ({
      id: s.id,
      indexLabel: `${i + 1}`,
      date: formatDate(s.session_date || s.created_at, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      status: s.status,
    }));
  }, [sessions]);

  // --- Handlers ---
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
      setSavedPatient(res.data); // ✅ update snapshot baseline
      setIsEditing(false);

      toast.success("Patient profile saved successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
      toast.error("Failed to save changes");
    }
  };

  const handleCancel = async () => {
    // If nothing changed, just exit edit mode
    if (!isDirty) {
      setIsEditing(false);
      return;
    }
    const res = await Swal.fire({
      title: "Discard changes?",
      text: "Your unsaved changes will be lost.",
      icon: "warning",
      iconColor: "#2563eb",
      width: "420px",
      padding: "1.5rem",
      showCancelButton: true,
      confirmButtonColor: "#64748b",
      cancelButtonColor: "#cbd5e1",
      confirmButtonText: "Discard",
      cancelButtonText: "Keep editing",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl",
      },
    });

    if (!res.isConfirmed) return;

    // Restore saved snapshot
    if (savedPatient) setPatient(savedPatient);
    setIsEditing(false);
    toast.info("Changes discarded");
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Patient?",
      text: "This action is permanent and cannot be undone.",
      icon: "warning",
      iconColor: "#2563eb",
      width: "400px",
      padding: "1.5rem",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#cbd5e1",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/patients/${patientId}/`);
      toast.success("Patient deleted successfully");
      navigate("/patients");
    } catch (err) {
      console.error(err);
      setError("Failed to delete patient.");
      toast.error("Failed to delete patient");
    }
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
        <Skeleton className="h-10 w-10 rounded-full mb-6" />
        <Skeleton className="h-32 w-full rounded-2xl mb-6" />
        <Skeleton className="h-32 w-full rounded-2xl mb-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/patients")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <FiArrowLeft size={20} className="text-[#3078E2]" />
          </button>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-red-100 text-red-600">
          {error}
        </div>
      </div>
    );
  }

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
                  <FiEdit /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E23030] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
                >
                  <FiTrash2 /> Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
                >
                  <FiCheck /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
                >
                  <FiX /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* 1. Header Card */}
        <PatientInfoCard
          patient={patient}
          patientId={patientId}
          isEditing={isEditing}
          onChange={handleChange}
        />

        {/* 2. Contact Card */}
        <ContactCard
          patient={patient}
          isEditing={isEditing}
          onChange={handleChange}
        />

        {/* 3. Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SessionsCard
            sessions={sessionsRows}
            loading={sessionsLoading}
            error={sessionsError}
            onOpenSession={(id) => navigate(`/sessions/${id}`)}
            onDeleteSession={handleDeleteSessionFromPatientProfile}
          />

          <NotesCard
            notes={patient.notes}
            isEditing={isEditing}
            onChange={handleChange}
          />
        </div>

        {/* Bottom hint */}
        {isEditing && (
          <div className="mt-6 text-xs text-gray-500">
            Tip: Don’t forget to hit <span className="font-semibold">Save</span>
            .
          </div>
        )}
      </div>
    </div>
  );
}