import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { setNavigate } from "./auth/navigation";
import "./index.css";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientsListPage from "./pages/PatientsListPage";
import Session from "./pages/SessionPage";
import PatientProfile from "./pages/PatientProfile";
import TherapistProfile from "./pages/TherapistProfile";
import SessionDetail from "./pages/SessionDetails";
import SessionsListPage from "./pages/SessionsListPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patients/:patientId" element={<PatientProfile />} />
        <Route path="/therapistprofile" element={<TherapistProfile />} />
        <Route path="/sessions/:sessionId" element={<SessionDetail />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sessions/new" element={<Session />} />
          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="/sessions" element={<SessionsListPage />} />
          <Route path="/reports" element={<ReportsPage />} />

        </Route>
      </Routes>
  );
}

export default App;
