import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import api from "../api/axiosInstance";

export const useDeleteSession = () => {
  const [sessions, setSessions] = useState([]);

  const deleteSession = async (sessionId) => {
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

  return { deleteSession, sessions, setSessions };
};
