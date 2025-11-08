import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var");
            return NextResponse.json(
                { error: "Server is missing service role key" },
                { status: 500 }
            );
        }
        const { pharmacyId } = await request.json();
        if (!pharmacyId) {
            return NextResponse.json(
                { error: "pharmacyId is required" },
                { status: 400 }
            );
        }

        // Verify caller is an authenticated admin using session cookies
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll() {},
                },
            }
        );

        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch pharmacy to get the associated auth user id
        const { data: pharmacy, error: fetchError } = await supabaseAdmin
            .from("pharmacies")
            .select("id, pharmacy_account")
            .eq("id", pharmacyId)
            .single();

        if (fetchError || !pharmacy) {
            console.error("Fetch pharmacy failed", fetchError);
            return NextResponse.json(
                { error: "Pharmacy not found" },
                { status: 404 }
            );
        }

        // Soft-delete: mark pharmacy inactive only
        const { error: deactivateError } = await supabaseAdmin
            .from("pharmacies")
            .update({ active: false })
            .eq("id", pharmacyId);
        if (deactivateError) {
            console.error("Deactivate pharmacy failed", deactivateError);
            return NextResponse.json(
                { error: `Failed to deactivate pharmacy: ${deactivateError.message}` },
                { status: 500 }
            );
        }

        // Delete the auth user (if one exists)
        if (pharmacy.pharmacy_account) {
            const { error: deleteUserError } =
                await supabaseAdmin.auth.admin.deleteUser(
                    pharmacy.pharmacy_account
                );
            if (deleteUserError) {
                console.error("Delete auth user failed", deleteUserError);
                return NextResponse.json(
                    { error: `Failed to delete auth user: ${deleteUserError.message}` },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Unhandled error in delete-pharmacy", e);
        return NextResponse.json(
            { error: e?.message ?? "Unexpected error" },
            { status: 500 }
        );
    }
}
