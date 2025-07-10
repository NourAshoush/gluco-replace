"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const EMAIL_SUFFIX = "@patientsupportdexcom.com"; // TODO: Replace with actual suffix

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .single();

                if (profile?.role === "admin") {
                    router.push("/admin");
                    return;
                } else if (profile?.role === "pharmacy") {
                    router.push("/pharmacy");
                    return;
                }
            }

            setLoading(false);
        };

        checkSession();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError("Please enter both username and password.");
            return;
        }

        setLoading(true);

        const email = `${username}${EMAIL_SUFFIX}`;

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) {
            setError(loginError.message);
            setLoading(false);
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

        if (profileError || !profile) {
            setError("Unable to determine user role.");
            setLoading(false);
            return;
        }

        if (profile.role === "admin") {
            router.push("/admin");
        } else if (profile.role === "pharmacy") {
            router.push("/pharmacy");
        } else {
            setError("Unauthorised user role.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-white text-black">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
                </div>
            )}
            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm p-6 space-y-4 bg-white shadow-xl rounded-lg"
            >
                <h2 className="text-2xl font-bold mb-4 text-green text-center">Login</h2>
                {error && <p className="text-red-600">{error}</p>}
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 border rounded"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value.replace(/\s/g, ""))
                    }
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
                    className="w-full text-white py-2 px-4 rounded btn-green"
                >
                    Log In
                </button>
            </form>
        </div>
    );
}