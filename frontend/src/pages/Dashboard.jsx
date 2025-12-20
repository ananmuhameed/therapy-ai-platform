import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { getUser, getAccessToken, clearAuth } from "../auth/storage";
import { FiUsers, FiMic, FiFileText, FiPlus } from "react-icons/fi";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

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

  if (!user) {
    return (
      <div className="p-8">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8">
      {/* Title */}
      <h1 style={{ fontSize: 32, color: "#727473" }} className="font-semibold">
        Therapist Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox icon={<FiUsers size={22} />} label="Patients" value="20" />
        <StatBox icon={<FiMic size={22} />} label="Sessions this week" value="5" />
        <StatBox icon={<FiFileText size={22} />} label="Reports Ready" value="3" />
      </div>

      {/* Actions */}
      <div className="flex gap-4 items-center">
        <GradientButton
          ariaLabel="Add patient"
          onClick={() => navigate("/patients?add=1")}
        >
          <FiPlus size={18} />
          Add Patient
        </GradientButton>

        <Link to="/sessions/new" className="no-underline">
          <GradientButton ariaLabel="Go to new session page">
            <FiMic size={18} />
            New Session
          </GradientButton>
        </Link>

      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-3 font-semibold mb-4">
          <span>Recent Sessions</span>
          <span>Date</span>
          <span>Status</span>
        </div>

        {[
          { name: "patient 1", date: "Dec.12", status: "Processing" },
          { name: "patient 2", date: "Dec.10", status: "Transcribed" },
          { name: "patient 3", date: "Dec.08", status: "Analysed" },
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-3 py-2 text-gray-600">
            <span>{row.name}</span>
            <span>{row.date}</span>
            <span>{row.status}</span>
          </div>
        ))}
      </div>

      {/* DEV */}
      {import.meta.env.DEV && (
        <pre className="text-xs bg-gray-100 p-4 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      )}
    </div>
  );
}

/* ---------- UI ---------- */

function StatBox({ icon, label, value }) {
  return (
    <div
      className="flex items-center gap-4 px-6 py-4 rounded-xl"
      style={{ backgroundColor: "#F0F3FA" }}
    >
      {icon}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function GradientButton({ children, ariaLabel, onClick }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="
        flex items-center gap-2
        px-6 py-3
        rounded-full
        text-white font-medium
        shadow-md
        transition
        hover:scale-[1.03]
        active:scale-[0.97]
      "
      style={{
        background:
          "linear-gradient(90deg, #3078E2 0%, #8AAEE0 50%, #C6D2EC 100%)",
      }}
    >
      {children}
    </button>
  );
}
