export function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

export const formatDate = (iso, options = { month: "short", day: "2-digit" }) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, options);
};

export const calculateAge = (dob) => {
  if (!dob) return "";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : "";
};


import Swal from "sweetalert2";
import { toast } from "react-toastify";
import api from "../api/axiosInstance";

export const handleDeleteSession = async (sessionId, setSessions) => {
  const result = await Swal.fire({
    title: "Delete Session?",
    text: "This action is permanent and cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#cbd5e1",
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    await api.delete(`/sessions/${sessionId}/`);
    toast.success("Session deleted successfully.");
    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== sessionId)
    ); // Remove session from the list
  } catch (err) {
    toast.error("Failed to delete session.");
  }
};
