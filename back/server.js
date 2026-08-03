import express from "express";
import cors from "cors";
import path from "path";

// OR for ESM (import)
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import connectDB from "./config/db.js";
connectDB();

import { fileURLToPath } from "url";

// Recreate __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import questionRoutes from "./routes/question.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import scoreRoutes from "./routes/score.route.js";
import adminRoutes from "./routes/admin.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import UpdateProfileData from "./routes/update.profile.data.js";

const app = express();

// ---------------- CORS CONFIG ----------------
// Replace these with your actual deployed frontend URL(s)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://mysarthii.onrender.com", // <-- replace with your real frontend URL
    ];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: origin ${origin} is not allowed`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// cors(corsOptions) already handles preflight (OPTIONS) requests for every route,
// so a separate app.options("*", ...) line is not needed and breaks on newer
// path-to-regexp/Express versions that require named wildcards (e.g. "/*splat").
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- PORT (Render assigns this dynamically) ----------------
const PORT = process.env.PORT || 5000;

app.use(authRoutes);
app.use(profileRoutes);
app.use(questionRoutes);
app.use(contactRoutes);
app.use(scoreRoutes);
app.use('/admin', adminRoutes);
app.use('/messages', messageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(UpdateProfileData);

app.post("/test", (req, res) => {
  console.log("TEST HIT");
  console.log(req.body);

  res.json({
    success: true,
  });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});