import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();


  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {user ? (
        <p>Welcome, {user.full_name || user.email}</p>
      ) : (
        <p>No user data available (dummy auth).</p>
      )}

      <button onClick={handleLogout}>Logout</button>

      <h3>Debug user data (dev only)</h3>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
