"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function InactivePage() {
    const supabase = createClient();
    const router = useRouter();

    const handleBackToLogin = async () => {
        // Ensure session is cleared to avoid redirect loop from /login
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 p-6">
            <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Inactive</h1>
                <p className="text-sm text-gray-600 mb-6">
                    Your pharmacy account is currently inactive. Please contact an
                    administrator if you believe this is a mistake.
                </p>
                <button
                    onClick={handleBackToLogin}
                    className="inline-block btn-black px-4 py-2 rounded text-sm cursor-pointer"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}
