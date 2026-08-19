import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { siteContent } from "@/lib/content";

// middleware.ts only guards page routes under /admin/:path*, not API routes,
// so every handler here re-checks the session cookie itself.
async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = token ? await verifyAdminSessionToken(token) : false;
  return isValid;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const snapshot = await getAdminDb().collection("servicePrices").get();
    const pricesPence: Record<string, number> = {};
    for (const doc of snapshot.docs) {
      const { pricePence } = doc.data() as { pricePence?: number };
      if (typeof pricePence === "number") pricesPence[doc.id] = pricePence;
    }
    return NextResponse.json({ prices: pricesPence });
  } catch (error) {
    console.error("Failed to list servicePrices:", error);
    return NextResponse.json({ error: "Failed to load prices." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { categorySlug?: string; pricePence?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const category = siteContent.categories.find((c) => c.slug === body.categorySlug);
  if (!category) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }
  if (typeof body.pricePence !== "number" || !Number.isFinite(body.pricePence) || body.pricePence <= 0) {
    return NextResponse.json({ error: "pricePence must be a positive number." }, { status: 400 });
  }

  try {
    await getAdminDb().collection("servicePrices").doc(category.slug).set({
      pricePence: Math.round(body.pricePence),
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to set service price:", error);
    return NextResponse.json({ error: "Failed to save price." }, { status: 500 });
  }
}
