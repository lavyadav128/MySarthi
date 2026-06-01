import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import { CheckCircle, AlertCircle, Target, Zap, ChevronRight, Lock } from "lucide-react";
import { API_BASE } from "../environment.jsx";
import ScoreCard from "./ScoreCard.jsx";
import t from "./lang/assign.js"

export default function AssessmentSection() {
  const auth = useAuthContext();

  const [allQuestionsRaw, setAllQuestionsRaw] = useState([]); // Store raw multilingual data
  const [allQuestions, setAllQuestions] = useState([]); // Filtered by language
  const [answers, setAnswers] = useState({ clarity: {}, interest: {} });
  const [result, setResult] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completedPhases, setCompletedPhases] = useState({ clarity: false, interest: false });
  const [notification, setNotification] = useState(null);
  const DEFAULT_LANG = "en";

  const [lang, setLang] = React.useState(() => {
    return localStorage.getItem("lang") || DEFAULT_LANG;
  });

   React.useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);


  // Fetch questions from database
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!auth.token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Fetch with explicit language parameter
        const response = await fetch(`${API_BASE}/questions?lang=en`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        // console.log("Raw API Response:", data);

        const questionsArray = Array.isArray(data) ? data : data.data || [];

        if (questionsArray.length === 0) {
          setError("No questions available");
          setAllQuestionsRaw([]);
          setAllQuestions([]);
        } else {
          // Store raw data
          setAllQuestionsRaw(questionsArray);
          setAllQuestions(questionsArray);
          // console.log("Questions loaded successfully:", questionsArray.length);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError(`Failed to load questions: ${err.message}`);
        setAllQuestionsRaw([]);
        setAllQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [auth.token]);

  // Update displayed questions when language changes
  useEffect(() => {
    const fetchQuestionsByLanguage = async () => {
      if (!auth.token || allQuestionsRaw.length === 0) return;

      try {
        const response = await fetch(`${API_BASE}/questions?lang=${lang}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAllQuestions(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch questions in language:", err);
      }
    };

    if (lang !== "en" && allQuestionsRaw.length > 0) {
      fetchQuestionsByLanguage();
    }
  }, [lang, auth.token, allQuestionsRaw.length]);

  const getQuestionsByCategory = (category) => {
    return allQuestions.filter(
      (q) => q.category === category && (q.isVisibleToUser !== false)
    );
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openAssessment = (phase) => {
    if (phase === "interest" && !completedPhases.clarity) {
      setError(t[lang].completeFirst);
      return;
    }

    const questions = getQuestionsByCategory(phase);
    if (questions.length === 0) {
      setError(`No ${phase} questions found`);
      return;
    }

    const init = {};
    questions.forEach((q) => {
      init[q._id] = "";
    });

    setAnswers({
      ...answers,
      [phase]: init,
    });
    setCurrentPhase(phase);
    setShowAssessment(true);
    setError("");
  };

  const submitAssessment = async () => {
    const phase = currentPhase;
    const questions = getQuestionsByCategory(phase);

    const unanswered = questions.filter((q) => !answers[phase][q._id]);
    if (unanswered.length > 0) {
      setError(`${t[lang].answerAll} (${unanswered.length} remaining)`);
      return;
    }

    const answersArray = Object.entries(answers[phase])
      .filter(([_, optionId]) => optionId)
      .map(([questionId, optionId]) => ({
        questionId,
        optionId,
      }));

    const payload = {
  answers: [
    ...Object.entries(answers.clarity).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    })),
    ...Object.entries(answers.interest).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    })),
  ],
};



    try {
      setSubmitting(true);
      setError("");

      const res = await fetch(`${API_BASE}/assessment/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      setCompletedPhases({
        ...completedPhases,
        [phase]: true,
      });
      setShowAssessment(false);
      setCurrentPhase(null);

      if (phase === "clarity") {
        showNotification(`${t[lang].clarity} ${t[lang].completed}!`);
      } else {
        setResult(data.result || data);
        showNotification(t[lang].assessmentComplete);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestions = currentPhase ? getQuestionsByCategory(currentPhase) : [];
  const answeredCount = currentPhase ? Object.values(answers[currentPhase]).filter(Boolean).length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-700 font-medium">{t[lang].loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{t[lang].heading}</h1>
              <p className="text-slate-600 mt-2">{t[lang].subheading}</p>
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>

          </div>

          {notification && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border mb-4 ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {notification.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="font-medium text-sm">{notification.message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Assessment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Phase 1: Clarity */}
          <div className={`rounded-2xl overflow-hidden transition-all ${
            completedPhases.clarity
              ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300"
              : "bg-white border-2 border-slate-200"
          }`}>
            <div className={`p-2 text-white ${
              completedPhases.clarity
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : "bg-gradient-to-r from-blue-600 to-blue-700"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {completedPhases.clarity ? (
                    <CheckCircle size={24} />
                  ) : (
                    <Target size={24} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold opacity-90">{t[lang].phase1}</p>
                  <h3 className="text-2xl font-bold">{t[lang].clarity}</h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">{t[lang].status}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    completedPhases.clarity
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {completedPhases.clarity ? t[lang].completed : t[lang].inProgress}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{getQuestionsByCategory("clarity").length} {t[lang].questions}</p>
              </div>

              <button
                onClick={() => openAssessment("clarity")}
                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  completedPhases.clarity
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {completedPhases.clarity ? t[lang].retake : t[lang].startAssessment}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Phase 2: Interest */}
          <div className={`rounded-2xl overflow-hidden transition-all ${
            completedPhases.interest
              ? "bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300"
              : completedPhases.clarity
              ? "bg-white border-2 border-slate-200"
              : "bg-slate-50 border-2 border-dashed border-slate-300"
          }`}>
            <div className={`p-2 text-white ${
              completedPhases.interest
                ? "bg-gradient-to-r from-purple-500 to-purple-600"
                : completedPhases.clarity
                ? "bg-gradient-to-r from-purple-600 to-purple-700"
                : "bg-gradient-to-r from-slate-400 to-slate-500"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {!completedPhases.clarity ? (
                    <Lock size={24} />
                  ) : completedPhases.interest ? (
                    <CheckCircle size={24} />
                  ) : (
                    <Zap size={24} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold opacity-90">{t[lang].phase2}</p>
                  <h3 className="text-2xl font-bold">{t[lang].interest}</h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">{t[lang].status}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    !completedPhases.clarity
                      ? "bg-slate-200 text-slate-600"
                      : completedPhases.interest
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {!completedPhases.clarity ? t[lang].locked : completedPhases.interest ? t[lang].completed : t[lang].inProgress}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{getQuestionsByCategory("interest").length} {t[lang].questions}</p>
              </div>

              <button
                onClick={() => openAssessment("interest")}
                disabled={!completedPhases.clarity}
                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  !completedPhases.clarity
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : completedPhases.interest
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {!completedPhases.clarity ? t[lang].locked : completedPhases.interest ? t[lang].retake : t[lang].startAssessment}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Assessment Modal */}
        {showAssessment && currentQuestions.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
              {/* Header */}
              <div className={`${
                currentPhase === "clarity" ? "bg-blue-600" : "bg-purple-600"
              } text-white p-6`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {currentPhase === "clarity" ? t[lang].clarity : t[lang].interest}
                  </h2>
                  <div className="text-sm font-semibold opacity-90">
                    {answeredCount}/{currentQuestions.length}
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-full rounded-full transition-all"
                    style={{ width: `${(answeredCount / currentQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {currentQuestions.map((question, idx) => (
                  <div key={question._id} className="border-l-4 border-slate-300 pl-6 pb-6">
                    <p className="text-sm font-bold text-slate-500 mb-2">QUESTION {idx + 1}</p>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      {question.question}
                    </h3>

                    <div className="space-y-3">
                      {question.options && question.options.length > 0 ? (
                        question.options.map((option) => (
                          <label
                            key={option.id}
                            className={`flex items-center p-4 rounded-lg cursor-pointer transition border-2 ${
                              answers[currentPhase][question._id] === option.id
                                ? currentPhase === "clarity"
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-purple-500 bg-purple-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name={question._id}
                              value={option.id}
                              checked={answers[currentPhase][question._id] === option.id}
                              onChange={() =>
                                setAnswers({
                                  ...answers,
                                  [currentPhase]: {
                                    ...answers[currentPhase],
                                    [question._id]: option.id,
                                  },
                                })
                              }
                              className="w-5 h-5 cursor-pointer"
                            />
                            <span className="ml-4 font-semibold text-slate-800">
                              {option.text}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="text-slate-500">No options available</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t p-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowAssessment(false)}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold transition"
                >
                  {t[lang].cancel}
                </button>
                <button
                  onClick={submitAssessment}
                  disabled={submitting || answeredCount !== currentQuestions.length}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
                    currentPhase === "clarity"
                      ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400"
                      : "bg-purple-600 text-white hover:bg-purple-700 disabled:bg-slate-400"
                  } disabled:cursor-not-allowed`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t[lang].submitting}
                    </>
                  ) : (
                    <>
                      {t[lang].submit}
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {/* {result && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle size={32} />
                <h2 className="text-3xl font-bold">{t[lang].assessmentComplete}</h2>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
                  <p className="text-slate-600 text-sm font-semibold mb-2">Clarity Score</p>
                  <p className="text-4xl font-bold text-blue-600">{result.clarityScore || result.score || 0}%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-300">
                  <p className="text-slate-600 text-sm font-semibold mb-2">Interest Score</p>
                  <p className="text-4xl font-bold text-purple-600">{result.interestScore || result.score || 0}%</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-300">
                  <p className="text-slate-600 text-sm font-semibold mb-2">Overall</p>
                  <p className="text-4xl font-bold text-emerald-600">{result.overall || result.score || 0}%</p>
                </div>
              </div>
              <button
                onClick={() => setResult(null)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Close Results
              </button>
            </div>
          </div>
        )} */}

          <ScoreCard
            lang={lang}
            t={t}
          />

      </div>
    </div>
  );
}