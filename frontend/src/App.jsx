import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { setNavigate } from "./auth/navigation";
import "./index.css";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import PatientsListPage from "./pages/PatientList/PatientsListPage";
import Session from "./pages/Session/SessionPage";
import PatientProfile from "./pages/PatientProfile/PatientProfile";
import TherapistProfile from "./pages/TherapistProfile/TherapistProfile";
import SessionDetailsPage from "./pages/SessionDetails/SessionDetailsPage";
import SessionsPage from "./pages/SessionsList/SessionsPage";
import ReportsPage from "./pages/Report/ReportsPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VerifyEmail from "./pages/VerifyEmai/VerifyEmail";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/patients/:patientId" element={<PatientProfile />} />
        <Route path="/therapistprofile" element={<TherapistProfile />} />
        <Route path="/sessions/:sessionId" element={<SessionDetailsPage />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sessions/new" element={<Session />} />
          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          
        </Route>
      </Routes>
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  closeOnClick
  pauseOnHover
  draggable
  style={{ zIndex: 999999 }}
/>
      </>
  );
}

export default App;
