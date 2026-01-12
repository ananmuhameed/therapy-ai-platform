import api from "../api/axiosInstance";
import { redirectToLogin } from "./navigation";

const ACCESS_KEY = "accessToken";

export const setAccessToken = (token) => {
  if (token) localStorage.setItem(ACCESS_KEY, token);
  else localStorage.removeItem(ACCESS_KEY);
};

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_KEY);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_KEY);
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const clearUser = () => {
  localStorage.removeItem("user");
};

export const setAuth = ({ accessToken, user }) => {
  setAccessToken(accessToken);
  setUser(user);
};

export const clearAuth = () => {
  clearAccessToken();
  clearUser();
};

export async function logout() {
  try {
    await api.post("/auth/logout/");
  } finally {
    clearAuth();
    redirectToLogin();
  }
}
