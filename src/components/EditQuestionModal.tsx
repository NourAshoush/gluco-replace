import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function EditQuestionModal({ question, onClose }: { question: any; onClose: () => void }) {
    const supabase = createClientComponentClient();

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
        await supabase
            .from("questions")
            .update({
                question_en: questionEn,
                question_ar: questionAr,
                required,
                type,
            })
            .eq("name", question.name);

        onClose();
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-green">Edit Question</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Question Name</label>
                    <input
                        type="text"
                        value={question.name}
                        disabled
                        className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Question (English)</label>
                    <input
                        type="text"
                        value={questionEn}
                        onChange={(e) => setQuestionEn(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Question (Arabic)</label>
                    <input
                        type="text"
                        value={questionAr}
                        onChange={(e) => setQuestionAr(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={required}
                            onChange={(e) => setRequired(e.target.checked)}
                            className="mr-2"
                        />
                        Required
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Question Type</label>
                    <select
                        value={type}
                        disabled
                        className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
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
                    className={`btn-green text-sm px-4 py-2 border rounded ${!isChanged ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={!isChanged}
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
