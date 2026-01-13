import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import { formatDate } from "../../utils/helpers";

import { FiArrowLeft, FiEdit, FiTrash2, FiCheck, FiX } from "react-icons/fi";

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

  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState({
    full_name: "",
    gender: "",
    date_of_birth: "",
    contact_phone: "",
    contact_email: "",
    notes: "",
  });

  const [savedPatient, setSavedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  const isDirty = useMemo(() => {
    if (!savedPatient) return false;
    return JSON.stringify(patient) !== JSON.stringify(savedPatient);
  }, [patient, savedPatient]);

  useEffect(() => {
    const fetchPatientAndSessions = async () => {
      setLoading(true);
      setError("");
      setSessionsError("");

      try {
        const patientRes = await api.get(`/patients/${patientId}/`);
        setPatient(patientRes.data);
        setSavedPatient(patientRes.data);

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
          setSessionsError("Failed to load sessions for this patient.");
          setSessions([]);
        } finally {
          setSessionsLoading(false);
        }
      } catch (err) {
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
      date: formatDate(s.session_date || s.created_at, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      status: s.status,
    }));
  }, [sessions]);

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
      setSavedPatient(res.data);
      setIsEditing(false);

      toast.success("Patient profile saved successfully");
    } catch (err) {
      setError("Failed to save changes.");
      toast.error("Failed to save changes");
    }
  };

  const handleCancel = async () => {
    if (!isDirty) {
      setIsEditing(false);
      return;
    }

    const res = await Swal.fire({
      title: "Discard changes?",
      text: "Your unsaved changes will be lost.",
      icon: "warning",
      confirmButtonText: "Discard",
      cancelButtonText: "Keep editing",
      showCancelButton: true,
      reverseButtons: true,
    });

    if (!res.isConfirmed) return;

    if (savedPatient) setPatient(savedPatient);
    setIsEditing(false);
    toast.info("Changes discarded");
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Patient?",
      text: "This action is permanent.",
      icon: "warning",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      showCancelButton: true,
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/patients/${patientId}/`);
      toast.success("Patient deleted successfully");
      navigate("/patients");
    } catch (err) {
      setError("Failed to delete patient.");
      toast.error("Failed to delete patient");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] p-8">
        <Skeleton className="h-10 w-10 rounded-full mb-6" />
        <Skeleton className="h-32 w-full rounded-2xl mb-6" />
        <Skeleton className="h-32 w-full rounded-2xl mb-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] p-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/patients")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))] hover:opacity-80"
          >
            <FiArrowLeft size={20} className="text-[rgb(var(--primary))]" />
          </button>
        </div>
        <div className="p-6 bg-[rgb(var(--card))] rounded-2xl border border-red-500/30 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <div className="mx-auto max-w-full px-2 sm:px-3 md:px-4 py-8 text-[rgb(var(--text))]">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/patients")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))] hover:opacity-80"
            aria-label="Back"
          >
            <FiArrowLeft size={20} className="text-[rgb(var(--primary))]" />
          </button>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95"
                >
                  <FiEdit /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95"
                >
                  <FiTrash2 /> Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95"
                >
                  <FiCheck /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95"
                >
                  <FiX /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <PatientInfoCard
          patient={patient}
          patientId={patientId}
          isEditing={isEditing}
          onChange={handleChange}
        />

        <ContactCard patient={patient} isEditing={isEditing} onChange={handleChange} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SessionsCard
            sessions={sessionsRows}
            loading={sessionsLoading}
            error={sessionsError}
            onOpenSession={(id) => navigate(`/sessions/${id}`)}
          />

          <NotesCard notes={patient.notes} isEditing={isEditing} onChange={handleChange} />
        </div>

        {isEditing && (
          <div className="mt-6 text-xs text-[rgb(var(--text-muted))]">
            Tip: Don’t forget to hit <span className="font-semibold">Save</span>.
          </div>
        )}
      </div>
    </div>
  );
}
