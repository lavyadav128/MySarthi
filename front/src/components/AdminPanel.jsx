import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ChevronDown, AlertCircle, CheckCircle, Menu, X } from "lucide-react";
import { useAuthContext } from "../context/AuthContext.jsx";
import { API_BASE } from "../environment.jsx";

const normalizeLangText = (value) => {
  if (!value) return { en: "", hi: "" };
  if (typeof value === "string") return { en: value, hi: "" };
  return { en: value.en || "", hi: value.hi || "" };
};

function AdminPanel() {
  const auth = useAuthContext();
  const [qs, setQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [form, setForm] = useState({
    question: normalizeLangText(""),
    category: "clarity",
    isVisibleToUser: true,
    options: [{ id: "a", text: normalizeLangText(""), weight: 0 }],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/questions`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const normalized = data.map(q => ({
            ...q,
            question: normalizeLangText(q.question),
            options: q.options.map(opt => ({ ...opt, text: normalizeLangText(opt.text) }))
          }));
          setQs(normalized);
        }
      } catch (error) {
        showNotification("Failed to load questions", "error");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.token]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addOption = () => {
    const newId = String.fromCharCode(97 + form.options.length);
    setForm({
      ...form,
      options: [...form.options, { id: newId, text: normalizeLangText(""), weight: 0 }],
    });
  };

  const removeOption = (index) => {
    if (form.options.length <= 1) return;
    setForm({ ...form, options: form.options.filter((_, i) => i !== index) });
  };

  const updateOption = (index, field, value, lang) => {
    const updatedOptions = form.options.map((opt, i) => {
      if (i !== index) return opt;
      if (field === "text") {
        return { ...opt, text: { ...opt.text, [lang]: value } };
      }
      return { ...opt, [field]: field === "weight" ? Number(value) : value };
    });
    setForm({ ...form, options: updatedOptions });
  };

  const editQuestion = (question) => {
    setEditingId(question._id);
    setForm({
      question: normalizeLangText(question.question),
      category: question.category,
      isVisibleToUser: question.isVisibleToUser,
      options: question.options.map(opt => ({
        id: opt.id,
        text: normalizeLangText(opt.text),
        weight: opt.weight
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveQuestion = async () => {
    if (!form.question.en.trim() || !form.question.hi.trim()) {
      showNotification("Question required in both languages", "error");
      return;
    }
    if (form.options.some(opt => !opt.text.en.trim() || !opt.text.hi.trim())) {
      showNotification("All options must have text in both languages", "error");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE}/admin/questions/${editingId}` : `${API_BASE}/admin/questions`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          ...form,
          isVisibleToUser: Boolean(form.isVisibleToUser),
          options: form.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            weight: Number(opt.weight)
          }))
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      if (editingId) {
        setQs(prev => prev.map(q => q._id === data._id ? data : q));
        showNotification("Question updated successfully", "success");
      } else {
        setQs(prev => [...prev, data]);
        showNotification("Question created successfully", "success");
      }

      setEditingId(null);
      resetForm();
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const resetForm = () => {
    setForm({
      question: normalizeLangText(""),
      category: "clarity",
      isVisibleToUser: true,
      options: [{ id: "a", text: normalizeLangText(""), weight: 0 }],
    });
  };

  const deleteQuestion = async (id) => {
    if (!confirm("Delete this question? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        setQs(prev => prev.filter(q => q._id !== id));
        if (editingId === id) {
          setEditingId(null);
          resetForm();
        }
        showNotification("Question deleted successfully", "success");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Question Manager</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Create and manage survey questions in English and Hindi</p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg z-50 ${
          notification.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle size={20} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0" />
          )}
          <span className="font-medium text-sm sm:text-base">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {editingId ? "Edit Question" : "Create New Question"}
                </h2>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Language Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Question (English) *
                    </label>
                    <input
                      type="text"
                      value={form.question.en}
                      onChange={(e) => setForm({ ...form, question: { ...form.question, en: e.target.value } })}
                      placeholder="Enter question in English"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      प्रश्न (Hindi) *
                    </label>
                    <input
                      type="text"
                      value={form.question.hi}
                      onChange={(e) => setForm({ ...form, question: { ...form.question, hi: e.target.value } })}
                      placeholder="हिंदी में प्रश्न दर्ज करें"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Category & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                    >
                      <option value="clarity">Clarity</option>
                      <option value="interest">Interest</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Visibility</label>
                    <select
                      value={form.isVisibleToUser}
                      onChange={(e) => setForm({ ...form, isVisibleToUser: e.target.value === "true" })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                    >
                      <option value="true">Visible to Users</option>
                      <option value="false">Hidden from Users</option>
                    </select>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700">Answer Options</label>
                    <span className="text-xs text-slate-500">{form.options.length} option(s)</span>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                    {form.options.map((option, index) => (
                      <div key={option.id || index} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end bg-white p-3 sm:p-4 rounded-lg border border-slate-200">
                        <div className="w-full sm:w-16">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">ID</label>
                          <input
                            type="text"
                            value={option.id}
                            onChange={(e) => updateOption(index, "id", e.target.value)}
                            className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            pattern="[a-zA-Z0-9]+"
                          />
                        </div>
                        <div className="flex-grow space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-semibold text-slate-600">EN *</label>
                              <input
                                type="text"
                                value={option.text.en}
                                onChange={(e) => updateOption(index, "text", e.target.value, "en")}
                                placeholder="English"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-600">HI *</label>
                              <input
                                type="text"
                                value={option.text.hi}
                                onChange={(e) => updateOption(index, "text", e.target.value, "hi")}
                                placeholder="हिंदी"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="w-full sm:w-20">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Weight</label>
                          <input
                            type="number"
                            value={option.weight}
                            onChange={(e) => updateOption(index, "weight", e.target.value)}
                            className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="-10"
                            max="10"
                          />
                        </div>
                        <button
                          onClick={() => removeOption(index)}
                          disabled={form.options.length <= 1}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition self-end"
                          title="Remove option"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addOption}
                    className="mt-3 flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Plus size={18} />
                    Add Option
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={saveQuestion}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-md text-sm sm:text-base"
                  >
                    {editingId ? "Update Question" : "Create Question"}
                  </button>
                  {editingId && (
                    <button
                      onClick={() => {
                        setEditingId(null);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            {/* Mobile Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-medium"
              >
                Statistics
                <ChevronDown size={20} className={`transition ${showStats ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Stats Content */}
            <div className={`${showStats ? "block" : "hidden"} lg:block bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-6`}>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 hidden lg:block">Statistics</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600">{qs.length}</div>
                  <div className="text-xs sm:text-sm text-blue-700 mt-1">Total Questions</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-600">{qs.filter(q => q.isVisibleToUser).length}</div>
                  <div className="text-xs sm:text-sm text-emerald-700 mt-1">Visible Questions</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="text-3xl sm:text-4xl font-bold text-orange-600">{qs.filter(q => q.category === "clarity").length}</div>
                  <div className="text-xs sm:text-sm text-orange-700 mt-1">Clarity Questions</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-yelllow-100 p-4 rounded-lg border border-orange-200">
                  <div className="text-3xl sm:text-4xl font-bold text-yellow-600">{qs.filter(q => q.category === "interest").length}</div>
                  <div className="text-xs sm:text-sm text-yellow-700 mt-1">Interest Questions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">All Questions</h2>
            <span className="text-xs sm:text-sm text-slate-600">Showing {qs.length} question{qs.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-3">
            {qs.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-6 sm:p-8 text-center">
                <p className="text-slate-500 font-medium text-sm sm:text-base">No questions yet. Create one to get started!</p>
              </div>
            ) : (
              qs.map((question) => (
                <div
                  key={question._id}
                  className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden hover:shadow-md transition"
                >
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === question._id ? null : question._id)}
                    className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2">
                        {typeof question.question === "string" ? question.question : question.question?.en}
                      </h3>
                      {question.question?.hi && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-1">{question.question.hi}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          question.category === "clarity"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {question.category}
                        </span>
                        <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          question.isVisibleToUser
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {question.isVisibleToUser ? "Visible" : "Hidden"}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-slate-400 transition flex-shrink-0 ml-2 ${expandedQuestion === question._id ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expandedQuestion === question._id && (
                    <div className="border-t border-slate-200 p-3 sm:p-4 bg-slate-50">
                      <div className="mb-4">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">Options</h4>
                        <div className="flex flex-col gap-2">
                          {question.options.map((option) => (
                            <div
                              key={`${question._id}-${option.id}`}
                              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-700"
                            >
                              <span className="font-semibold">{option.id}:</span> {typeof option.text === "string" ? option.text : option.text?.en}
                              {option.text?.hi && <span className="block text-xs text-slate-500 mt-1">{option.text.hi}</span>}
                              <span className="text-xs text-slate-500 ml-2">({option.weight})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => editQuestion(question)}
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-xs sm:text-sm font-medium flex-1 sm:flex-none"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteQuestion(question._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition text-xs sm:text-sm font-medium flex-1 sm:flex-none"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;