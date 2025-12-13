import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, getAccessToken, clearAuth } from "../auth/storage";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 🔒 Route guard + user loading
  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      // Not logged in → kick out
      navigate("/login", { replace: true });
      return;
    }

    // For now (dummy auth), load user from storage
    setUser(getUser());
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