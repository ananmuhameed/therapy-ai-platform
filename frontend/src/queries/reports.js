import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { qk } from "./queryKeys";

const normalizeList = (data) =>
  Array.isArray(data) ? data : data?.results || [];

async function fetchReportsPrefer() {
  // 1) Try /reports/
  try {
    return { source: "reports", list: normalizeList(data) };
  } catch (err) {
    const status = err?.response?.status;
    if (status && status !== 404) throw err;
    // fallback to /sessions/
    const { data: sData } = await api.get("/sessions/");
    return { source: "sessions", list: normalizeList(sData) };
  }
}

export function useReportsPrefer(options = {}) {
  return useQuery({
    queryKey: qk.reports,
    queryFn: fetchReportsPrefer,
    staleTime: 30_000,
    ...options,
  });
}
