import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // This syncs the session from the browser to server cookies
    await createMiddlewareClient({ req, res }).auth.getSession();

    return res;
}

export const config = {
    matcher: ["/pharmacy/dashboard", "/admin/dashboard"], // or "/((?!_next|favicon.ico).*)"
};