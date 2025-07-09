import React, { useState, useEffect } from "react";
import { MdSave, MdClose } from "react-icons/md";
import { createClient } from "@/utils/supabase/client";

interface AddQuestionModalProps {
    onClose: (result: Question | null) => void;
    existingOrder: number;
}

interface Question {
    name: string;
    type: string;
    question_en: string;
    question_ar: string;
    required: boolean;
    options?: { en: string; ar: string }[];
    order: number;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
    onClose,
    existingOrder,
}) => {
    const supabase = createClient();
    const [name, setName] = useState("");
    const [type, setType] = useState("text");
    const [questionEn, setQuestionEn] = useState("");
    const [questionAr, setQuestionAr] = useState("");
    const [required, setRequired] = useState(false);
    const [options, setOptions] = useState<{ en: string; ar: string }[]>([]);
    const [isChanged, setIsChanged] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hasContent =
            name.trim() !== "" &&
            questionEn.trim() !== "" &&
            questionAr.trim() !== "";
        setIsChanged(hasContent);
    }, [name, questionEn, questionAr]);

    const handleSubmit = async () => {
        if (type === "select" && options.length === 0) {
            alert("Options cannot be empty for select type");
            return;
        }

        const newQuestion: Question = {
            name,
            type,
            question_en: questionEn,
            question_ar: questionAr,
            required,
            order: existingOrder,
            options: type === "select" ? options : undefined,
        };

        setLoading(true);
        const { data, error } = await supabase.from("questions").insert(newQuestion).select();
        setLoading(false);

        if (error) {
            alert("Error adding question: " + error.message);
            return;
        }

        onClose(data?.[0]);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 relative min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4 text-green">Add Question</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Question Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
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
                        onChange={(e) => setType(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
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
                {type === "select" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dropdown Options
                        </label>
                        <div className="space-y-2">
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="English"
                                        value={opt.en}
                                        onChange={(e) => {
                                            const updated = [...options];
                                            updated[idx].en = e.target.value;
                                            setOptions(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Arabic"
                                        value={opt.ar}
                                        onChange={(e) => {
                                            const updated = [...options];
                                            updated[idx].ar = e.target.value;
                                            setOptions(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...options];
                                            updated.splice(idx, 1);
                                            setOptions(updated);
                                        }}
                                        className="ml-2 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
                                        title="Remove option"
                                    >
                                        <MdClose size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() =>
                                    setOptions([...options, { en: "", ar: "" }])
                                }
                                className="btn-black rounded px-2 py-1 text-sm mt-2"
                            >
                                Add Option
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div className="flex gap-4">
                    <button
                        onClick={handleSubmit}
                        className="btn-green text-sm px-4 py-2 border rounded flex items-center gap-2"
                        disabled={!isChanged}
                        style={{
                            cursor: !isChanged ? "not-allowed" : "pointer",
                            opacity: !isChanged ? 0.5 : 1,
                        }}
                    >
                        <MdSave size={16} />
                        Add Question
                    </button>
                    <button
                        onClick={() => onClose(null)}
                        className="btn-black text-sm px-4 py-2 border rounded flex items-center gap-2"
                    >
                        <MdClose size={16} />
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddQuestionModal;
