import { requireAdminSession } from "@/utils/auth";
import ResponsesTable from "@/components/ResponsesTable";

export default async function ComplaintsPage() {
    await requireAdminSession();
    
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-green">Complaints</h1>
            <ResponsesTable />
        </div>
    );
}