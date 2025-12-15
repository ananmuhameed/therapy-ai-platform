import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { getUser, getAccessToken, clearAuth } from "../auth/storage";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    //getting cached user
    const cached = getUser();
    if (cached) setUser(cached);

    const loadMe = async () => {
      try {
        const { data } = await api.get("/auth/me/");
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to load /auth/me:", err);
        clearAuth();
        navigate("/login", { replace: true });
      }
    };

    loadMe();
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  if (!user) {
    return (
      <div className="p-8">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <p className="mb-6">
        Welcome, <strong>{user.full_name || user.email}</strong>
      </p>

      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded bg-red-600 text-white"
      >
        Logout
      </button>

      {/* DEV ONLY */}
      {import.meta.env.DEV && (
        <>
          <h3 className="mt-8 font-semibold">Debug user data</h3>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
