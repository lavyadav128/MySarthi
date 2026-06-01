import express from "express";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ======================================================
   GET SELF USER INFO
====================================================== */
router.get("/me", authMiddleware, async (req, res) => {
  const u = await User.findById(req.user.id).lean();
  if (!u) return res.status(404).json({ error: "User not found" });

  const safeUser = {
    id: u._id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    isEmailVerified:u.isEmailVerified,
    role: u.role,
  };

  res.json(safeUser);
});

/* ======================================================
   CREATE PROFILE
====================================================== */
router.post("/profiles", authMiddleware, async (req, res) => {
  const profile = await Profile.create({
    ...req.body,
    userId: req.user.id,
  });

  res.json(profile);
});

/* ======================================================
   GET MY PROFILE (Auto-create)
====================================================== */
router.get("/profiles/me", authMiddleware, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id }).lean();

    // If no profile exists, create a blank one with default structure
    if (!profile) {
      profile = await Profile.create({
        userId: req.user.id,
        name: "",
        headline: "",
        about: "",
        country: "",
        city: "",
        profilePicture: "",
        bannerImage: "",
        github: "",
        linkedin: "",
        twitter: "",
        youtube: "",
        website: "",
        portfolio: "",
        // profession: "",
        experience: [],
        education: [],
        skills: [],
        interests: [],
        achievements: "",
        // extra: "",
      });

      // Fetch again so lean() applies
      profile = profile.toObject();
    }

    res.json(profile);

  } catch (err) {
    console.error("GET /profiles/me error", err);
    res.status(500).json({ error: "Server error fetching profile" });
  }
});


/* ======================================================
   UPDATE ENTIRE PROFILE (FULL OBJECT)
====================================================== */
router.put("/profiles/me", authMiddleware, async (req, res) => {
  const updated = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    req.body,
    { new: true }
  );

  if (!updated) return res.status(404).json({ error: "Profile not found" });

  res.json(updated);
});


/* ======================================================
   SECTION = EXPERIENCE
====================================================== */

// Add experience
router.post("/profiles/me/experience", authMiddleware, async (req, res) => {
  const updated = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { $push: { experience: req.body } },
    { new: true }
  );
  res.json(updated.experience);
});

// Update experience by ID
router.put("/profiles/me/experience/:expId", authMiddleware, async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user.id });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const exp = profile.experience.id(req.params.expId);
  if (!exp) return res.status(404).json({ error: "Experience not found" });

  Object.assign(exp, req.body);
  await profile.save();

  res.json(exp);
});

// Delete experience
router.delete("/profiles/me/experience/:expId", authMiddleware, async (req, res) => {
  const updated = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { $pull: { experience: { _id: req.params.expId } } },
    { new: true }
  );
  res.json(updated.experience);
});

/* ======================================================
   SECTION = EDUCATION
====================================================== */
router.post("/profiles/me/education", authMiddleware, async (req, res) => {
  const updated = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { $push: { education: req.body } },
    { new: true }
  );
  res.json(updated.education);
});

router.put("/profiles/me/education/:eduId", authMiddleware, async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user.id });
  const edu = profile.education.id(req.params.eduId);
  Object.assign(edu, req.body);
  await profile.save();
  res.json(edu);
});

router.delete("/profiles/me/education/:eduId", authMiddleware, async (req, res) => {
  const updated = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { $pull: { education: { _id: req.params.eduId } } },
    { new: true }
  );
  res.json(updated.education);
});

/* ======================================================
   CERTIFICATIONS - CREATE, UPDATE, DELETE (if needed)
====================================================== */
router.post("/profiles/me/certifications", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { certifications: req.body } },
      { new: true }
    );
    res.json(updated.certifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/profiles/me/certifications/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id, "certifications._id": req.params.id },
      { $set: { "certifications.$": req.body } },
      { new: true }
    );
    res.json(updated.certifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/profiles/me/certifications/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { certifications: { _id: req.params.id } } },
      { new: true }
    );
    res.json(updated.certifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ======================================================
   PROJECTS - CREATE, UPDATE, DELETE (if needed)
====================================================== */
router.post("/profiles/me/projects", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { projects: req.body } },
      { new: true }
    );
    res.json(updated.projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/profiles/me/projects/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id, "projects._id": req.params.id },
      { $set: { "projects.$": req.body } },
      { new: true }
    );
    res.json(updated.projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/profiles/me/projects/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { projects: { _id: req.params.id } } },
      { new: true }
    );
    res.json(updated.projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ======================================================
   SECTION = PUBLICATIONS
====================================================== */
router.post("/profiles/me/publications", authMiddleware, async (req, res) => {
  const updated = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { $push: { publications: req.body } },
    { new: true }
  );
  res.json(updated.publications);
});

