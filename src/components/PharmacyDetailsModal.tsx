"use client";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function PharmacyDetailsModal({
    pharmacy,
    onClose,
}: {
    pharmacy: {
        id: number;
        pharmacy_name: string;
        governorate: string;
        area: string;
        address?: string | null;
        open_24_hours: boolean;
        google_maps_link: string;
        latitude?: number | null;
        longitude?: number | null;
    };
    onClose: () => void;
}) {
    const { language } = useLanguage();
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className={`relative z-10 w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden ${language === "ar" ? "text-right" : "text-left"}`}>
                <div className="flex items-start justify-between p-5 border-b border-gray-200">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">
                            {pharmacy.pharmacy_name}
                        </h2>
                        <div className="text-sm text-gray-600">
                            {pharmacy.governorate} • {pharmacy.area}
                        </div>
                        {pharmacy.open_24_hours && (
                            <span className="inline-block text-xs bg-green bg-opacity-20 text-white px-2 py-1 rounded-full font-medium mt-1">
                                {language === "ar" ? "مفتوح 24 ساعة" : "Open 24 Hours"}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        aria-label="Close"
                    >
                        {language === "ar" ? "إغلاق" : "Close"}
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {(pharmacy.latitude != null && pharmacy.longitude != null) && (
                        <div>
                            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                                {language === "ar" ? "الخريطة" : "Location Map"}
                            </div>
                            <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                                <iframe
                                    title="Pharmacy location map"
                                    className="w-full h-56 sm:h-64"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}&z=15&output=embed`}
                                />
                            </div>
                        </div>
                    )}

                    {pharmacy.address && (
                        <div>
                            <div className="text-xs uppercase tracking-wide text-gray-500">
                                {language === "ar" ? "العنوان" : "Address"}
                            </div>
                            <div className="text-gray-800 mt-1 whitespace-pre-wrap">
                                {pharmacy.address}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 pt-0 flex items-center justify-end gap-3">
                    <a
                        href={pharmacy.google_maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-black px-4 py-2 text-sm rounded"
                    >
                        {language === "ar" ? "فتح في خرائط جوجل" : "Open in Google Maps"}
                    </a>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        {language === "ar" ? "إغلاق" : "Close"}
                    </button>
                </div>
            </div>
        </div>
    );
}
