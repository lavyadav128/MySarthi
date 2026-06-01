import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  optionId: { type: String, required: true }, // UUID string
  weight: { type: Number, required: true },
});

const assessmentResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clarityScore: { type: Number, required: true },
    interestScore: { type: Number, required: true },
    overall: { type: Number, required: true },
    answers: [answerSchema],
  },
  { timestamps: true }
);

const Result = mongoose.model("AssessmentResult", assessmentResultSchema);
export default Result;
