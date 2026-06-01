// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import ContactForm from "./ContactForm";
import LandingPage from "./components/LandingPage.jsx";
import { Nav } from "./components/NavBar.jsx"
import { AuthProvider } from "./context/AuthContext.jsx";
import Signup from "./components/auth/Signup.jsx"
import Login from "./components/auth/Login.jsx"
import Dashboard from "./components/Dashboard.jsx";
import ProfileCreate from "./components/CreateProfile.jsx"
import AdminPanel from "./components/AdminPanel.jsx"
import useAuth from "./components/auth/UseAuth.jsx";
import ProtectedRoute from "./components/ProtectRoute.jsx";
import AssessmentPage from "./components/Assignment.jsx"
import AdminDashboard from "./components/AdminDashboard.jsx";
import ResumeParser from "./ResumeParser.jsx";
import VerifyEmail from "./components/auth/VerifyEmail.jsx";
import AdminMessagesToUser from "./AdminMessagesToUser.jsx";
import UpdateProfile from "./components/UpdateProfile.jsx";


import { useEffect } from "react";
import { StatusBar } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

// import { useLanguage } from "./context/LanguageContext";
// import LanguageSelect from "./components/LanguageSelector.jsx";


function App() {

  // const { lang } = useLanguage();

  // if (!lang) {
  //   return <LanguageSelect />;
  // }

  useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.setBackgroundColor({ color: "#0d0c0c" });
    StatusBar.setStyle({ style: "DARK" });
  }
}, []);


  return (
    <Shell>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Authenticated users */}
        <Route
          path="/assessment"
          element={<ProtectedRoute component={AssessmentPage} />}
        />
        <Route
          path="/profile/create"
          element={<ProtectedRoute component={ProfileCreate} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute component={Dashboard} />}
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={<ProtectedRoute component={AdminPanel} adminOnly />}
        />
        <Route
          path="/admin_dashboard"
          element={<ProtectedRoute component={AdminDashboard} adminOnly />}
        />
        <Route
          path="/messages"
          element={<ProtectedRoute component={AdminMessagesToUser} />}
        />

        <Route
          path="/update_profile"
          element={<ProtectedRoute component={UpdateProfile} />}
        />

        <Route
          path="/resume_parser"
          element={<ProtectedRoute component={ResumeParser} adminOnly />}
        />

        {/* Optional: keep public if needed */}
        <Route path="/contact" element={<ContactForm />} />
      </Routes>

    </Shell>
  );
}

function Shell({ children }) {
  const auth = useAuth();
  return (
    <AuthProvider value={auth}>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <Nav />
        <div style={{
            paddingTop: "calc(env(safe-area-inset-top) + 64px)",
          }}>{children}</div>
      </div>
    </AuthProvider>
  );
}

export default App;