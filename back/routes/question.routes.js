// routes/question.routes.js
import express from "express";
import Question from "../models/question.model.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

// Validate option IDs are unique
const validateOptions = (options) => {
  const ids = options.map(opt => opt.id);
  const uniqueIds = new Set(ids);
  return ids.length === uniqueIds.size;
};

// GET all questions (admin only - sees all)
// GET all questions (admin)
// /admin/questions?lang=en | hi
router.get("/admin/questions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const lang = req.query.lang;

    const questions = await Question.find().sort({ createdAt: -1 });

    // If lang not provided, return full multilingual object (admin use-case)
    if (!lang) return res.json(questions);

    res.json(transformByLanguage(questions, lang));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



// GET visible questions (public) with language support
// /questions?lang=en | hi
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    const lang = req.query.lang || "en";

    const questions = await Question.find({ isVisibleToUser: true });

    res.json(transformByLanguage(questions, lang));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// CREATE question
router.post("/admin/questions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { question, category, options, isVisibleToUser } = req.body;
    
    // Validate unique option IDs
    if (!validateOptions(options)) {
      return res.status(400).json({ error: "Option IDs must be unique" });
    }
    
    const newQuestion = await Question.create({
      question,
      category,
      options,
      isVisibleToUser: isVisibleToUser !== false // Default to true
    });
    
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE question
router.put("/admin/questions/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { question, category, options, isVisibleToUser } = req.body;
    
    // Validate unique option IDs
    if (!validateOptions(options)) {
      return res.status(400).json({ error: "Option IDs must be unique" });
    }
    
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        question,
        category,
        options,
        isVisibleToUser
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }
    
    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE question
router.delete("/admin/questions/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    
    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }
    
    res.json({ success: true, message: "Question deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const DEFAULT_LANG = "en";
const SUPPORTED_LANGS = ["en", "hi"];

const transformByLanguage = (questions, lang) => {
  const selectedLang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;

  return questions.map(q => ({
    _id: q._id,
    question: q.question[selectedLang] || q.question[DEFAULT_LANG],
    category: q.category,
    isVisibleToUser: q.isVisibleToUser,
    options: q.options.map(opt => ({
      id: opt.id,
      text: opt.text[selectedLang] || opt.text[DEFAULT_LANG],
      weight: opt.weight
    })),
    createdAt: q.createdAt,
    updatedAt: q.updatedAt
  }));
};


export default router;