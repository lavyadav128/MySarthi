import express from "express";
import cors from "cors";
import path from "path";

import connectDB from "./config/db.js";
connectDB();

import { fileURLToPath } from "url";

// Recreate __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js"
import questionRoutes from "./routes/question.routes.js"
import contactRoutes from "./routes/contact.routes.js"
import scoreRoutes from "./routes/score.route.js"
import adminRoutes from "./routes/admin.routes.js"
import messageRoutes from "./routes/messages.routes.js";
import UpdateProfileData from "./routes/update.profile.data.js"

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = 5000;

app.use(authRoutes)
app.use(profileRoutes)
app.use(questionRoutes)
app.use(contactRoutes)
app.use(scoreRoutes)
app.use('/admin', adminRoutes);
app.use('/messages', messageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(UpdateProfileData); 

app.post("/test", (req, res) => {
  console.log("TEST HIT");
  console.log(req.body);

  res.json({
    success: true
  });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server running`);
});
