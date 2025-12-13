import React from "react";
import { Navigate } from "react-router-dom";

function isAuthenticated() {
  return !!localStorage.getItem("access_token");
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
