import Image from "next/image";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const SerialHelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/10 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full flex flex-col items-center text-center relative">
                <div className="w-full flex justify-end mb-2">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-3xl font-bold cursor-pointer"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                <p className="mb-4">
                    {isArabic
                        ? "يرجى تحديد الرقم التسلسلي المطبوع على جانب عبوة ديكسكوم. يبدأ بـ (21)"
                        : "Please locate the serial number printed on the side of the Dexcom package. It begins with (21)."}
                </p>
                <Image
                    src="/serial_help.png"
                    alt="Example showing where to find the serial number"
                    width={400}
                    height={300}
                    className="mx-auto rounded"
                />
            </div>
        </div>
    );
};

export default SerialHelpModal;