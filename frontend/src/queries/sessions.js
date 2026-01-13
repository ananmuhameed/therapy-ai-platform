import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { qk } from "./queryKeys";
import { toast } from "react-toastify";
import { confirmDialog } from "../utils/confirmDialog";

const normalizeList = (data) => (Array.isArray(data) ? data : data?.results || []);

async function fetchSessions() {
  const { data } = await api.get("/sessions/");
  return normalizeList(data);
}
export function useSession(sessionId, options = {}) {
  return useQuery({
    queryKey: qk.session(sessionId),
    queryFn: () => fetchSession(sessionId),
    enabled: Boolean(sessionId),

    // important: don’t block refetching after navigation
    staleTime: 0,

    refetchInterval: (query) => {
      const s = query.state.data;

      // while we have no data yet, keep checking
      if (!s) return 1000;

      const tStatus = s.transcript?.status; // may be undefined if transcript not created yet
      const rStatus = s.report?.status;     // may be undefined if report not created yet

      const transcriptReady = ["completed", "failed"].includes(tStatus);
      const reportReady = ["completed", "failed"].includes(rStatus);

      // If either object is missing OR not ready → poll
      const transcriptPending = !s.transcript || !transcriptReady;
      const reportPending = !s.report || !reportReady;

      return (transcriptPending || reportPending) ? 1500 : false;
    },

    refetchIntervalInBackground: true,

    ...options,
  });
}



async function fetchSession(sessionId) {
  const { data } = await api.get(`/sessions/${sessionId}/`);
  return data;
}

export function useGenerateReport(sessionId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(`/sessions/${sessionId}/generate_report/`);
    },

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.session(sessionId) });

      const prev = qc.getQueryData(qk.session(sessionId));

      qc.setQueryData(qk.session(sessionId), (old) => {
        if (!old) return old;
        return {
          ...old,
          report: old.report
            ? { ...old.report, status: "queued" }
            : { status: "queued" },
        };
      });

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.session(sessionId), ctx.prev);
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.session(sessionId) });
      qc.invalidateQueries({ queryKey: qk.sessions });
      qc.invalidateQueries({ queryKey: qk.reports });
    },
  });
}


export function useReplaceAudio(sessionId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("audio_file", file);
      await api.post(`/sessions/${sessionId}/replace-audio/`, formData);
    },

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.session(sessionId) });

      const prev = qc.getQueryData(qk.session(sessionId));

      qc.setQueryData(qk.session(sessionId), (old) => {
        if (!old) return old;
        return {
          ...old,
          transcript: old.transcript
            ? { ...old.transcript, status: "queued", cleaned_transcript: "" }
            : { status: "queued", cleaned_transcript: "" },
          report: old.report ? { ...old.report, status: "queued" } : old.report,
          status: "processing", // if you have session.status
        };
      });

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.session(sessionId), ctx.prev);
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.session(sessionId) });
      qc.invalidateQueries({ queryKey: qk.sessions });
    },
  });
}

export function useDeleteSession(setSessions) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId) => {
      const result = await confirmDialog({
        title: "Delete Session?",
        text: "This action is permanent and cannot be undone.",
        confirmText: "Yes, delete",
        confirmColor: "#d33",
        cancelText: "Cancel",
        cancelColor: "#cbd5e1",
      });

      if (!result.isConfirmed) return { cancelled: true };

      await api.delete(`/sessions/${sessionId}/`);
      return { cancelled: false, sessionId };
    },

    onSuccess: (res) => {
      if (res?.cancelled) return;

      // Show success toast
      toast.success("Session deleted successfully.");

      // Invalidate session cache to refetch
      qc.invalidateQueries({ queryKey: qk.sessions });

      // Remove the deleted session from the state list (UI update)
      if (setSessions) {
        setSessions((prevSessions) =>
          prevSessions.filter((session) => session.id !== res.sessionId)
        );
      }
    },

    onError: () => {
      toast.error("Failed to delete session.");
    },
  });
}