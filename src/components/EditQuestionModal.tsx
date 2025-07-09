import { useState, useEffect } from "react";
import { MdDelete, MdSave, MdClose } from "react-icons/md";
import { createClient } from "@/utils/supabase/client";

export default function EditQuestionModal({
    question,
    user,
    onClose,
}: {
    question: any;
    user: any;
    onClose: (updatedQuestion?: any) => void;
}) {
    const supabase = createClient();

    const [questionEn, setQuestionEn] = useState(question.question_en);
    const [questionAr, setQuestionAr] = useState(question.question_ar);
    const [required, setRequired] = useState(question.required);
    const [type, setType] = useState(question.type);
    const [options, setOptions] = useState<{ en: string; ar: string }[]>(
        Array.isArray(question.options) ? question.options : []
    );

    const [isChanged, setIsChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    useEffect(() => {
        const changed =
            questionEn !== question.question_en ||
            questionAr !== question.question_ar ||
            required !== question.required ||
            type !== question.type ||
            JSON.stringify(options) !== JSON.stringify(question.options ?? []);
        setIsChanged(changed);
    }, [questionEn, questionAr, required, type, options]);

    const handleSave = async () => {
        setLoading(true);
        const updatePayload: any = {
            question_en: questionEn,
            question_ar: questionAr,
            required,
            type,
        };

        if (type === "select") {
            updatePayload.options = options;
        }

        const { data, error } = await supabase
            .from("questions")
            .update(updatePayload)
            .eq("name", question.name)
            .select();
        setLoading(false);
        onClose(data?.[0]);
    };

    const handleDelete = async () => {
        setLoading(true);
        const supabase = createClient();

        // Delete the question
        await supabase.from("questions").delete().eq("name", question.name);

        // Get all questions ordered by 'order'
        const { data: remaining, error } = await supabase
            .from("questions")
            .select("*")
            .order("order");

        if (error) {
            console.error("Error fetching remaining questions:", error.message);
            setLoading(false);
            onClose({ deleted: true, name: question.name });
            return;
        }

        // Reorder remaining questions to remove gap
        const reordered = remaining.map((q, idx) => ({
            ...q,
            order: idx + 1,
        }));

        // Batch update reordered questions
        await Promise.all(
            reordered.map((q) =>
                supabase
                    .from("questions")
                    .update({ order: q.order })
                    .eq("name", q.name)
            )
        );

        setLoading(false);
        onClose({ deleted: true, name: question.name });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 relative min-h-[400px]">
            {confirmingDelete && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                        <p className="text-lg font-semibold mb-4 text-red-600">
                            Are you sure you want to delete this question?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleDelete}
                                className="btn-red px-4 py-2 text-sm border rounded"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setConfirmingDelete(false)}
                                className="btn-black px-4 py-2 text-sm border rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
                </div>
            )}
            <div className="relative min-h-[400px]">
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
                                                updated[idx].en =
                                                    e.target.value;
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
                                                updated[idx].ar =
                                                    e.target.value;
                                                setOptions(updated);
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                        <button
                                            type="button"
                                            className="text-red-400 hover:text-red-600 transition-colors duration-200 cursor-pointer"
                                            onClick={() => {
                                                const updated = options.filter(
                                                    (_, i) => i !== idx
                                                );
                                                setOptions(updated);
                                            }}
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOptions([
                                            ...options,
                                            { en: "", ar: "" },
                                        ])
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
                            onClick={handleSave}
                            className="btn-green text-sm px-4 py-2 border rounded flex items-center gap-2"
                            disabled={!isChanged}
                            style={{
                                cursor: !isChanged ? "not-allowed" : "pointer",
                                opacity: !isChanged ? 0.5 : 1,
                            }}
                        >
                            <MdSave size={16} />
                            Save Changes
                        </button>

                        <button
                            onClick={() => onClose()}
                            className="btn-black text-sm px-4 py-2 border rounded flex items-center gap-2"
                        >
                            <MdClose size={16} />
                            Close
                        </button>
                    </div>

                    <button
                        onClick={() => setConfirmingDelete(true)}
                        className="btn-red text-sm px-4 py-2 border rounded flex items-center gap-2"
                    >
                        <MdDelete size={16} />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
