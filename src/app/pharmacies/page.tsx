"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FaSpinner } from "react-icons/fa";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";
import PharmacyDetailsModal from "@/components/PharmacyDetailsModal";
import { useLanguage } from "@/context/LanguageContext";

interface Pharmacy {
    id: number;
    pharmacy_name: string;
    governorate: string;
    area: string;
    address?: string | null;
    open_24_hours: boolean;
    google_maps_link: string;
    latitude?: number | null;
    longitude?: number | null;
}

export default function PharmaciesPage() {
    const supabase = createClientComponentClient();
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Pharmacy | null>(null);
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const { language } = useLanguage();

    useEffect(() => {
        async function fetchPharmacies() {
            const { data } = await supabase
                .from("pharmacies")
                .select(
                    "id, pharmacy_name, governorate, area, address, open_24_hours, google_maps_link, latitude, longitude"
                )
                .eq("active", true)
                .order("pharmacy_name", { ascending: true });
            setPharmacies(data || []);
            setLoading(false);
        }
        fetchPharmacies();
    }, [supabase]);

    function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
        const R = 6371;
        const dLat = ((b.lat - a.lat) * Math.PI) / 180;
        const dLng = ((b.lng - a.lng) * Math.PI) / 180;
        const lat1 = (a.lat * Math.PI) / 180;
        const lat2 = (b.lat * Math.PI) / 180;
        const sinDLat = Math.sin(dLat / 2);
        const sinDLng = Math.sin(dLng / 2);
        const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
        return 2 * R * Math.asin(Math.sqrt(h));
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="flex-grow">
                <MainHeader />
                <div className={`max-w-6xl mx-auto p-6 space-y-4 ${language === "ar" ? "text-right" : "text-left"}`}>
                <h1 className="text-2xl font-bold text-green">
                    {language === "ar" ? "أقرب الصيدليات" : "Nearest Pharmacies"}
                </h1>
                <div className={`flex items-center gap-3 ${language === "ar" ? "justify-end" : ""}`}>
                    <button
                        className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                            if (!navigator.geolocation) return;
                            navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                                },
                                () => {
                                    // silently ignore if denied
                                },
                                { enableHighAccuracy: true, timeout: 8000 }
                            );
                        }}
                    >
                        {language === "ar" ? "استخدم موقعي" : "Use My Location"}
                    </button>
                    {userLoc && (
                        <span className="text-xs text-gray-500">{language === "ar" ? "تم تحديد الموقع" : "Location set"}</span>
                    )}
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <FaSpinner className="animate-spin text-green text-4xl" />
                    </div>
                ) : (
                    [...pharmacies]
                        .sort((a, b) => {
                            if (!userLoc) return a.pharmacy_name.localeCompare(b.pharmacy_name);
                            const aHas = a.latitude != null && a.longitude != null;
                            const bHas = b.latitude != null && b.longitude != null;
                            if (!aHas && !bHas) return a.pharmacy_name.localeCompare(b.pharmacy_name);
                            if (!aHas) return 1;
                            if (!bHas) return -1;
                            const da = haversineKm(userLoc, { lat: a.latitude as number, lng: a.longitude as number });
                            const db = haversineKm(userLoc, { lat: b.latitude as number, lng: b.longitude as number });
                            return da - db;
                        })
                        .map((pharmacy) => {
                            const distKm = userLoc && pharmacy.latitude != null && pharmacy.longitude != null
                                ? haversineKm(userLoc, { lat: pharmacy.latitude, lng: pharmacy.longitude })
                                : null;
                            const formatNumber = (n: number) =>
                                language === "ar" ? n.toLocaleString("ar") : n.toLocaleString();
                            return (
                                <button
                                    key={pharmacy.id}
                                    onClick={() => setSelected(pharmacy)}
                                    className="w-full text-left block p-5 border border-gray-200 rounded bg-white transition hover:shadow-md hover:border-green focus:ring-2 focus:ring-green focus:outline-none cursor-pointer transform hover:-translate-y-0.5"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                        <div className="flex-1">
                                            <div className="text-lg font-semibold text-gray-800">
                                                {pharmacy.pharmacy_name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {pharmacy.governorate} • {pharmacy.area}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {distKm != null && (
                                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                                                    {distKm < 1
                                                        ? `${formatNumber(parseFloat((distKm * 1000).toFixed(0)))} ${language === "ar" ? "م" : "m"}`
                                                        : `${formatNumber(parseFloat(distKm.toFixed(1)))} ${language === "ar" ? "كم" : "km"}`}
                                                </span>
                                            )}
                                            {pharmacy.open_24_hours && (
                                                <span className="text-xs bg-green bg-opacity-20 text-white px-2 py-1 rounded-full font-medium">
                                                    {language === "ar" ? "مفتوح 24 ساعة" : "Open 24 Hours"}
                                                </span>
                                            )}
                                            <span className="text-sm text-green underline">{language === "ar" ? "عرض التفاصيل" : "View details"}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                )}
                {selected && (
                    <PharmacyDetailsModal pharmacy={selected} onClose={() => setSelected(null)} />
                )}
            </div>

            </div>
            <Footer />
        </div>
    );
}
