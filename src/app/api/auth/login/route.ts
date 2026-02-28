export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prisma = getPrisma();
        const { role, mobile, email, password } = body;

        // In a real app, verify the password Hash.
        // For Hope Cafe demo, we just simplify. Admin expects generic auth.

        if (role === "ADMIN") {
            // Simplified admin login
            if (password === "admin123" || password === "divyam2026") { // simplistic master password
                await login({ role: "ADMIN", id: "admin-1" });
                return NextResponse.json({ success: true, redirectUrl: "/admin/dashboard" });
            }
            return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });

        } else if (role === "PARTNER") {
            // Find partner by mobile or email
            const partner = (email) ?
                await prisma.partner.findFirst({ where: { email: email } }) :
                await prisma.partner.findUnique({ where: { mobile: mobile } });

            if (!partner) {
                return NextResponse.json({ error: "Partner account not found" }, { status: 404 });
            }

            // Simplified auth logic
            await login({ role: "PARTNER", id: partner.id, partnerCode: partner.partnerCode });
            return NextResponse.json({ success: true, redirectUrl: "/dashboard", partnerCode: partner.partnerCode });
        }

        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });

    } catch (error: any) {
        console.error("Login Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
