// ============================================
// Security & OTP Utilities
// ============================================
import bcrypt from "bcryptjs";

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

export const verifyOTP = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone); // India-safe


// ============================================
// BACKEND: Routes - Security & Profile
// ============================================

import express from "express";
import AuthSecurity from "../models/auth.security.model.js";
import User from "../models/user.model.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Change password (requires current password)
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ USER HAS NO PASSWORD → SET IT
    if (!user.password) {
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();
      return res.json({ message: "Password set successfully" });
    }

    // 🔁 USER HAS PASSWORD → CHANGE FLOW
    if (!currentPassword) {
      return res.status(400).json({ error: "Current password required" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// Update profile (name, username - no OTP required)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username, phone } = req.body; // include phone

    const update = {};
    if (name) update.name = name;
    if (username) update.username = username;
    if (phone) update.phone = phone; // add this

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;