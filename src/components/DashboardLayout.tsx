import { ReactNode } from "react";
import DashboardHeader from "./DashboardHeader";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
            <DashboardHeader />
            <main className="flex-grow px-6 py-8 w-full">
                {children}
            </main>
        </div>
    );
}
