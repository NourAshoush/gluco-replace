"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FaSpinner } from "react-icons/fa";
import EditPharmacyModal from "@/components/EditPharmacyModal";
import CreatePharmacyModal from "@/components/CreatePharmacyModal";

export default function PharmaciesPage() {
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState<any | null>(null);
    const [creatingPharmacy, setCreatingPharmacy] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data } = await supabase.from("pharmacies").select("*");
            setPharmacies(data || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-4 relative min-h-[400px]">
            {!selectedPharmacy && !creatingPharmacy && (
                <div>
                    <h1 className="text-2xl font-bold mb-6 text-green">
                        Pharmacies
                    </h1>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <FaSpinner className="animate-spin text-green text-3xl" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pharmacies.map((pharmacy) => (
                                <div
                                    key={pharmacy.id}
                                    className={`flex items-center justify-between border border-gray-200 rounded p-4 shadow-sm ${
                                        pharmacy.active === false
                                            ? "bg-gray-50 opacity-40"
                                            : "bg-white"
                                    }`}
                                >
                                    <div className="flex flex-col flex-1">
                                        <div className="text-lg font-semibold text-gray-800">
                                            {pharmacy.pharmacy_name}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>
                                                {pharmacy.governorate} • {" "}
                                                {pharmacy.area}
                                            </span>
                                            {pharmacy.active === false && (
                                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {pharmacy.open_24_hours && (
                                            <span className="text-xs bg-green bg-opacity-20 text-white px-2 py-1 rounded-full font-medium">
                                                24 Hours
                                            </span>
                                        )}
                                        <button
                                            className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
                                            title="Edit Pharmacy"
                                            onClick={() =>
                                                setSelectedPharmacy(pharmacy)
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-gray-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {selectedPharmacy && (
                <div className="absolute inset-0 bg-white z-40">
                    <EditPharmacyModal
                        pharmacy={selectedPharmacy}
                        onClose={(updated) => {
                            if (updated) {
                                if ((updated as any).__deleted) {
                                    setPharmacies((prev) =>
                                        prev.filter((p) => p.id !== selectedPharmacy.id)
                                    );
                                } else {
                                    setPharmacies((prev) =>
                                        prev.map((p) =>
                                            p.id === updated.id ? updated : p
                                        )
                                    );
                                }
                            }
                            setSelectedPharmacy(null);
                        }}
                    />
                </div>
            )}
            {creatingPharmacy && (
                <div className="absolute inset-0 bg-white z-40">
                    <CreatePharmacyModal
                        onClose={(newPharmacy) => {
                            if (newPharmacy != null) {
                                setPharmacies((prev) => [...prev, newPharmacy]);
                            }
                            setCreatingPharmacy(false);
                        }}
                    />
                </div>
            )}
            <div className="flex mb-4 pt-6 gap-4">
                <button
                    className="btn-green px-4 py-2 text-sm rounded"
                    onClick={() => setCreatingPharmacy(true)}
                >
                    Create Pharmacy
                </button>
            </div>
        </div>
    );
}
