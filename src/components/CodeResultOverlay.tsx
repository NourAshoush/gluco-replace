import { useLanguage } from "@/context/LanguageContext";
import React, { useState } from "react";
import { MdCheckCircle, MdError, MdWarning, MdClose, MdBlock } from "react-icons/md";

interface CodeResultOverlayProps {
    type: "success" | "error-used" | "error-notfound" | "error-invalid";
    message: string;
    onClose: () => void;
    onResolve?: () => void;
}

const iconMap = {
    success: <MdCheckCircle size={96} className="text-green-600" />,
    "error-used": <MdError size={96} className="text-red-600" />,
    "error-notfound": <MdWarning size={96} className="text-yellow-500" />,
    "error-invalid": <MdBlock size={96} className="text-red-600" />,
};

const CodeResultOverlay: React.FC<CodeResultOverlayProps> = ({
    type,
    message,
    onClose,
    onResolve,
}) => {
    const [isResolving, setIsResolving] = useState(false);
    const { language } = useLanguage();

    const handleResolveClick = async () => {
        if (!onResolve) return;
        if (isResolving) return;
        setIsResolving(true);
        try {
            await onResolve();
        } finally {
            setIsResolving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center text-center p-6">
            <button
                className="absolute top-4 right-4 text-4xl text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200"
                onClick={onClose}
                aria-label="Close overlay"
            >
                <MdClose size={32} />
            </button>

            <div className="mb-6">
                {iconMap[type]}
            </div>

            <h2 className={`text-2xl font-bold mb-4`}>
                {type === "success"
                    ? language === "ar" ? "تم قبول الرمز" : "Code Accepted"
                    : type === "error-used"
                    ? language === "ar" ? "الرمز مستخدم" : "Code Already Used"
                    : type === "error-invalid"
                    ? language === "ar" ? "رمز غير صالح" : "Invalid Code"
                    : language === "ar" ? "لم يتم العثور على الرمز" : "Code Not Found"}
            </h2>

            <p className="text-lg mb-6">{message}</p>

            <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition-colors duration-200"
            >
                {language === "ar" ? "إغلاق" : "Close"}
            </button>

            {type === "success" && onResolve && (
                <button
                    onClick={handleResolveClick}
                    disabled={isResolving}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {language === "ar" ? "تم إصدار الاستبدال" : "Replacement Issued"}
                </button>
            )}
        </div>
    );
};

export default CodeResultOverlay;
