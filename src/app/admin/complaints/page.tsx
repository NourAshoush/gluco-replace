import { requireAdminSession } from "@/utils/auth";

export default async function ComplaintsPage() {
    await requireAdminSession();
    return <div></div>;
}