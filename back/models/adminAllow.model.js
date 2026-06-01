import mongoose from "mongoose";

const adminAllowSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // first admin (bootstrap)
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminAllow", adminAllowSchema);
