import SideBar from "@/components/SideBar";
import RouteLoader from "@/components/RouteLoader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <SideBar />
            <RouteLoader />
            <main className="flex-1 p-6 ml-0 md:ml-64">
                {children}
            </main>
        </div>
    );
}