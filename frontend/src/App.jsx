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
import Home from "../Home/pages/Home/Home";
import LandingLayout from "../Home/Layout/Landinglayout";
import FeaturesPage from "../Home/pages/Features/FeaturesPage";
import Plans from "../Home/pages/Plans/Plans";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <>
      <Routes>

        {/* Landing Layout */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Auth */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Standalone Pages */}
        <Route
          path="/patients/:patientId"
          element={
            <ProtectedRoute>
              <PatientProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapistprofile"
          element={
            <ProtectedRoute>
              <TherapistProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sessions/:sessionId"
          element={
            <ProtectedRoute>
              <SessionDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Main App Layout */}
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions/new"
            element={
              <ProtectedRoute>
                <Session />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
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
