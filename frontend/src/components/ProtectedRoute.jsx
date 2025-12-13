import React from "react";
import { Navigate } from "react-router-dom";

const TOKEN_KEY = "access_token";

function isAuthenticated() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
