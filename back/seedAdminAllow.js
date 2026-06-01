import mongoose from "mongoose";
import AdminAllow from "./models/adminAllow.model.js";

async function seedAdminAllow() {
  try {
    await mongoose.connect("url");

    await AdminAllow.create({
      email: "abc@gmail.com",
      addedBy: null, // first admin
      isActive: true,
    });

    // console.log("AdminAllow entry created successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error creating AdminAllow entry:", err);
    process.exit(1);
  }
}

seedAdminAllow();
