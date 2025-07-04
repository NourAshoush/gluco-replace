"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
        >
            {language === "en" ? "عربى" : "English"}
        </button>
    );
}
