import { requireAdminSession } from "@/utils/auth";

export default async function SerialNumbersPage() {
    await requireAdminSession();
    return <div></div>;
}