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
    const [filterGov, setFilterGov] = useState<string>("All");

    useEffect(() => {
        async function fetchPharmacies() {
            const { data } = await supabase
                .from("pharmacies")
                .select(
                    "id, pharmacy_name, governorate, area, open_24_hours, google_maps_link"
                )
                .order("pharmacy_name", { ascending: true });
            setPharmacies(data || []);
            setLoading(false);
        }
        fetchPharmacies();
    }, [supabase]);

    // Remove the early return — we’ll show the spinner inline below

    return (
        <>
            <MainHeader />
            <div className="max-w-4xl mx-auto p-4 space-y-4">
                <h1 className="text-2xl font-bold text-green">
                    Nearest Pharmacies
                </h1>
                {/* Governorate Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Filter by Governorate
                    </label>
                    <select
                        value={filterGov}
                        onChange={(e) => setFilterGov(e.target.value)}
                        className="mt-1 border border-gray-300 rounded p-2"
                    >
                        <option>All</option>
                        <option>Capital (Al Asimah)</option>
                        <option>Hawalli</option>
                        <option>Farwaniya</option>
                        <option>Jahra</option>
                        <option>Ahmadi</option>
                        <option>Mubarak Al-Kabeer</option>
                    </select>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <FaSpinner className="animate-spin text-green text-4xl" />
                    </div>
                ) : (
                    pharmacies
                        .filter(
                            (p) =>
                                filterGov === "All" || p.governorate === filterGov
                        )
                        .map((pharmacy) => (
                            <div
                                key={pharmacy.id}
                                className="p-4 border border-gray-200 rounded shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white"
                            >
                                <div className="flex-1">
                                    <div className="text-lg font-semibold text-gray-800">
                                        {pharmacy.pharmacy_name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {pharmacy.governorate} &bull;{" "}
                                        {pharmacy.area}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                    {pharmacy.open_24_hours && (
                                        <span className="text-xs bg-green bg-opacity-20 text-green px-2 py-1 rounded-full font-medium">
                                            Open 24 Hours
                                        </span>
                                    )}
                                    <a
                                        href={pharmacy.google_maps_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-black px-3 py-1 text-sm rounded"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        View on Map
                                    </a>
                                </div>
                            </div>
                        ))
                )}
            </div>

            <Footer />
        </>
    );
}
