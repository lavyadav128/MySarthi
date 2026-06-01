import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE } from "../../environment.jsx";

import { useLanguage } from "../../context/LanguageContext";

function Signup() {
  const {t} = useLanguage();

  const navigate = useNavigate();

  // 🔐 Read admin invite token from URL
  const params = new URLSearchParams(window.location.search);
  const adminInvite = params.get("adminInvite");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    confirm_password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
      e.preventDefault();
      setError("");

      try {
        // ✅ Add password confirmation check FIRST
        if (form.password !== form.confirm_password) {
          setError("Passwords do not match");
          return;
        }

        setLoading(true);

        const res = await fetch(`${API_BASE}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone, // ✅ Add phone field
            password: form.password,
            adminInvite, // ✅ admin invite safely passed
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");

        // ✅ Save email for OTP verification
        sessionStorage.setItem("verify_email", form.email);

        // ✅ Redirect to OTP verification
        navigate("/verify-email", { replace: true });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {adminInvite ? "Admin Registration" : t.k18}
          </h1>
          <p className="text-slate-600 mt-2">
            {t.k7}
          </p>
        </div>

        {adminInvite && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            You are registering as an <b>Admin</b> via invite link.
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            placeholder={t.name}
            required
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="email"
            placeholder={t.k2}
            required
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="phone"
            placeholder={t.k10}
            required
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="password"
            placeholder={t.k3}
            required
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="password"
            placeholder={t.k8}
            required
            value={form.confirm_password}
            onChange={(e) =>
              setForm({ ...form, confirm_password: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg"
          >
            {loading ? t.k9 : t.signup}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-slate-600">
          {t.l9}{" "}
          <a href="/login" className="text-blue-600">
            {t.login}
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
