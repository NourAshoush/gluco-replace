"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useConfirmation } from "@/context/ConfirmationContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import MainHeader from "@/components/MainHeader";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ar } from "date-fns/locale";
import { enGB } from "date-fns/locale";

interface Question {
    name: string;
    type: string;
    question_en: string;
    question_ar: string;
    order: number;
    required: boolean;
    options?: { en: string; ar: string }[];
}

export default function Home() {
    const { language, setLanguage } = useLanguage();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const { setCode } = useConfirmation();
    const router = useRouter();
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        registerLocale("ar", ar);
        registerLocale("en-GB", enGB);

        const fetchQuestions = async () => {
            setLoadingQuestions(true);
            const { data, error } = await supabase
                .from("questions")
                .select("*")
                .order("order", { ascending: true });

            if (error) {
                // TODO: Handle error
                console.error("Error fetching questions:", error);
            } else {
                setQuestions(data as Question[]);
            }
            setLoadingQuestions(false);
        };

        fetchQuestions();
    }, []);

    const today = new Date().toISOString().split("T")[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const { data, error } = await supabase
            .from("responses")
            .insert([{ response_data: formData }])
            .select("code")
            .single();

        if (error) {
            // TODO: Handle error
            console.error("Error submitting response:", error);
        } else {
            setCode(data.code);
            setFormData({});
            router.push("/confirmation");
        }
        setSubmitting(false);
    };

    if (loadingQuestions) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <div className="relative min-h-screen bg-white text-black overflow-y-auto">
                {submitting && (
                    <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                )}

                <MainHeader />

                <form
                    onSubmit={handleSubmit}
                    className={`max-w-2xl mx-auto p-6 space-y-6 ${
                        language === "ar" ? "text-right" : "text-left"
                    }`}
                >
                    <p className="text-m text-gray-600">
                        {language === "en"
                            ? "Fields marked with "
                            : "الحقول التي تحتوي على "}
                        <span className="text-red-500">*</span>
                        {language === "en" ? " are required" : " مطلوبة"}
                    </p>
                    {questions.map((q) => (
                        <div key={q.name} className="w-full">
                            <label
                                className={`block mb-2 text-xl font-medium ${
                                    language === "ar"
                                        ? "text-right"
                                        : "text-left"
                                }`}
                                htmlFor={q.name}
                            >
                                {language === "en"
                                    ? q.question_en
                                    : q.question_ar}
                                {q.required && (
                                    <span className="text-red-500"> *</span>
                                )}
                            </label>

                            {q.type === "textarea" ? (
                                <textarea
                                    id={q.name}
                                    name={q.name}
                                    rows={4}
                                    required={q.required}
                                    placeholder={
                                        language === "en"
                                            ? "Your answer"
                                            : "إجابتك"
                                    }
                                    className={`w-full p-3 border rounded bg-white text-base resize-none ${
                                        language === "ar"
                                            ? "text-right"
                                            : "text-left"
                                    } ${submitting ? "opacity-50" : ""}`}
                                    value={formData[q.name] || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            [q.name]: e.target.value,
                                        })
                                    }
                                    disabled={submitting}
                                />
                            ) : q.type === "select" && q.options ? (
                                <select
                                    id={q.name}
                                    name={q.name}
                                    required={q.required}
                                    className={`w-full p-3 border rounded bg-white text-base ${
                                        language === "ar"
                                            ? "text-right"
                                            : "text-left"
                                    } ${submitting ? "opacity-50" : ""}`}
                                    value={formData[q.name] || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            [q.name]: e.target.value,
                                        })
                                    }
                                    disabled={submitting}
                                >
                                    <option value="" disabled hidden>
                                        {language === "en"
                                            ? "Select..."
                                            : "اختر"}
                                    </option>
                                    {q.options.map((opt, idx) => (
                                        <option key={idx} value={opt.en}>
                                            {language === "en"
                                                ? opt.en
                                                : opt.ar}
                                        </option>
                                    ))}
                                </select>
                            ) : q.type === "date" ? (
                                <div className="w-full p-3 border rounded bg-white text-base text-left">
                                    <DatePicker
                                        id={q.name}
                                        selected={
                                            formData[q.name]
                                                ? new Date(formData[q.name])
                                                : null
                                        }
                                        onChange={(date) =>
                                            setFormData({
                                                ...formData,
                                                [q.name]: date
                                                    ?.toISOString()
                                                    .split("T")[0],
                                            })
                                        }
                                        dateFormat="dd/MM/yyyy"
                                        locale={
                                            language === "ar" ? "ar" : "en-GB"
                                        }
                                        placeholderText={
                                            language === "ar"
                                                ? "اختر تاريخًا"
                                                : "Select a date"
                                        }
                                        disabled={submitting}
                                        calendarStartDay={0}
                                        className="w-full"
                                    />
                                </div>
                            ) : (
                                <input
                                    id={q.name}
                                    name={q.name}
                                    type={q.type}
                                    {...(q.type === "number"
                                        ? {
                                              min: "0",
                                              step: "any",
                                              pattern: "[0-9]*[.,]?[0-9]*",
                                              inputMode: "decimal",
                                              onKeyDown: (e) => {
                                                  if (
                                                      [
                                                          "e",
                                                          "E",
                                                          "+",
                                                          "-",
                                                      ].includes(e.key) ||
                                                      (e.key === "." &&
                                                          (e.currentTarget.value.includes(
                                                              "."
                                                          ) ||
                                                              !e.currentTarget
                                                                  .value))
                                                  ) {
                                                      e.preventDefault();
                                                  }
                                              },
                                          }
                                        : {})}
                                    required={q.required}
                                    placeholder={
                                        language === "en"
                                            ? "Your answer"
                                            : "إجابتك"
                                    }
                                    className={`w-full p-3 border rounded bg-white text-base ${
                                        language === "ar"
                                            ? "text-right"
                                            : "text-left"
                                    } ${submitting ? "opacity-50" : ""}`}
                                    value={formData[q.name] || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            [q.name]: e.target.value,
                                        })
                                    }
                                    disabled={submitting}
                                />
                            )}
                        </div>
                    ))}

                    <button
                        type="submit"
                        className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed${
                            submitting ? " opacity-50" : ""
                        }`}
                        disabled={submitting}
                    >
                        {language === "en" ? "Submit" : "إرسال"}
                    </button>
                </form>
            </div>
        </>
    );
}
