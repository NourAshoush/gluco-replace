"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import LanguageToggle from "./LanguageToggle";
import LogoutButton from "./LogoutButton";

export default function DashboardHeader() {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: pharmacyData } = await supabase
                    .from("pharmacies")
                    .select("pharmacy_name")
                    .eq("pharmacy_account", user.id)
                    .single();

                setUserEmail(pharmacyData?.pharmacy_name || user.email || null);
            }
        };
        fetchUser();
    }, []);

    const getHeaderText = () => {
        if (!pathname) return "Loading...";
        switch (pathname) {
            case "/":
                return "Form Page";
            case "/admin":
                return "Admin Dashboard";
            case "/pharmacy":
                return userEmail || "Pharmacy Dashboard";
            default:
                return "Dashboard";
        }
    };

    const getShowLogoutButton = () => {
        return pathname === "/pharmacy" || pathname === "/admin";
    };

    return (
        <header className="w-full px-6 py-4 bg-white shadow-md">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <div className="text-base sm:text-lg truncate max-w-[200px] sm:max-w-none font-medium">
                    {getHeaderText()}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <LanguageToggle />
                    {getShowLogoutButton() && <LogoutButton />}
                </div>
            </div>
        </header>
    );
}
