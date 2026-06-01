import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext";

function ProfileIcon() {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
      alt="Profile"
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid #1976d2",
      }}
    />
  );
}


export function Nav() {

  const {t, lang, changeLanguage } = useLanguage();

  const auth = useAuthContext();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const doLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <>
      {/* Navbar */}
      {/* <nav className="bg-white shadow-md"> */}
      <nav
        className="
          fixed top-0 left-0 right-0
          bg-white shadow-md z-40
        "
        style={{
          paddingTop: "env(safe-area-inset-top)", // iOS notch
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-blue-600"
            >
              <img
                src="/logo.png"
                alt="MySaarthi logo"
                className="h-10 w-10"
              />
              <span className="text-2xl">{t.MySaarthi}</span>
            </Link>


            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={toggleDrawer}
            >
              <Menu className="w-6 h-6" />
            </button>

              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              
              <Link to="/contact" className="text-gray-700 hover:text-blue-600">
                    {t.contact}
              </Link>

              {auth.user?.role === "user" && (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                    {t.dashboard}
                  </Link>
                  <Link to="/assessment" className="text-gray-700 hover:text-blue-600">
                    {t.quiz}
                  </Link>
                  <Link to="/update_profile" className="text-gray-700 hover:text-blue-600">
                    <ProfileIcon />
                  </Link>
                </>
              )}

              {auth.user?.role === "admin" && (
                <>
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                    {t.qa_panel}
                  </Link>
                  <Link to="/admin_dashboard" className="text-gray-700 hover:text-blue-600">
                    {t.dashboard}
                  </Link>
                  <Link to="/resume_parser" className="text-gray-700 hover:text-blue-600">
                    {t.resume}
                  </Link>

                  <Link to="/update_profile" className="text-gray-700 hover:text-blue-600">
                    <ProfileIcon />
                  </Link>
                </>
              )}

              {auth.user ? (
                <button
                  onClick={doLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  {t.logout}
                </button>
              ) : (
                <>

                  <Link to="/" className="text-gray-700 hover:text-blue-600">
                    {t.home}
                  </Link>

                  <Link
                    to="/login"
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {t.signup}
                  </Link>                  
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={toggleDrawer}
        >
          <div
            className="bg-white w-64 h-full p-4"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">{t.MySaarthi}</h2>

            <div className="flex flex-col gap-3">
              <Link to="/" onClick={toggleDrawer}>{t.home}</Link>

              {auth.user?.role === "user" && (
                <>
                  <Link to="/contact" onClick={toggleDrawer}>{t.contact}</Link>
                  <Link to="/dashboard" onClick={toggleDrawer}>{t.dashboard}</Link>
                  <Link to="/assessment" onClick={toggleDrawer}>
                    {t.quiz}
                  </Link>
                  <Link to="/update_profile" onClick={toggleDrawer}>{t.Profile}</Link>
                </>
              )}

              {auth.user?.role === "admin" && (
                <>
                  <Link to="/admin" onClick={toggleDrawer}>{t.AdminPanel}</Link>
                  <Link to="/admin_dashboard" onClick={toggleDrawer}>
                    {t.dashboard}
                  </Link>
                  <Link to="/resume_parser" onClick={toggleDrawer}>
                    {t.resume}
                  </Link>
                  <Link to="/update_profile" onClick={toggleDrawer}>{t.Profile}</Link>
                </>
              )}

              <hr />

              {!auth.user ? (
                <>
                  <Link to="/login" onClick={toggleDrawer}>{t.login}</Link>
                  <Link to="/signup" onClick={toggleDrawer}>{t.signup}</Link>
                </>
              ) : (
                <button
                  onClick={doLogout}
                  className="text-left text-red-600"
                >
                  {t.logout}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
