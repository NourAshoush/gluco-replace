"use client";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import LogoutButton from "./LogoutButton";
import Image from "next/image";

export default function MainHeader() {
    const pathname = usePathname();

    const isHomePage = pathname === "/" || pathname === "/pharmacies";
    const isPharmacyDashboard = pathname === "/pharmacy";

    return (
        <>
            {isHomePage && (
                <header className="w-full px-6 py-4 bg-white shadow-md rounded-b-md border border-gray-200">
                    <div className="max-w-6xl mx-auto flex flex-row flex-wrap justify-between items-center gap-2">
                        <div className="text-base sm:text-lg truncate max-w-[200px] sm:max-w-none font-medium">
                            <a href="/" className="flex items-center cursor-pointer">
                                <Image
                                    src="/dexcom_logo.png"
                                    alt="Dexcom Logo"
                                    width={120}
                                    height={40}
                                    priority
                                    draggable={false}
                                />
                            </a>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <LanguageToggle />
                        </div>
                    </div>
                </header>
            )}

            {isPharmacyDashboard && (
                <header className="w-full px-6 py-4 bg-white shadow-md rounded-b-md border border-gray-200">
                    <div className="max-w-6xl mx-auto flex flex-row justify-between items-center">
                        <LanguageToggle />
                        <LogoutButton />
                    </div>
                </header>
            )}
        </>
    );
}
