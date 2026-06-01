// context/LanguageContext.jsx
import p from "../components/lang/convert.js";
import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en"); // null = not selected yet

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);

  const changeLanguage = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        changeLanguage,
        t: lang ? p[lang] : {},
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
