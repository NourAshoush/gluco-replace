"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const EMAIL_SUFFIX = "@test.com"; // TODO: Replace with actual suffix

export default function PharmacyLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const email = `${username}${EMAIL_SUFFIX}`;

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            setError("");
            router.push("/pharmacy");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white text-black">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm p-6 space-y-4 border rounded shadow"
            >
                <h2 className="text-2xl font-bold mb-4">Pharmacy Login</h2>
                {error && <p className="text-red-600">{error}</p>}
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 border rounded"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Log In
                </button>
            </form>
        </div>
    );
}
