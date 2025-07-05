"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import LogoutButton from "./LogoutButton";

const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/form-manager", label: "Form Manager" },
    { href: "/admin/complaints", label: "Complaints" },
    { href: "/admin/pharmacies", label: "Pharmacies" },
    { href: "/admin/serial-numbers", label: "Serial Numbers" },
];

export default function SideBar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile header */}
            <div className="md:hidden flex items-center justify-between bg-white p-4 shadow">
                <button onClick={() => setOpen(!open)}>
                    <FiMenu className="text-2xl" />
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`${
                    open ? "block" : "hidden"
                } md:block w-full md:w-64 bg-gray-100 text-black min-h-screen p-4 fixed md:relative z-50`}
            >
                <div className="flex flex-col justify-center items-center h-full space-y-4">
                    {links.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`w-full block px-4 py-2 text-center rounded transition duration-200 ease-in-out hover:bg-gray-200 ${
                                pathname === href ? "bg-gray-300 font-bold" : ""
                            }`}
                        >
                            {label}
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