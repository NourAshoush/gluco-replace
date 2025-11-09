"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FaSpinner } from "react-icons/fa";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";

interface Pharmacy {
    id: number;
    pharmacy_name: string;
    governorate: string;
    area: string;
    open_24_hours: boolean;
    google_maps_link: string;
}

export default function PharmaciesPage() {
    const supabase = createClientComponentClient();
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPharmacies() {
            const { data } = await supabase
                .from("pharmacies")
                .select(
                    "id, pharmacy_name, governorate, area, open_24_hours, google_maps_link"
                )
                .eq("active", true)
                .order("pharmacy_name", { ascending: true });
            setPharmacies(data || []);
            setLoading(false);
        }
        fetchPharmacies();
    }, [supabase]);

    // Remove the early return — we’ll show the spinner inline below

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="flex-grow">
                <MainHeader />
                <div className="max-w-4xl mx-auto p-4 space-y-4">
                <h1 className="text-2xl font-bold text-green">
                    Nearest Pharmacies
                </h1>
                
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <FaSpinner className="animate-spin text-green text-4xl" />
                    </div>
                ) : (
                    pharmacies.map((pharmacy) => (
                        <a
                            key={pharmacy.id}
                            href={pharmacy.google_maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${pharmacy.pharmacy_name} on Google Maps`}
                            className="block p-4 border border-gray-200 rounded shadow-sm bg-white transition hover:shadow-md hover:border-green focus:ring-2 focus:ring-green focus:outline-none"
                        >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <div className="flex-1">
                                    <div className="text-lg font-semibold text-gray-800">
                                        {pharmacy.pharmacy_name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {pharmacy.governorate} &bull; {pharmacy.area}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {pharmacy.open_24_hours && (
                                        <span className="text-xs bg-green bg-opacity-20 text-white px-2 py-1 rounded-full font-medium">
                                            Open 24 Hours
                                        </span>
                                    )}
                                    <span className="text-sm text-green underline">Open in Maps ↗</span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>

            </div>
            <Footer />
        </div>
    );
}
