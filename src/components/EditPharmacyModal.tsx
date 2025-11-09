"use client";

import { useState, useEffect } from "react";
import { MdSave, MdDelete } from "react-icons/md";
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
    const [open24, setOpen24] = useState<boolean>(pharmacy.open_24_hours || false);
    const [mapsLink, setMapsLink] = useState(pharmacy.google_maps_link || "");
    const [address, setAddress] = useState(pharmacy.address || "");
    const [active, setActive] = useState<boolean>(
        typeof pharmacy.active === "boolean" ? pharmacy.active : true
    );

    const [isChanged, setIsChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        const changed =
            pharmacyName !== pharmacy.pharmacy_name ||
            governorate !== pharmacy.governorate ||
            area !== pharmacy.area ||
            open24 !== pharmacy.open_24_hours ||
            mapsLink !== pharmacy.google_maps_link ||
            address !== pharmacy.address ||
            active !== (typeof pharmacy.active === "boolean" ? pharmacy.active : true);
        setIsChanged(changed);
    }, [pharmacyName, governorate, area, open24, mapsLink, address, active]);

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
                active,
            })
            .eq("id", pharmacy.id)
            .select();
        setLoading(false);
        onClose(data?.[0]);
    };

    const handleDelete = async () => {
        setDeleteError(null);
        setDeleting(true);
        try {
            const res = await fetch("/api/admin/delete-pharmacy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pharmacyId: pharmacy.id }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || "Delete failed");
            }
            setDeleting(false);
            setConfirmOpen(false);
            // Refresh the page so the deleted pharmacy is no longer listed
            if (typeof window !== "undefined") {
                window.location.reload();
                return;
            }
            onClose({ id: pharmacy.id, __deleted: true } as any);
        } catch (e: any) {
            setDeleting(false);
            setDeleteError(e?.message || "Failed to delete pharmacy");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 relative min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
                </div>
            )}
            <div className="relative min-h-[400px]">
                {/* Title + actions */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-green">Edit Pharmacy</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            className="btn-green text-sm px-4 py-2 border rounded flex items-center gap-2"
                            disabled={!isChanged}
                            style={{
                                cursor: !isChanged ? "not-allowed" : "pointer",
                                opacity: !isChanged ? 0.5 : 1,
                            }}
                            title={isChanged ? "Save changes" : "No changes to save"}
                        >
                            <MdSave size={16} />
                            Save
                        </button>
                        <button
                            onClick={() => onClose()}
                            className="btn-black text-sm px-4 py-2 border rounded"
                            title="Close"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-wide text-gray-500">
                            Pharmacy Name
                        </label>
                        <input
                            type="text"
                            value={pharmacyName}
                            onChange={(e) => setPharmacyName(e.target.value)}
                            className="w-full mt-1 p-3 border border-gray-300 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wide text-gray-500">
                            Governorate
                        </label>
                        <select
                            value={governorate}
                            onChange={(e) => setGovernorate(e.target.value)}
                            className="w-full mt-1 p-3 border border-gray-300 rounded"
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
                        <label className="block text-xs uppercase tracking-wide text-gray-500">
                            Area
                        </label>
                        <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="w-full mt-1 p-3 border border-gray-300 rounded"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500">Open 24 Hours</div>
                                <p className="text-xs text-gray-500">Toggle the 24-hour badge for this pharmacy.</p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={open24}
                                onClick={() => setOpen24((v: boolean) => !v)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    open24
                                        ? "bg-green-500 focus:ring-green-500"
                                        : "bg-gray-300 focus:ring-gray-400"
                                }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                        open24 ? "translate-x-5" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    

                    <div>
                        <label className="block text-xs uppercase tracking-wide text-gray-500">
                            Google Maps Link
                        </label>
                        <input
                            type="text"
                            value={mapsLink}
                            onChange={(e) => setMapsLink(e.target.value)}
                            className="w-full mt-1 p-3 border border-gray-300 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wide text-gray-500">
                            Address
                        </label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full mt-1 p-3 border border-gray-300 rounded resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Danger zone */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-xs uppercase tracking-wide text-gray-500">
                                Active (public visibility)
                            </div>
                            <p className="text-xs text-gray-500">Toggle visibility without deleting data or the user account.</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={active}
                            onClick={() => setActive((v: boolean) => !v)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                active
                                    ? "bg-green-500 focus:ring-green-500"
                                    : "bg-gray-300 focus:ring-gray-400"
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                    active ? "translate-x-5" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Danger zone */}
                <div className="mt-10 pt-6 pb-12 border-t-2 border-red-200">
                    <div className="text-sm font-semibold text-red-700 mb-3 uppercase tracking-wide">Danger Zone</div>
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="w-full sm:w-auto text-sm px-4 py-2 rounded border border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2 cursor-pointer transition"
                    >
                        <MdDelete size={16} /> Delete Pharmacy Account
                    </button>
                </div>

                {confirmOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black bg-opacity-30"
                            onClick={() => (!deleting ? setConfirmOpen(false) : null)}
                        />
                        <div
                            role="dialog"
                            aria-modal="true"
                            className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 md:p-7 z-10 border border-gray-100"
                        >
                            <h3 className="text-xl font-semibold text-red-700 mb-3">
                                Delete this pharmacy account?
                            </h3>
                            <p className="text-sm text-gray-700 mb-5 text-left">
                                This removes the pharmacy account and its associated data. Complaint records remain, but the associated pharmacy will be marked as deleted. After deletion, this pharmacy disappears from the list.
                            </p>
                            {deleteError && (
                                <div className="text-sm text-red-600 mb-4">
                                    {deleteError}
                                </div>
                            )}
                            <div className="flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => setConfirmOpen(false)}
                                    disabled={deleting}
                                    className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                                >
                                    <MdDelete size={16} />
                                    {deleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
