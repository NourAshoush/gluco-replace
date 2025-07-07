"use client";

import { useEffect, useState } from "react";
import EditQuestionModal from "@/components/EditQuestionModal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function FormManagerPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            const supabase = createClientComponentClient();
            const { data } = await supabase.from("questions").select("*").order("order");
            setQuestions(data || []);
        };
        fetchQuestions();
    }, []);

    if (selectedQuestion) {
        return (
            <EditQuestionModal
                question={selectedQuestion}
                onClose={() => setSelectedQuestion(null)}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-green">Form Manager</h1>
            <div className="space-y-4">
                {questions?.map((q) => (
                    <div
                        key={q.name}
                        className="flex items-center justify-between border border-gray-200 rounded p-4 bg-white shadow-sm"
                    >
                        <div className="w-12 text-green font-bold text-lg">{q.order}</div>
                        <div className="flex-1 text-gray-800 text-base font-medium">
                            {q.question_en}
                            {q.required && <span className="text-red-600 font-bold ml-1">*</span>}
                        </div>
                        <div>
                            <button
                                onClick={() => setSelectedQuestion(q)}
                                className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
                                title="Edit Question"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}