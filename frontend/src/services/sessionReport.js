import api from "../api/axiosInstance";

export const updateSessionReport = (sessionId, payload) =>
  api.patch(`/sessions/${sessionId}/report/`, payload);

export const downloadSessionReportPDF = (sessionId) =>
  api.get(`/sessions/${sessionId}/report/pdf/`, {
    responseType: "blob",
  });
