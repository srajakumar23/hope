import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

/**
 * Admin triggers batch payout settlement.
 * For each partner, it finds SETTLED scan logs that haven't been PAID,
 * sums them up, creates a Payout record, and marks the logs as PAID.
 */
export async function POST(req: Request) {
    try {
        const prisma = getPrisma();

        // 1. Fetch all partners
        const partners = await prisma.partner.findMany();
        const results = [];

        for (const partner of partners) {
            // 2. Fetch all guests for this partner
            const guests = await prisma.guest.findMany({
                where: { partnerId: partner.id }
            });
            const guestIds = guests.map((g: any) => g.id);

            if (guestIds.length === 0) continue;

            // 3. Fetch all settled but unpaid logs for these guests
            const unpaidLogs = await prisma.scanLog.findMany({
                where: {
                    guestId: { in: guestIds },
                    status: "SETTLED"
                }
            });

            if (unpaidLogs.length === 0) continue;

            // 4. Calculate total commission to pay
            const totalAmount = unpaidLogs.reduce((acc: number, log: any) =>
                acc + (log.partnerCommissionAmount || log.discountAmount || 0), 0
            );

            if (totalAmount <= 0) continue;

            // 5. Create Payout record
            const payout = await prisma.payout.create({
                data: {
                    partnerId: partner.id,
                    amount: totalAmount,
                    status: "COMPLETED",
                    method: "BANK_TRANSFER", // Mock method
                    logsCount: unpaidLogs.length
                }
            });

            // 6. Mark logs as PAID
            const logIds = unpaidLogs.map((l: any) => l.id);
            await prisma.scanLog.updateMany({
                where: { id: { in: logIds } },
                data: { status: "PAID" }
            });

            results.push({
                partnerName: partner.name,
                amount: totalAmount,
                payoutId: payout.id,
                logsProcessed: unpaidLogs.length
            });
        }

        return NextResponse.json({
            success: true,
            message: `Processed payouts for ${results.length} partners.`,
            details: results
        });

    } catch (error: any) {
        console.error("Batch Payout Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
