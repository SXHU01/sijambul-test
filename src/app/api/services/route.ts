import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

// GET /api/services - list all active service items (public)
// Auto-seed jika database kosong (untuk production Vercel yang baru di-deploy)
export async function GET() {
  try {
    let services = await db.serviceItem.findMany({
      where: { isActive: true },
      orderBy: { priceFrom: "asc" },
    });

    // Auto-seed jika kosong (terjadi saat fresh deploy ke Vercel)
    if (services.length === 0) {
      console.log("[SERVICES] DB kosong, triggering auto-seed...");
      try {
        await seedDatabase();
        services = await db.serviceItem.findMany({
          where: { isActive: true },
          orderBy: { priceFrom: "asc" },
        });
        console.log(`[SERVICES] Auto-seed done, ${services.length} services available`);
      } catch (e) {
        console.error("[SERVICES] Auto-seed failed:", e);
      }
    }

    return NextResponse.json({ ok: true, data: services });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
