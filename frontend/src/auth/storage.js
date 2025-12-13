export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  USER: "user",
};

export const setAuth = ({ accessToken, user }) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const getAccessToken = () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || null;
  } catch {
    return null;
  }
};