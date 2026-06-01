import React, { useState } from "react";
import { API_BASE } from "./environment.jsx";

import { useLanguage } from "./context/LanguageContext";

function ContactForm() {

  const {t} = useLanguage();

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("success"); // success | error | info
  const [errors, setErrors] = useState({});


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
  const newErrors = {};

  // Name: required, min 2, max 50, letters + space only
  if (!form.name.trim()) {
    newErrors.name = "Name is required";
  } else if (form.name.trim().length < 2) {
    newErrors.name = "Name must be at least 2 characters";
  } else if (form.name.trim().length > 50) {
    newErrors.name = "Name cannot exceed 50 characters";
  } else if (!/^[a-zA-Z\s]+$/.test(form.name)) {
    newErrors.name = "Name can contain only letters and spaces";
  }

  // Email: strict RFC-like check
  if (!form.email.trim()) {
    newErrors.email = "Email is required";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)
  ) {
    newErrors.email = "Invalid email address";
  }

  // Message: required, min 10, max 500
  if (!form.message.trim()) {
    newErrors.message = "Message is required";
  } else if (form.message.trim().length < 10) {
    newErrors.message = "Message must be at least 10 characters";
  } else if (form.message.trim().length > 500) {
    newErrors.message = "Message cannot exceed 500 characters";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    setStatusType("error");
    setStatusMsg("Please fix the errors before submitting.");
    setStatusOpen(true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      }),
    });

    const data = await res.json();

    if (data.success) {
      setStatusType("success");
      setStatusMsg("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
      setErrors({});
    } else {
      setStatusType("error");
      setStatusMsg(data.message || "Error sending message.");
    }
  } catch {
    setStatusType("error");
    setStatusMsg("Server error.");
  }

  setStatusOpen(true);
  setTimeout(() => setStatusOpen(false), 3000);
};


  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t.k11}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.name}
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder={t.k17}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.k12}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder={t.k13}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.k14}
            </label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              required
              placeholder={t.k15}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.message && (
              <p className="text-red-600 text-sm mt-1">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-base font-medium hover:bg-blue-700 transition"
          >
            {t.k16}
          </button>
        </form>
      </div>

      {/* Snackbar */}
      {statusOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-3 rounded-lg text-white shadow-lg ${
              statusType === "success"
                ? "bg-green-600"
                : statusType === "error"
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            {statusMsg}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactForm;
