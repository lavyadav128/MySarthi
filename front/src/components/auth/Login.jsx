import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

import { API_BASE } from "../../environment.jsx";

import { useLanguage } from "../../context/LanguageContext";

function Login() {

  const {t} = useLanguage();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const auth = useAuthContext();
  const navigate = useNavigate();

  const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};


  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      /* ---------- EMAIL NOT VERIFIED ---------- */
      if (res.status === 403 && data.error === "Email not verified") {
        sessionStorage.setItem("verify_email", form.email);
        navigate("/verify-email", { replace: true });
        return;
      }

      /* ---------- ACCOUNT LOCKED ---------- */
      if (res.status === 403 && data.error?.includes("locked")) {
        throw new Error(
          "Your account is temporarily locked due to multiple failed login attempts. Please try again later."
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      /* ---------- SAVE AUTH ---------- */
      auth.login(data.token, data.user);

      /* ---------- ROLE-BASED REDIRECT ---------- */
      if (data.user.role === "admin") {
        navigate("/admin_dashboard", { replace: true });
        return;
      }

      /* ---------- USER PROFILE CHECK ---------- */
      const profileRes = await fetch(`${API_BASE}/profiles/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!profileRes.ok) {
        navigate("/profile/create", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {t.Welcomeback}
            </h1>
            <p className="text-slate-600 mt-2">
              {t.k1}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.k2}
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.k3}
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex justify-center"
            >
              {loading ? t.k5 : t.k4}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              {t.k6}{" "}
              <a href="/signup" className="text-blue-600 font-medium">
                {t.signup}
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
