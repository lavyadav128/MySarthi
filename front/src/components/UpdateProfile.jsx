import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../environment.jsx";

const Avatar = ({ name }) => (
  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
    {name?.charAt(0).toUpperCase() || "U"}
  </div>
);

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Profile edit states
  const [editName, setEditName] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [editPhone, setEditPhone] = useState("");

  const token = localStorage.getItem("token");

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.data || res.data;
        setUser({
          id: data._id,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          isEmailVerified: data.isEmailVerified === true,
          phoneVerified: data.phoneVerified === true,
        });

        setEditName(data.name || "");
        setEditPhone(data.phone || "");
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  // Update basic profile
  const updateProfile = async () => {
    if (!editName && !editPhone) {
      setError("Enter at least one field");
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/update-profile`,
        { name: editName, phone: editPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ keep user object intact
      setUser((prev) => ({
        ...prev,
        name: editName || prev.name,
        phone: editPhone || prev.phone,
      }));

      setError("");
      alert("Profile updated");
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    }
  };

  // Change password
  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All password fields required");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await axios.post(
        `${API_BASE}/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError("");
      alert("Password changed successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Password change failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (!user) return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg text-center">
      <div className="text-gray-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">User not logged in</h2>
      <p className="text-gray-500">Please log in to view your profile</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

        <div className="p-6 md:p-8 space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center mb-2">
              <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
            </div>

            <div className="grid md:grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

            </div>

            <button
              onClick={updateProfile}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Personal Information
            </button>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center mb-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-gray-800">Contact Information</h2>
            </div>

            <div className="space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {user.isEmailVerified ? (
                      <span className="text-emerald-600 flex items-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                {!user.isEmailVerified && (
                  <p className="text-sm text-amber-600">Email not verified</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  onClick={updateProfile}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition flex items-center justify-center"
                >
                  Update Phone Number
                </button>
                
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Security Section */}
          <div className="space-y-6">
            <div className="flex items-center mb-2">
              <div className="w-1 h-6 bg-red-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-gray-800">Security</h2>
            </div>

            <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-700">Change Password</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                onClick={changePassword}
                disabled={passwordLoading}
                className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {passwordLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}