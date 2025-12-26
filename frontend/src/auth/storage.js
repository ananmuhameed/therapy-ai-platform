import api from "../api/axiosInstance";
import { redirectToLogin } from "./navigation";

export const STORAGE_KEYS = {
  USER: "user",
};

// --------------------
// In-memory access token
// --------------------
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

// --------------------
// User (safe to persist)
// --------------------
export const setUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || null;
  } catch {
    return null;
  }
};

export const clearUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// --------------------
// Unified helpers
// --------------------
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
  } catch (e) {
    // even if backend fails, we still clear client state
  } finally {
    clearAuth();
    redirectToLogin();
  }
}