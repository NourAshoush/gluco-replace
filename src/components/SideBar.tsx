"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FiMenu, FiHome, FiClipboard, FiAlertCircle, FiUsers, FiHash } from "react-icons/fi";
import LogoutButton from "./LogoutButton";

const links = [
    { href: "/admin", label: "Dashboard", icon: <FiHome className="text-green mr-3 text-xl" /> },
    { href: "/admin/form-manager", label: "Form Manager", icon: <FiClipboard className="text-green mr-3 text-xl" /> },
    { href: "/admin/complaints", label: "Complaints", icon: <FiAlertCircle className="text-green mr-3 text-xl" /> },
    { href: "/admin/pharmacies", label: "Pharmacies", icon: <FiUsers className="text-green mr-3 text-xl" /> },
    { href: "/admin/serial-numbers", label: "Serial Numbers", icon: <FiHash className="text-green mr-3 text-xl" /> },
];

export default function SideBar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile menu toggle button */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button onClick={() => setOpen(!open)} className="bg-white shadow-md p-2 rounded">
                    <FiMenu className="text-2xl" />
                </button>
            </div>

            {/* Mobile dropdown menu */}
            {open && (
                <div className="md:hidden absolute top-16 right-4 w-56 bg-white rounded-md shadow-lg z-50">
                    <div className="flex flex-col divide-y divide-gray-200">
                        {links.map(({ href, label, icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-4 py-3 transition duration-200 ease-in-out ${
                                    pathname === href
                                        ? "bg-green-100 text-green font-semibold hover:bg-green-200"
                                        : "text-black hover:bg-gray-100"
                                }`}
                                onClick={() => setOpen(false)}
                            >
                                {icon}
                                <span className="font-medium text-base">{label}</span>
                            </Link>
                        ))}
                        <div className="px-4 py-3">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar (desktop only) */}
            <div
                className="hidden md:block fixed inset-0 md:relative md:inset-auto w-full md:w-64 bg-white text-black min-h-screen p-4 z-50 shadow-md"
            >
                <div className="flex flex-col justify-center items-center h-full space-y-4">
                    {links.map(({ href, label, icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`w-full flex items-center justify-start text-left gap-3 px-4 py-3 rounded transition duration-200 ease-in-out ${
                                pathname === href
                                    ? "bg-green-100 text-green font-semibold hover:bg-green-200"
                                    : "text-black hover:bg-gray-100"
                            }`}
                        >
                            {icon}
                            <span className="font-medium text-base">{label}</span>
                        </Link>
                    ))}
                    <div className="mt-4 w-full flex justify-center">
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </>
    );
}