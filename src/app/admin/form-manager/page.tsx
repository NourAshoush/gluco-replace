"use client";
import { useEffect, useState } from "react";
import EditQuestionModal from "@/components/EditQuestionModal";
import AddQuestionModal from "@/components/AddQuestionModal";
import ReorderQuestionsModal from "@/components/ReorderQuestionsModal";
import { createClient } from "@/utils/supabase/client";

export default function FormManagerPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
    const [adding, setAdding] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            const { data } = await supabase
                .from("questions")
                .select("*")
                .order("order");
            setQuestions(data || []);
            setUser(user);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
            </div>
        );
    }

    if (reordering) {
        return (
            <ReorderQuestionsModal
                questions={questions}
                onClose={(updated) => {
                    if (Array.isArray(updated)) {
                        setQuestions(updated);
                    }
                    setReordering(false);
                }}
            />
        );
    }

    if (adding) {
        return (
            <AddQuestionModal
                onClose={(result) => {
                    if (result) {
                        setQuestions((prev) => [...prev, result]);
                    }
                    setAdding(false);
                }}
                existingOrder={
                    questions.length > 0
                        ? Math.max(...questions.map((q) => q.order || 0)) + 1
                        : 1
                }
            />
        );
    }

    if (selectedQuestion) {
        return (
            <EditQuestionModal
                question={selectedQuestion}
                user={user}
                onClose={(result) => {
                    if (result?.deleted) {
                        setQuestions((prev) => {
                            const filtered = prev.filter((q) => q.name !== result.name);
                            return filtered.map((q, i) => ({ ...q, order: i + 1 }));
                        });
                    } else if (result) {
                        setQuestions((prev) =>
                            prev.map((q) => (q.name === result.name ? result : q))
                        );
                    }
                    setSelectedQuestion(null);
                }}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 relative min-h-[400px]">
            <h1 className="text-2xl font-bold mb-6 text-green">Form Manager</h1>

            <div className="space-y-4">
                {questions?.map((q) => (
                    <div
                        key={q.name}
                        className="flex items-center justify-between border border-gray-200 rounded p-4 bg-white shadow-sm"
                    >
                        <div className="w-12 text-green font-bold text-lg">
                            {q.order}
                        </div>
                        <div className="flex-1 text-gray-800 text-base font-medium">
                            {q.question_en}
                            {q.required && (
                                <span className="text-red-600 font-bold ml-1">
                                    *
                                </span>
                            )}
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
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex mb-4 pt-4 gap-4">
                <button
                    onClick={() => setAdding(true)}
                    className="btn-green px-4 py-2 text-sm rounded"
                >
                    Add Question
                </button>
                <button
                    onClick={() => setReordering(true)}
                    className="btn-black px-4 py-2 text-sm rounded"
                >
                    Reorder Questions
                </button>
            </div>
        </div>
    );
}
