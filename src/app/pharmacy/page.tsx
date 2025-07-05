import PharmacyView from "./PharmacyView";
import { requirePharmacySession } from "@/utils/auth";

export default async function PharmacyDashboard() {
    await requirePharmacySession();
    return <PharmacyView />;
}
