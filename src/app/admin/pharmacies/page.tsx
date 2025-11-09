"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FaSpinner } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
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
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-green">Pharmacies</h1>
                        <button
                            className="btn-green px-4 py-2 text-sm rounded flex items-center gap-2"
                            onClick={() => setCreatingPharmacy(true)}
                        >
                            <MdAdd size={18} /> Create Pharmacy
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <FaSpinner className="animate-spin text-green text-3xl" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[...pharmacies]
                                .sort((a, b) => {
                                    const aInactive = a.active === false;
                                    const bInactive = b.active === false;
                                    if (aInactive !== bInactive) return aInactive ? 1 : -1;
                                    return String(a.pharmacy_name || "").localeCompare(
                                        String(b.pharmacy_name || "")
                                    );
                                })
                                .map((pharmacy) => (
                                <div
                                    key={pharmacy.id}
                                    onClick={() => setSelectedPharmacy(pharmacy)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            setSelectedPharmacy(pharmacy);
                                        }
                                    }}
                                    className={`cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-md hover:border-green flex items-center justify-between border border-gray-200 rounded p-4 shadow-sm ${
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
            
        </div>
    );
}
