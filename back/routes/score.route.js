import express from "express";
import User from "../models/user.model.js";
import Question from "../models/question.model.js";
import Result from "../models/score.model.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const router = express.Router();

// ==========================
// Submit Assessment (CREATE or UPDATE)
// ==========================
router.post("/assessment/submit", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const questions = await Question.find();

    let clarityTotal = 0,
      clarityCount = 0,
      interestTotal = 0,
      interestCount = 0;

    let clarityMin = 0,
      clarityMax = 0,
      interestMin = 0,
      interestMax = 0;

    const enrichedAnswers = [];

    for (const a of answers) {
      const q = questions.find((q) => q._id.toString() === a.questionId.toString());
      if (!q) continue;

      const opt = q.options.find((o) => o.id === a.optionId);
      if (!opt) continue;

      enrichedAnswers.push({
        questionId: q._id,
        optionId: opt.id,
        weight: opt.weight,
      });

      if (q.category === "clarity") {
        clarityTotal += opt.weight;
        clarityCount++;
        // Calculate min/max possible scores
        clarityMin += Math.min(...q.options.map(opt => opt.weight));
        clarityMax += Math.max(...q.options.map(opt => opt.weight));
      } else if (q.category === "interest") {
        interestTotal += opt.weight;
        interestCount++;
        // Calculate min/max possible scores
        interestMin += Math.min(...q.options.map(opt => opt.weight));
        interestMax += Math.max(...q.options.map(opt => opt.weight));
      }
    }

    // ==========================
    // Calculate Scores (0-100%)
    // ==========================
    // Formula: (actual - min) / (max - min) * 100
    // This properly scales any weight range to 0-100%

    const clarityScore = clarityCount && clarityMax > clarityMin
      ? Math.round(((clarityTotal - clarityMin) / (clarityMax - clarityMin)) * 100)
      : 0;

    const interestScore = interestCount && interestMax > interestMin
      ? Math.round(((interestTotal - interestMin) / (interestMax - interestMin)) * 100)
      : 0;

    const overall = Math.round((clarityScore + interestScore) / 2);

    // ==========================
    // UPDATE OR INSERT RESULT
    // ==========================
    const updatedResult = await Result.findOneAndUpdate(
      { userId },
      {
        clarityScore,
        interestScore,
        overall,
        answers: enrichedAnswers,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        timestamps: true,
      }
    );

    res.json({
      message: "Assessment submitted successfully",
      result: updatedResult,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit assessment" });
  }
});

// ==========================
// Fetch Logged-in User Results
// ==========================
router.get("/assessments/results/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const latest = await Result.findOne({ userId }).sort({ updatedAt: -1 });

    if (!latest)
      return res.json({ message: "No results found", result: null, canRetest: true });

    // Check if user can retake (e.g., after 7 days)
    const lastTakeDate = latest.updatedAt || latest.createdAt;
    const daysSince = (Date.now() - lastTakeDate) / (1000 * 60 * 60 * 24);
    const canRetest = daysSince >= 7; // Allow retake after 7 days

    res.json({ result: latest, canRetest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

export default router;