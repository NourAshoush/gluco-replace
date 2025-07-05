import { requireAdminSession } from "@/utils/auth";

export default async function PharmaciesPage() {
    await requireAdminSession();
    return <div></div>;
}