import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import { TrendingUp, Award, Zap, RotateCcw, Calendar, CheckCircle } from "lucide-react";
import { API_BASE } from "../environment.jsx";
// import t from "./lang/assign.js"

const ScoreCard = ({lang, t}) => {
  const { token } = useAuthContext();
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canRetest, setCanRetest] = useState(false);
  const [testDate, setTestDate] = useState(null);
  // const [lang, setLang] = React.useState(() => {
  //     return localStorage.getItem("lang") || DEFAULT_LANG;
  //   });

  useEffect(() => {
    if (!token) return;

    const fetchResults = async () => {
      try {
        const response = await fetch(`${API_BASE}/assessments/results/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        const result = data?.result;

        if (result) {
          setScores({
            clarityScore: Number(result.clarityScore),
            interestScore: Number(result.interestScore),
            overall: Number(result.overall),
          });

          if (result.timestamp) {
            setTestDate(new Date(result.timestamp));
          }
        } else {
          setScores(null);
        }

        setCanRetest(data?.canRetest ?? false);
      } catch (err) {
        console.error("Score fetch error:", err);
        setScores(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
        <div className="mb-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto">
            <Award size={32} className="text-slate-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Results Yet</h3>
        <p className="text-slate-600 mb-6">Complete both assessment phases to view your personalized scores and recommendations</p>
        <button
          onClick={() => (window.location.href = "/assessment")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <TrendingUp size={20} />
          Start Assessment
        </button>
      </div>
    );
  }

  /* Score Circle Component */
  const ScoreCircle = ({ label, value, icon: Icon, gradientFrom, gradientTo }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const getScoreLevel = (val) => {
      if (val >= 80) return { level: "Excellent", color: "text-amber-600" };
      if (val >= 60) return { level: "Good", color: "text-amber-600" };
      if (val >= 40) return { level: "Fair", color: "text-amber-600" };
      return { level: "Needs Work", color: "text-amber-600" };
    };

    const { level, color } = getScoreLevel(value);

    return (
      <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 w-full h-full flex flex-col justify-between border border-white/20`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">{label}</h3>
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon size={24} className="text-white" />
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="white"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{value}</span>
            <span className="text-xs font-semibold text-white/80">%</span>
          </div>
        </div>

        {/* Score Level */}
        <div className="text-center">
          <p className={`text-sm font-semibold ${color}`}>{level}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-700 rounded-2xl p-1 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t[lang].YourAssessmentResults}</h2>
              {/* <p className="text-slate-300 text-sm mt-1">Based on your comprehensive career assessment</p> */}
            </div>
          </div>
        </div>

        {testDate && (
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Calendar size={16} />
            <span>Assessment completed on {testDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        )}
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-full">
          <ScoreCircle
            label={t[lang].clarityscore}
            value={scores.clarityScore}
            icon={TrendingUp}
            gradientFrom="from-blue-500"
            gradientTo="to-blue-600"
          />
        </div>
        <div className="h-full">
          <ScoreCircle
            label= {t[lang].interestscore}
            value={scores.interestScore}
            icon={Zap}
            gradientFrom="from-purple-500"
            gradientTo="to-purple-600"
          />
        </div>
        <div className="h-full">
          <ScoreCircle
            label={t[lang].overallscore}
            value={scores.overall}
            icon={Award}
            gradientFrom="from-emerald-500"
            gradientTo="to-emerald-600"
          />
        </div>
      </div>

      {/* Score Interpretation */}
      {/* <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Score Interpretation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <p className="text-sm font-semibold text-emerald-900 mb-1">80-100%</p>
            <p className="text-xs text-emerald-700">Excellent - Strong alignment</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-1">60-79%</p>
            <p className="text-xs text-blue-700">Good - Clear direction</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <p className="text-sm font-semibold text-amber-900 mb-1">40-59%</p>
            <p className="text-xs text-amber-700">Fair - Some uncertainty</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <p className="text-sm font-semibold text-orange-900 mb-1">Below 40%</p>
            <p className="text-xs text-orange-700">Explore more options</p>
          </div>
        </div>
      </div> */}

      {/* Insights Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Key Insights</h3>

        <div className="space-y-4">
          {scores.clarityScore >= 70 ? (
            <div className="flex gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-slate-900">Strong Career Clarity</p>
                <p className="text-sm text-slate-600 mt-1">You have a clear understanding of your career direction and goals.</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <TrendingUp className="text-amber-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-slate-900">Developing Career Clarity</p>
                <p className="text-sm text-slate-600 mt-1">Consider exploring different career paths to increase clarity.</p>
              </div>
            </div>
          )}

          {scores.interestScore >= 70 ? (
            <div className="flex gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Zap className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-slate-900">Well-Aligned Interests</p>
                <p className="text-sm text-slate-600 mt-1">Your interests align well with your career aspirations.</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <Zap className="text-purple-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-slate-900">Explore Your Interests</p>
                <p className="text-sm text-slate-600 mt-1">Take time to discover what truly interests you in a career.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* <button
          onClick={() => (window.location.href = "/dashboard")}
          className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-semibold flex items-center justify-center gap-2"
        >
          Back to Dashboard
        </button> */}

        {canRetest && (
          <button
            onClick={() => navigate("/assessment")}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Take Retest
          </button>
        )}

      </div>
    </div>
  );
};

export default ScoreCard;