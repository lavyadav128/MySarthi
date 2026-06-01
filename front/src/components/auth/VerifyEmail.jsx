import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../environment.jsx";

function VerifyEmail() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [counter, setCounter] = useState(60);

  /* ---------------- Countdown ---------------- */
  useEffect(() => {
    if (counter <= 0) return;
    const timer = setInterval(() => setCounter(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  /* ---------------- Load Email ---------------- */
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verify_email");

    if (!storedEmail) {
      navigate("/signup", { replace: true });
    } else {
      setEmail(storedEmail.trim().toLowerCase());
    }
  }, [navigate]);

  /* ---------------- Resend OTP ---------------- */
  const resendOtp = async () => {
    setError("");
    setOtp("");

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");

      setCounter(60);
      alert("OTP resent successfully!");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Verify OTP ---------------- */
  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      sessionStorage.removeItem("verify_email");

      if (data.user?.role === "admin") {
        navigate("/admin_dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2 text-center">Verify Your Email</h1>
        <p className="text-sm text-slate-600 text-center mb-6">
          Enter the 6-digit code sent to <b>{email}</b>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-3 text-center tracking-widest text-lg border rounded"
            placeholder="123456"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:bg-slate-400"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          disabled={counter > 0 || loading}
          onClick={resendOtp}
          className="w-full mt-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          {counter > 0 ? `Resend OTP in ${counter}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}

export default VerifyEmail;
