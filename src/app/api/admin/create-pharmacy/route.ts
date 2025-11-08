import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json(
                { error: "Server is missing service role key" },
                { status: 500 }
            );
        }

        const body = await request.json();
        const {
            email,
            password,
            pharmacy_name,
            governorate,
            area,
            open_24_hours,
            google_maps_link,
            address,
        } = body || {};

        if (!email || !password || !pharmacy_name || !governorate || !area || !google_maps_link) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

        // Create auth user
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (createError || !created.user) {
            return NextResponse.json(
                { error: createError?.message || "Failed to create user" },
                { status: 500 }
            );
        }

        const newUserId = created.user.id;

        // Insert profile
        const { error: profileInsertError } = await supabaseAdmin
            .from("profiles")
            .insert([{ id: newUserId, role: "pharmacy" }]);
        if (profileInsertError) {
            // Cleanup
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
            return NextResponse.json(
                { error: profileInsertError.message },
                { status: 500 }
            );
        }

        // Insert pharmacy
        const { data: pharmacyRows, error: pharmacyInsertError } = await supabaseAdmin
            .from("pharmacies")
            .insert([
                {
                    pharmacy_name,
                    governorate,
                    area,
                    open_24_hours: !!open_24_hours,
                    google_maps_link,
                    address: address ?? "",
                    pharmacy_account: newUserId,
                    active: true,
                },
            ])
            .select();
        if (pharmacyInsertError || !pharmacyRows?.[0]) {
            // Cleanup
            await supabaseAdmin.from("profiles").delete().eq("id", newUserId);
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
            return NextResponse.json(
                { error: pharmacyInsertError?.message || "Failed to create pharmacy" },
                { status: 500 }
            );
        }

        return NextResponse.json({ pharmacy: pharmacyRows[0] });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message ?? "Unexpected error" },
            { status: 500 }
        );
    }
}

