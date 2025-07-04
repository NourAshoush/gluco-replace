"use client";
import { useConfirmation } from "@/context/ConfirmationContext";
import { QRCodeCanvas } from "qrcode.react";
import { useLanguage } from "@/context/LanguageContext";

export default function ConfirmationPage() {
    const { code } = useConfirmation();
    const { language } = useLanguage();

    if (!code) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white text-red-500 text-1xl font-bold">
                <p>
                    {language === "en"
                        ? "Invalid or missing confirmation code."
                        : "رمز التأكيد غير صالح أو مفقود."}
                </p>
                <p>
                    {language === "en"
                        ? "Please return to the form and submit again."
                        : "يرجى العودة إلى النموذج وإعادة الإرسال."}
                </p>
                <a href="/" className="mt-4 text-blue-500 hover:underline">
                    {language === "en"
                        ? "Go back to the form"
                        : "العودة إلى النموذج"}
                </a>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-white text-black p-4 text-center">
            <h1 className="text-2xl mb-4">
                {language === "en"
                    ? "Your response has been saved successfully!"
                    : "!تم حفظ ردك بنجاح"}
            </h1>
            <p className="text-3xl">
                {language === "en"
                    ? "Your replacement code is:"
                    : "!رمز الاستبدال الخاص بك هو"}
            </p>
            <span className="ml-2 text-3xl font-mono font-semibold text-blue-700">
                {code}
            </span>
            <div className="mt-6">
                <QRCodeCanvas value={code} size={128} />
            </div>
            <p className="mt-4 text-lg text-gray-600">
                {language === "en"
                    ? "Please take a screenshot of this page or write down your code for future reference."
                    : ".يرجى أخذ لقطة شاشة لهذه الصفحة أو حفظ رمز الخاص بك للرجوع إليه لاحقًا"}
            </p>
        </div>
    );
}
