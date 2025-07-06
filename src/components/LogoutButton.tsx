"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

export default function LogoutButton() {
    const router = useRouter();
    const supabase = createClient();
    const { language } = useLanguage();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 border rounded btn-red"
        >
            {language === "ar" ? "تسجيل الخروج" : "Logout"}
        </button>
    );
}
