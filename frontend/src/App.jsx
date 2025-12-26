import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientsListPage from "./pages/PatientsListPage";
import Session from "./pages/SessionPage";
import PatientProfile from "./pages/PatientProfile";
import SessionsListPage from "./pages/SessionsListPage";
import ReportsPage from "./pages/ReportsPage";


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patients/:patientId" element={<PatientProfile />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Sessions */}
          <Route path="/sessions" element={<SessionsListPage />} />
          <Route path="/sessions/new" element={<Session />} />

          {/* Patients */}
          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="/patients/:patientId" element={<PatientProfile />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

      </Routes>
    </HashRouter>
  );
}

export default App;
