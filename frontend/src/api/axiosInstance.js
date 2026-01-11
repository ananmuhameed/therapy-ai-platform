import axios from "axios";
import { getAccessToken, setAccessToken, clearAuth } from "../auth/storage";
import { redirectToLogin } from "../auth/navigation";

export const raw = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
});

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

function resolveQueue(error, token = null) {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    //  NEVER refresh on public endpoints
    if (PUBLIC_ENDPOINTS.some(p => original.url.includes(p))) {
  return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          queue.push({
            resolve: token => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          })
        );
      }

      isRefreshing = true;

      try {
        const res = await raw.post("/auth/token/refresh/");
        setAccessToken(res.data.access);
        resolveQueue(null, res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch (e) {
        resolveQueue(e);
        clearAuth();
        redirectToLogin();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
