import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateSession from "./components/CreateSession";
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-session" element={<CreateSession />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
