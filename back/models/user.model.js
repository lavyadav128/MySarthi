import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // allows null but enforces uniqueness if exists
      match: /^[0-9]{10,15}$/, // international compatible
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // VERIFICATION FLAGS
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    accountLockedUntil: {
      type: Date,
      default: null,
    },

    lastLoginAt: Date,
    lastLoginIP: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
