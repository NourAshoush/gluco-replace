import { requireAdminSession } from "@/utils/auth";

export default async function FormManagerPage() {
    await requireAdminSession();
    return <div></div>;
}