// models/question.model.js
import mongoose from "mongoose";

/**
 * Reusable language schema
 */
const langTextSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  },
  { _id: false }
);

/**
 * Option Schema
 */
const optionSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true,
    match: /^[a-zA-Z0-9]+$/ // alphanumeric IDs
  },
  text: {
    type: langTextSchema,
    required: true
  },
  weight: {
    type: Number,
    default: 0
  }
});

/**
 * Question Schema
 */
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: langTextSchema,
      required: true
    },
    category: {
      type: String,
      enum: ["clarity", "interest"],
      required: true
    },
    options: {
      type: [optionSchema],
      validate: v => v.length > 0
    },
    isVisibleToUser: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
