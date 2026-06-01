import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

import { useAuthContext } from "../context/AuthContext.jsx";


/* ---------------- ProtectedRoute ---------------- */
function ProtectedRoute({ component: Component, adminOnly = false }) {
  const auth = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.user === undefined) return; // still loading

    if (!auth.user) {
      navigate("/login");
      return;
    }

    if (adminOnly && auth.user.role !== "admin") {
      navigate("/admin_dashboard");
    }
  }, [auth.user, adminOnly, navigate]);

  // While loading or redirecting → show nothing
  if (auth.user === undefined) return <div>Loading...</div>;

  // If user exists AND allowed → render page
  if (auth.user && (!adminOnly || auth.user.role === "admin")) {
    return <Component />;
  }

  return null;
}

export default ProtectedRoute;