"use client";

import { useState, useEffect } from "react";
import { MdSave, MdClose } from "react-icons/md";
import { createClient } from "@/utils/supabase/client";

const GOVERNORATES = [
    "Capital (Al Asimah)",
    "Hawalli",
    "Farwaniya",
    "Jahra",
    "Ahmadi",
    "Mubarak Al-Kabeer",
];

export default function EditPharmacyModal({
    pharmacy,
    onClose,
}: {
    pharmacy: any;
    onClose: (updatedPharmacy?: any) => void;
}) {
    const supabase = createClient();

    const [pharmacyName, setPharmacyName] = useState(
        pharmacy.pharmacy_name || ""
    );
    const [governorate, setGovernorate] = useState(pharmacy.governorate || "");
    const [area, setArea] = useState(pharmacy.area || "");
    const [open24, setOpen24] = useState(pharmacy.open_24_hours || false);
    const [mapsLink, setMapsLink] = useState(pharmacy.google_maps_link || "");
    const [address, setAddress] = useState(pharmacy.address || "");

    const [isChanged, setIsChanged] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const changed =
            pharmacyName !== pharmacy.pharmacy_name ||
            governorate !== pharmacy.governorate ||
            area !== pharmacy.area ||
            open24 !== pharmacy.open_24_hours ||
            mapsLink !== pharmacy.google_maps_link ||
            address !== pharmacy.address;
        setIsChanged(changed);
    }, [pharmacyName, governorate, area, open24, mapsLink, address]);

    const handleSave = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("pharmacies")
            .update({
                pharmacy_name: pharmacyName,
                governorate,
                area,
                open_24_hours: open24,
                google_maps_link: mapsLink,
                address,
            })
            .eq("id", pharmacy.id)
            .select();
        setLoading(false);
        onClose(data?.[0]);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 relative min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
                </div>
            )}
            <div className="relative min-h-[400px]">
                <h2 className="text-2xl font-bold mb-4 text-green">
                    Edit Pharmacy
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Pharmacy Name
                        </label>
                        <input
                            type="text"
                            value={pharmacyName}
                            onChange={(e) => setPharmacyName(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Governorate
                        </label>
                        <select
                            value={governorate}
                            onChange={(e) => setGovernorate(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                        >
                            <option value="">Select a governorate</option>
                            {GOVERNORATES.map((gov) => (
                                <option key={gov} value={gov}>
                                    {gov}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Area
                        </label>
                        <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={open24}
                                onChange={(e) => setOpen24(e.target.checked)}
                            />
                            Open 24 Hours
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Google Maps Link
                        </label>
                        <input
                            type="text"
                            value={mapsLink}
                            onChange={(e) => setMapsLink(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded resize-none"
                            rows={2}
                        />
                    </div>
                </div>

                <div className="mt-6 flex mb-4 pt-4 gap-4">
                    <button
                        onClick={handleSave}
                        className="btn-green text-sm px-4 py-2 border rounded flex items-center gap-2"
                        disabled={!isChanged}
                        style={{
                            cursor: !isChanged ? "not-allowed" : "pointer",
                            opacity: !isChanged ? 0.5 : 1,
                        }}
                    >
                        <MdSave size={16} />
                        Save Changes
                    </button>

                    <button
                        onClick={() => onClose()}
                        className="btn-black text-sm px-4 py-2 border rounded flex items-center gap-2"
                    >
                        <MdClose size={16} />
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