/* ======================================================
   VOLUNTEERING - CREATE, UPDATE, DELETE
====================================================== */
router.post("/profiles/me/volunteering", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { volunteering: req.body } },
      { new: true }
    );
    res.json(updated.volunteering);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/profiles/me/volunteering/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id, "volunteering._id": req.params.id },
      { $set: { "volunteering.$": req.body } },
      { new: true }
    );
    res.json(updated.volunteering);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/profiles/me/volunteering/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { volunteering: { _id: req.params.id } } },
      { new: true }
    );
    res.json(updated.volunteering);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ======================================================
   LANGUAGES - CREATE, UPDATE, DELETE (if needed)
====================================================== */
router.post("/profiles/me/languages", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { languages: req.body } },
      { new: true }
    );
    res.json(updated.languages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/profiles/me/languages/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id, "languages._id": req.params.id },
      { $set: { "languages.$": req.body } },
      { new: true }
    );
    res.json(updated.languages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/profiles/me/languages/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { languages: { _id: req.params.id } } },
      { new: true }
    );
    res.json(updated.languages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ======================================================
   SECTION = LINKS + BASIC ABOUT INFO
====================================================== */

import multer from "multer";
import path from "path";

// ============================
// MULTER STORAGE
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile"); // <--- store your images here
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${file.fieldname}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// ============================
// UPDATE BASIC PROFILE INFO
// ============================
router.put(
  "/profiles/me/basic",
  authMiddleware,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const allowedFields = [
        "name", "headline", "about",
        "country", "city",
        "github", "linkedin", "twitter",
        "youtube", "website", "portfolio"
      ];

      const updateData = {};

      // TEXT FIELDS
      allowedFields.forEach((key) => {
        if (req.body[key] !== undefined && req.body[key] !== "null") {
          updateData[key] = req.body[key];
        }
      });

      if (req.files?.profilePicture?.[0]) {
        updateData.profilePicture = `http://localhost:4000/uploads/profile/${req.files.profilePicture[0].filename}`;
      }

      if (req.files?.bannerImage?.[0]) {
        updateData.bannerImage = `http://localhost:4000/uploads/profile/${req.files.bannerImage[0].filename}`;
      }


      // UPDATE DB
      const updated = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json(updated);

    } catch (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);



/* ======================================================
   SECTION = SKILLS / INTERESTS (simple arrays)
====================================================== */
router.put("/profiles/me/skills", authMiddleware, async (req, res) => {
  const updated = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { skills: req.body.skills || [] },
    { new: true }
  );
  res.json(updated.skills);
});

router.put("/profiles/me/interests", authMiddleware, async (req, res) => {
  const updated = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { interests: req.body.interests || [] },
    { new: true }
  );
  res.json(updated.interests);
});

/* ======================================================
   SECTION = OPEN TO WORK
====================================================== */
// router.put("/profiles/me/open-to-work", authMiddleware, async (req, res) => {
//   const updated = await Profile.findOneAndUpdate(
//     { userId: req.user.id },
//     { openToWork: req.body },
//     { new: true }
//   );
//   res.json(updated.openToWork);
// });

/* ======================================================
   SECTION = RECOMMENDATIONS RECEIVED
====================================================== */
router.post("/profiles/me/recommendations", authMiddleware, async (req, res) => {
  const updated = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { $push: { recommendations: req.body } },
    { new: true }
  );
  res.json(updated.recommendations);
});

/* ======================================================
   HONORS - CREATE, UPDATE, DELETE
====================================================== */
router.post("/profiles/me/honors", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { honors: req.body } },
      { new: true }
    );
    res.json(updated.honors);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/profiles/me/honors/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id, "honors._id": req.params.id },
      { $set: { "honors.$": req.body } },
      { new: true }
    );
    res.json(updated.honors);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/profiles/me/honors/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { honors: { _id: req.params.id } } },
      { new: true }
    );
    res.json(updated.honors);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ======================================================
   COURSES - CREATE, UPDATE, DELETE
====================================================== */
router.post("/profiles/me/courses", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { courses: req.body } },
      { new: true }
    );
    res.json(updated.courses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/profiles/me/courses/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id, "courses._id": req.params.id },
      { $set: { "courses.$": req.body } },
      { new: true }
    );
    res.json(updated.courses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/profiles/me/courses/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { courses: { _id: req.params.id } } },
      { new: true }
    );
    res.json(updated.courses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ======================================================
   PATENTS - CREATE, UPDATE, DELETE
====================================================== */
router.post("/profiles/me/patents", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { patents: req.body } },
      { new: true }
    );
    res.json(updated.patents);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/profiles/me/patents/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id, "patents._id": req.params.id },
      { $set: { "patents.$": req.body } },
      { new: true }
    );
    res.json(updated.patents);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/profiles/me/patents/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { patents: { _id: req.params.id } } },
      { new: true }
    );
    res.json(updated.patents);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
