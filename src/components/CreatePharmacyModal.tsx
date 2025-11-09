import React, { useState } from "react";
import { MdSave } from "react-icons/md";
import { createClient } from "@/utils/supabase/client";

interface CreatePharmacyModalProps {
    onClose: (newPharmacy?: any) => void;
}

const CreatePharmacyModal: React.FC<CreatePharmacyModalProps> = ({
    onClose,
}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [pharmacyName, setPharmacyName] = useState("");
    const [governorate, setGovernorate] = useState("");
    const [area, setArea] = useState("");
    const [open24Hours, setOpen24Hours] = useState(false);
    const [googleMapsLink, setGoogleMapsLink] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    const EMAIL_SUFFIX = "@patientsupportdexcom.com"; // TODO: Replace with your actual email suffix

    const supabase = createClient();
    const isFormValid =
        username &&
        password.length >= 6 &&
        pharmacyName &&
        governorate &&
        area &&
        googleMapsLink;

    const handleCreatePharmacy = async () => {
        if (!username || !password) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/create-pharmacy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: `${username}${EMAIL_SUFFIX}`,
                    password,
                    pharmacy_name: pharmacyName,
                    governorate,
                    area,
                    open_24_hours: open24Hours,
                    google_maps_link: googleMapsLink,
                    address,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error("Create pharmacy failed:", body?.error || res.statusText);
                setLoading(false);
                return;
            }
            const { pharmacy } = await res.json();
            setLoading(false);
            onClose(pharmacy);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 relative min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4 text-green">Create Pharmacy</h2>
            <div className="space-y-4">
                <h3 className="text-gray-600 font-semibold text-lg mb-2">
                    Account Details
                </h3>
                <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500" htmlFor="username">
                        Username <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full mt-1 p-3 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500" htmlFor="password">
                        Password <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 p-3 border border-gray-300 rounded"
                    />
                    {password && password.length < 6 && (
                        <span className="text-sm text-red-500">
                            Password must be at least 6 characters long.
                        </span>
                    )}
                </div>

                <h3 className="text-gray-600 font-semibold text-lg mt-6 mb-2">
                    Pharmacy Details
                </h3>
                <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500" htmlFor="pharmacyName">
                        Pharmacy Name <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        id="pharmacyName"
                        value={pharmacyName}
                        onChange={(e) => setPharmacyName(e.target.value)}
                        className="w-full mt-1 p-3 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500" htmlFor="governorate">
                        Governorate <span className="text-red-600">*</span>
                    </label>
                    <select
                        id="governorate"
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        className="w-full mt-1 p-3 border border-gray-300 rounded"
                    >
                        <option value="">Select Governorate</option>
                        <option value="Al Asimah">Al Asimah</option>
                        <option value="Hawalli">Hawalli</option>
                        <option value="Farwaniya">Farwaniya</option>
                        <option value="Ahmadi">Ahmadi</option>
                        <option value="Mubarak Al-Kabeer">
                            Mubarak Al-Kabeer
                        </option>
                        <option value="Jahra">Jahra</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500" htmlFor="area">
                        Area <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        id="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full mt-1 p-3 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Open 24 Hours</div>
                            <p className="text-xs text-gray-500">
                                Toggle the 24-hour badge for this pharmacy.
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={open24Hours}
                            onClick={() => setOpen24Hours((v) => !v)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                open24Hours
                                    ? "bg-green-500 focus:ring-green-500"
                                    : "bg-gray-300 focus:ring-gray-400"
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                    open24Hours ? "translate-x-5" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500" htmlFor="googleMapsLink">
                        Google Maps Link <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        id="googleMapsLink"
                        value={googleMapsLink}
                        onChange={(e) => setGoogleMapsLink(e.target.value)}
                        className="w-full mt-1 p-3 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500" htmlFor="address">
                        Address
                    </label>
                    <textarea
                        id="address"
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full mt-1 p-3 border border-gray-300 rounded resize-none"
                    />
                </div>
            </div>

            <div className="mt-6 flex mb-4 pt-4 gap-4">
                <button
                    type="button"
                    className="btn-green px-4 py-2 text-sm rounded flex items-center gap-2"
                    onClick={handleCreatePharmacy}
                    disabled={!isFormValid}
                    style={{
                        cursor: !isFormValid ? "not-allowed" : "pointer",
                        opacity: !isFormValid ? 0.5 : 1,
                    }}
                >
                    <MdSave />
                    Create
                </button>
                <button
                    type="button"
                    className="btn-black px-4 py-2 text-sm rounded"
                    onClick={() => onClose()}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CreatePharmacyModal;
