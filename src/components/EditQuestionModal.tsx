import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function EditQuestionModal({ question, user, onClose }: { question: any; user: any; onClose: () => void }) {
    const supabase = createClient();

    const [questionEn, setQuestionEn] = useState(question.question_en);
    const [questionAr, setQuestionAr] = useState(question.question_ar);
    const [required, setRequired] = useState(question.required);
    const [type, setType] = useState(question.type);

    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        const changed =
            questionEn !== question.question_en ||
            questionAr !== question.question_ar ||
            required !== question.required ||
            type !== question.type;

        setIsChanged(changed);
    }, [questionEn, questionAr, required, type]);

    const handleSave = async () => {

        const { error } = await supabase
            .from("questions")
            .update({
                question_en: questionEn,
                question_ar: questionAr,
                required,
                type,
            })
            .eq("name", question.name)
            .select();

        onClose();
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-green">
                Edit Question
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Question Name
                    </label>
                    <input
                        type="text"
                        value={question.name}
                        disabled
                        className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Question (English)
                    </label>
                    <input
                        type="text"
                        value={questionEn}
                        onChange={(e) => setQuestionEn(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Question (Arabic)
                    </label>
                    <input
                        type="text"
                        value={questionAr}
                        onChange={(e) => setQuestionAr(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={required}
                            onChange={(e) => setRequired(e.target.checked)}
                            className="mr-2 accent-green-400"
                        />
                        Required
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Question Type
                    </label>
                    <select
                        value={type}
                        disabled
                        className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                    >
                        <option value="text">Text</option>
                        <option value="textarea">Paragraph</option>
                        <option value="tel">Phone Number</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="select">Dropdown</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={handleSave}
                    className={"btn-green text-sm px-4 py-2 border rounded"}
                    disabled={!isChanged}
                    style={{
                        cursor: !isChanged ? "not-allowed" : "pointer",
                        opacity: !isChanged ? 0.5 : 1,
                    }}
                >
                    Save Changes
                </button>
                <button
                    onClick={onClose}
                    className="btn-black text-sm px-4 py-2 border rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
