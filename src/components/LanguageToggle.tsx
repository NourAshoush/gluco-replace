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
            className="text-sm py-2 px-4 border rounded btn-black"
        >
            {language === "en" ? "عربى" : "English"}
        </button>
    );
}
