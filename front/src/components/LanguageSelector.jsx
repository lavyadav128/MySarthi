// components/LanguageSelect.jsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelect() {
  const { changeLanguage } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LanguageCard
          title="English"
          subtitle="Continue in English"
          onClick={() => changeLanguage("en")}
        />
        <LanguageCard
          title="हिंदी"
          subtitle="हिंदी में जारी रखें"
          onClick={() => changeLanguage("hi")}
        />
      </div>
    </div>
  );
}

function LanguageCard({ title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition text-center"
    >
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-500">{subtitle}</p>
    </div>
  );
}
