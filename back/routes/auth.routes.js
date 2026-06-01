import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.model.js";
import AuthSecurity from "../models/auth.security.model.js";
import { isValidEmail, generateToken, validatePassword } from "../utils/auth.helper.js";
import { sendEmailOTP } from "../utils/mailer.js";
import AdminAllow from "../models/adminAllow.model.js";
import AdminInvite from "../models/adminInvite.model.js";

const router = express.Router();

/* ------------------ HELPERS ------------------ */

const getClientIP = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = async (otp) => await bcrypt.hash(otp, 12); // bcrypt hash


/* ------------------ SIGNUP ------------------ */

router.post("/signup", async (req, res) => {
  try {
    let { name, email, password, phone, adminInvite } = req.body; // ⭐ read adminInvite

    /* ---------- VALIDATION ---------- */
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email & password required" });
    }

    email = email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const error = validatePassword(password);
    if (error) {
      return res.status(400).json({ error });
    }

    if (phone) {
      phone = phone.replace(/\s+/g, "");
      if (!/^\+?[0-9]{10,15}$/.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number" });
      }
    }

    const exists = await User.findOne({ email });

if (exists) {
  if (exists.isEmailVerified) {
    // Already verified → cannot reuse email
    return res.status(400).json({ error: "Email already registered" });
  } else {
    // User exists but not verified → resend OTP
    const authSec = await AuthSecurity.findOne({ userId: exists._id });

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    if (authSec) {
      const otpObj = authSec.otps.find(o => o.purpose === "email_verification" && !o.verified);
      if (otpObj) {
        otpObj.codeHash = otpHash;
        otpObj.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        otpObj.attempts = 0;
        
      } else {
        authSec.otps.push({
          codeHash: otpHash,
          purpose: "email_verification",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          attempts: 0,
          verified: false,
        });
      }
      await authSec.save();
    }
    // const email = to.trim().toLowerCase();
    function cleanEmail(email) {
      return email
        .replace(/\s+/g, "")     // remove ALL spaces
        .replace(/[^\x00-\x7F]/g, "") // remove non-ASCII chars
        .trim()
        .toLowerCase();
    }
    const email = cleanEmail(email);

    await sendEmailOTP({ to: email, otp });

    return res.status(200).json({
      message: "OTP resent. Please check your email to verify.",
      userId: exists._id,
    });
  }
}


    /* ---------- ADMIN INVITE VALIDATION ---------- */
    let role = "user";
    let inviteDoc = null;

    if (adminInvite) {
      inviteDoc = await AdminInvite.findOne({
        token: adminInvite,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!inviteDoc) {
        return res.status(400).json({ error: "Invalid or expired admin invite" });
      }

      if (inviteDoc.email && inviteDoc.email !== email) {
        return res.status(403).json({ error: "Invite not valid for this email" });
      }

      role = "admin";
    }


    /* ---------- CREATE USER ---------- */
    const passwordHash = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      if (!existingUser.isVerified) {
        // resend OTP
        return res.status(409).json({
          error: "Phone already registered. Please verify OTP."
        });
      }

      return res.status(409).json({
        error: "Phone already registered"
      });
    }

    const user = await User.create({
      name: name.trim(),
      email,
      phone,
      passwordHash,
      isEmailVerified: false,
      role, // ⭐ dynamic role
    });

    /* ---------- MARK INVITE AS USED ---------- */
    if (inviteDoc) {
      inviteDoc.used = true;
      inviteDoc.usedBy = user._id;
      await inviteDoc.save();
    }

    /* ---------- CREATE EMAIL OTP ---------- */
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await AuthSecurity.create({
      userId: user._id,
      otps: [
        {
          codeHash: otpHash,
          purpose: "email_verification",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          attempts: 0,
          verified: false,
        },
      ],
      signupIP: getClientIP(req),
      userAgent: req.headers["user-agent"],
    });

    /* ---------- SEND EMAIL OTP ---------- */
    await sendEmailOTP({
      to: user.email,
      otp,
    });

    // if (process.env.NODE_ENV !== "production") {
    //   console.log("EMAIL OTP (DEV):", otp);
    // }

    res.status(201).json({
      message: "Signup successful. Verify your email using OTP.",
      userId: user._id,
      role: user.role, // optional (for frontend messaging)
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


/* ------------------ VERIFY EMAIL OTP ------------------ */
router.post("/verify-email", async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email & OTP required" });

    email = email.trim().toLowerCase();
    otp = otp.trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const authSec = await AuthSecurity.findOne({ userId: user._id });
    if (!authSec) return res.status(400).json({ error: "No OTP found" });

    // Pick the correct OTP for email verification
    const otpObj = authSec.otps.find(o => o.purpose === "email_verification" && !o.verified);
    if (!otpObj) return res.status(400).json({ error: "No valid OTP found" });

    // Check expiry
    if (new Date() > otpObj.expiresAt) return res.status(400).json({ error: "OTP expired" });

    // Compare hashed OTP
    const isValid = await bcrypt.compare(otp, otpObj.codeHash);
    if (!isValid) {
      otpObj.attempts += 1;
      await authSec.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // ✅ Mark OTP verified
    otpObj.verified = true;
    await authSec.save();

    user.isEmailVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully", user: { id: user._id, role: user.role } });
  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const authSec = await AuthSecurity.findOne({ userId: user._id });
    if (!authSec) return res.status(400).json({ error: "No OTP found for user" });

    // Find existing unverified email_verification OTP
    const otpObj = authSec.otps.find(
      (o) => o.purpose === "email_verification" && !o.verified
    );

    if (!otpObj) return res.status(400).json({ error: "No valid OTP to resend" });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpHash = await bcrypt.hash(otp, 12);

    otpObj.codeHash = otpHash;
    
    const lastSentAt = otpObj.lastSentAt || new Date(0);

    if (Date.now() - lastSentAt.getTime() < 60 * 1000) {
      return res.status(429).json({ error: "Please wait 1 minute before resending OTP" });
    }

    otpObj.attempts = 0;

    await authSec.save();

    // Send email
    await sendEmailOTP({ to: user.email, otp });

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Server error resending OTP" });
  }
});



/* ------------------ LOGIN ------------------ */

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.isEmailVerified)
      return res.status(403).json({ error: "Email not verified" });

    if (
      user.accountLockedUntil &&
      user.accountLockedUntil > Date.now()
    ) {
      return res.status(403).json({
        error: "Account temporarily locked. Try later.",
      });
    }

    if (user.role === "admin") {
      const allowed = await AdminAllow.findOne({
        email: user.email,
        isActive: true,
      });

      // Allow first bootstrap admin if no entry exists
      // Also check if there are ANY admin allow entries in the system
      const hasAnyAdminAllow = await AdminAllow.exists({});
      if (hasAnyAdminAllow && !allowed) {
        return res.status(403).json({ error: "Admin access revoked" });
      }
    }


    const match = await bcrypt.compare(password, user.passwordHash);
    const ip = getClientIP(req);

    let security =
      (await AuthSecurity.findOne({ userId: user._id })) ||
      new AuthSecurity({ userId: user._id });

    if (!match) {
      security.failedLoginCount += 1;
      security.lastFailedLoginAt = new Date();

      if (security.failedLoginCount >= 5) {
        user.accountLockedUntil = Date.now() + 15 * 60 * 1000;
        await user.save();
      }

      await security.save();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // RESET FAILED ATTEMPTS
    security.failedLoginCount = 0;
    security.loginIP = ip;
    security.userAgent = req.headers["user-agent"];
    await security.save();

    user.lastLoginAt = new Date();
    user.lastLoginIP = ip;
    await user.save();

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const token = generateToken(safeUser);

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ------------------ BOOTSTRAP ADMIN ------------------ */

router.post("/bootstrap-admin", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    const adminExists = await User.exists({ role: "admin" });
    if (adminExists) {
      return res.status(403).json({ error: "Bootstrap disabled" });
    }


    if (!email || !password)
      return res.status(400).json({ error: "Email & password required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "Admin already exists" });

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: "admin",
      isEmailVerified: true,
    });

    res.json({
      success: true,
      admin: { id: admin._id, email: admin.email },
    });
  } catch (err) {
    console.error("BOOTSTRAP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
