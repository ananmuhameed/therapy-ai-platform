import api from "../api/axiosInstance";
import { redirectToLogin } from "./navigation";

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
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
