import axios from "axios";

//axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
});

//JWT interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

export const uploadSessionAudio = async (sessionId, file) => {
  const formData = new FormData();
  formData.append("audio_file", file);

  // We use 'api' here (the instance defined above)
  return api.patch(`/therapy_sessions/${sessionId}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
