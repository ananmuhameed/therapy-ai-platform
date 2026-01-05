import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { qk } from "./queryKeys";

const normalizeList = (data) => (Array.isArray(data) ? data : data?.results || []);

async function fetchSessions() {
  const { data } = await api.get("/sessions/");
  return normalizeList(data);
}

export function useSessions(options = {}) {
  return useQuery({
    queryKey: qk.sessions,
    queryFn: fetchSessions,
    staleTime: 30_000,
    ...options,
  });
}

async function fetchSession(sessionId) {
  const { data } = await api.get(`/sessions/${sessionId}/`);
  return data;
}

export function useSession(sessionId, options = {}) {
  return useQuery({
    queryKey: qk.session(sessionId),
    queryFn: () => fetchSession(sessionId),
    enabled: Boolean(sessionId),
    staleTime: 15_000,
    ...options,
  });
}

export function useGenerateReport(sessionId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(`/sessions/${sessionId}/generate_report/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.session(sessionId) });
      qc.invalidateQueries({ queryKey: qk.sessions });
      qc.invalidateQueries({ queryKey: qk.reports }); // if you have reports page
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.session(sessionId) });
      qc.invalidateQueries({ queryKey: qk.sessions });
    },
  });
}
