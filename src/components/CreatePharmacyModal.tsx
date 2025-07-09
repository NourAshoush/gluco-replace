import React, { useState } from "react";
import { MdSave, MdClose } from "react-icons/md";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface CreatePharmacyModalProps {
    onClose: (newPharmacy?: any) => void;
}

const CreatePharmacyModal: React.FC<CreatePharmacyModalProps> = ({
    onClose,
}) => {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [pharmacyName, setPharmacyName] = useState("");
    const [governorate, setGovernorate] = useState("");
    const [area, setArea] = useState("");
    const [open24Hours, setOpen24Hours] = useState(false);
    const [googleMapsLink, setGoogleMapsLink] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    const EMAIL_SUFFIX = "@test.com"; // TODO: Replace with your actual email suffix

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

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: `${username}${EMAIL_SUFFIX}`,
            password,
        });

        if (authError || !authData.user) {
            console.error("Auth error:", authError);
            setLoading(false);
            return;
        }

        // Insert into profiles table
        const { error: profileError } = await supabase.from("profiles").insert([
            {
                id: authData.user.id,
                role: "pharmacy",
            },
        ]);

        if (profileError) {
            console.error("Profile insert error:", profileError);
            setLoading(false);
            return;
        }

        const { data: pharmacyData, error: pharmacyError } = await supabase
            .from("pharmacies")
            .insert([
                {
                    pharmacy_name: pharmacyName,
                    governorate,
                    area,
                    open_24_hours: open24Hours,
                    google_maps_link: googleMapsLink,
                    address,
                    pharmacy_account: authData.user.id,
                },
            ])
            .select();

        if (pharmacyError) {
            console.error("Pharmacy insert error:", pharmacyError);
            setLoading(false);
            return;
        }

        setLoading(false);
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="max-w-4xl mx-auto p-4 relative min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4 text-green">
                Create Pharmacy
            </h2>
            <div className="space-y-4">
                <h3 className="text-gray-600 font-semibold text-lg mb-2">
                    Account Details
                </h3>
                <div>
                    <label className="block font-medium" htmlFor="username">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block font-medium" htmlFor="password">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
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
                    <label className="block font-medium" htmlFor="pharmacyName">
                        Pharmacy Name
                    </label>
                    <input
                        type="text"
                        id="pharmacyName"
                        value={pharmacyName}
                        onChange={(e) => setPharmacyName(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block font-medium" htmlFor="governorate">
                        Governorate
                    </label>
                    <select
                        id="governorate"
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
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
                    <label className="block font-medium" htmlFor="area">
                        Area
                    </label>
                    <input
                        type="text"
                        id="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="open24Hours"
                        checked={open24Hours}
                        onChange={(e) => setOpen24Hours(e.target.checked)}
                    />
                    <label htmlFor="open24Hours" className="font-medium">
                        Open 24 Hours
                    </label>
                </div>

                <div>
                    <label
                        className="block font-medium"
                        htmlFor="googleMapsLink"
                    >
                        Google Maps Link
                    </label>
                    <input
                        type="text"
                        id="googleMapsLink"
                        value={googleMapsLink}
                        onChange={(e) => setGoogleMapsLink(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block font-medium" htmlFor="address">
                        Address
                    </label>
                    <textarea
                        id="address"
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded resize-none"
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
                    Save
                </button>
                <button
                    type="button"
                    className="btn-black px-4 py-2 text-sm rounded flex items-center gap-2"
                    onClick={() => onClose()}
                >
                    <MdClose />
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CreatePharmacyModal;
