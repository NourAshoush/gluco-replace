import { requireAdminSession } from "@/utils/auth";
import AdminDashboardPage from "./dashboard/page";

export default async function AdminPage() {
    await requireAdminSession();
    return <AdminDashboardPage />;
}
