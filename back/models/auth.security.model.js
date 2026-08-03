import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  codeHash: { type: String, required: true },
  purpose: {
    type: String,
    enum: ["email_verification", "phone_verification", "password_reset"],
    required: true,
  },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  lastSentAt: { type: Date, default: null },
});

const authSecuritySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true,
    },

    // OTP SYSTEM
    otps: [otpSchema], // Array of OTPs per user

    // LOGIN TRACKING
    loginIP: String,
    userAgent: String,

    geoLocation: {
      country: String,
      region: String,
      city: String,
      lat: Number,
      lon: Number,
    },

    isSuspicious: { type: Boolean, default: false },
    lastFailedLoginAt: Date,
    failedLoginCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("AuthSecurity", authSecuritySchema);