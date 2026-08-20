import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { siteContent } from "@/lib/content";
import { getAddOnsByCategory } from "@/lib/addOns";

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
    const byCategory = await getAddOnsByCategory();
    return NextResponse.json({ addOnsByCategory: byCategory });
  } catch (error) {
    console.error("Failed to load add-ons:", error);
    return NextResponse.json({ error: "Failed to load add-ons." }, { status: 500 });
  }
}

type IncomingItem = { id?: string; name?: string; pricePence?: number };

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { categorySlug?: string; items?: IncomingItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const category = siteContent.categories.find((c) => c.slug === body.categorySlug);
  if (!category) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }
  const items = body.items;
  if (!Array.isArray(items) || items.length > 20) {
    return NextResponse.json({ error: "Invalid add-ons list." }, { status: 400 });
  }
  for (const item of items) {
    if (
      typeof item.name !== "string" ||
      !item.name.trim() ||
      typeof item.pricePence !== "number" ||
      !Number.isFinite(item.pricePence) ||
      item.pricePence <= 0
    ) {
      return NextResponse.json(
        { error: "Each add-on needs a name and a price greater than £0." },
        { status: 400 },
      );
    }
  }

  const normalized = items.map((item) => ({
    id: item.id && item.id.trim() ? item.id : randomUUID(),
    name: item.name!.trim(),
    pricePence: Math.round(item.pricePence!),
  }));

  try {
    await getAdminDb().collection("addOns").doc(category.slug).set({
      items: normalized,
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true, items: normalized });
  } catch (error) {
    console.error("Failed to save add-ons:", error);
    return NextResponse.json({ error: "Failed to save add-ons." }, { status: 500 });
  }
}
