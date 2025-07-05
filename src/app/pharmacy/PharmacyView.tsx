/* eslint-disable */
"use client";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { MdQrCodeScanner } from "react-icons/md";
import { useLanguage } from "@/context/LanguageContext";
import QRCodeScanner from "@/components/QRCodeScanner";
import CodeResultOverlay from "@/components/CodeResultOverlay";
import MainHeader from "@/components/MainHeader";

export default function PharmacyView() {
    const [code, setCode] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [showScanner, setShowScanner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<null | {
        type: "success" | "error-used" | "error-notfound" | "error-invalid";
        message: string;
    }>(null);
    const [responseId, setResponseId] = useState<string | null>(null);

    const { language } = useLanguage();

    const submitCode = async (inputCode: string) => {
        setLoading(true);
        if (inputCode.length !== 7) {
            setResult({
                type: "error-invalid",
                message:
                    language === "ar"
                        ? "يجب أن يتكون الرمز من 7 أحرف"
                        : "Code must be exactly 7 characters long.",
            });
            setLoading(false);
            return;
        }

        const supabase = createClient();
        const { data, error } = await supabase
            .from("responses")
            .select("id, resolved")
            .eq("code", inputCode)
            .single();

        if (error) {
            setResult({
                type: "error-notfound",
                message:
                    language === "ar"
                        ? "قد لا يكون الرمز موجودًا أو قد يكون غير صحيح"
                        : "Code not found.",
            });
            setLoading(false);
            return;
        }

        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError || !userData?.user) {
            setResult({
                type: "error-notfound",
                message:
                    language === "ar"
                        ? "تعذر استرداد معلومات المستخدم"
                        : "Unable to retrieve user info.",
            });
            setLoading(false);
            return;
        }

        await supabase
            .from("responses")
            .update({
                last_seen_at: new Date().toISOString(),
                last_seen_by: userData.user.id,
            })
            .eq("id", data.id);

        if (data.resolved) {
            setResult({
                type: "error-used",
                message:
                    language === "ar"
                        ? "تم استخدام الرمز"
                        : "Code already verified.",
            });
            setLoading(false);
            return;
        }

        setResult({
            type: "success",
            message:
                language === "ar"
                    ? "الرمز صالح. يرجى إصدار جهاز بديل"
                    : "Code is valid. Please issue a replacement.",
        });
        setResponseId(data.id);
        setLoading(false);
    };

    const handleResolve = async () => {
        if (!responseId) return;
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        await supabase
            .from("responses")
            .update({
                resolved: true,
                resolved_at: new Date().toISOString(),
                resolved_by: userData.user?.id ?? null,
            })
            .eq("id", responseId);
        setResult(null);
        setResponseId(null);
        setCode("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitCode(code);
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
            <MainHeader />
            <main className="flex-grow px-6 py-8 w-full">
                <div className="w-full max-w-xl bg-white shadow-lg rounded p-6 mt-10 mx-auto">
                    <h2 className="text-xl font-semibold mb-4 text-center">
                        {language === "ar" ? "أدخل الرمز" : "Enter Code"}
                    </h2>

                    {loading ? (
                        <div className="flex justify-center items-center h-60">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        maxLength={7}
                                        value={code}
                                        placeholder={
                                            language === "ar"
                                                ? "-------"
                                                : "-------"
                                        }
                                        onChange={(e) => {
                                            const val =
                                                e.target.value.toUpperCase();
                                            if (/^[A-Z0-9]*$/.test(val)) {
                                                setCode(val);
                                            }
                                        }}
                                        className="w-full text-center border border-gray-300 rounded text-xl uppercase tracking-widest font-mono py-2"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={code.length !== 7}
                                    className={`bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200 ${
                                        code.length !== 7
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    {language === "ar" ? "إرسال" : "Submit"}
                                </button>
                            </form>

                            <p className="text-center text-gray-500 mt-4 select-none">
                                {language === "ar"
                                    ? "أو امسح رمز الاستجابة السريعة"
                                    : "or scan QR code"}
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="mt-6 flex justify-center items-center w-full"
                            >
                                <MdQrCodeScanner className="text-7xl text-blue-600 hover:text-blue-700 cursor-pointer transition-all duration-200" />
                            </button>

                            {showScanner && (
                                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                                    <div className="bg-white rounded p-2 w-[300px] max-w-full relative">
                                        {showScanner && (
                                            <QRCodeScanner
                                                onScanSuccess={(
                                                    scannedCode
                                                ) => {
                                                    const formattedCode =
                                                        scannedCode.toUpperCase();
                                                    setCode(formattedCode);
                                                    setShowScanner(false);
                                                    submitCode(formattedCode);
                                                }}
                                                onClose={() =>
                                                    setShowScanner(false)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {result && (
                        <CodeResultOverlay
                            type={result.type}
                            message={result.message}
                            onClose={() => {
                                setResult(null);
                                setStatus("idle");
                                setCode("");
                            }}
                            onResolve={handleResolve}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
