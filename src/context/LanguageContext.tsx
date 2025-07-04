"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ar";

const LanguageContext = createContext<{
    language: Language;
    setLanguage: (lang: Language) => void;
} | null>(null);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context)
        throw new Error("useLanguage must be used within LanguageProvider");
    return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>("en");

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
