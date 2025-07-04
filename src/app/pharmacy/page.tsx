import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import DashboardLayout from "@/components/DashboardLayout";

export default async function PharmacyDashboard() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        // Supabase's `cookies()` is read-only, so we should not set cookies directly here.
                        // Leave a placeholder or integrate with middleware if required.
                    });
                },
            },
        }
    );

    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (!session || error) {
        redirect("/pharmacy/login");
    }

    return (
        <DashboardLayout>
            <DashboardClient />
        </DashboardLayout>
    );
}
