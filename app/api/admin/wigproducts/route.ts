import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { WIG_PRODUCT_IDS, WigVariant } from "@/lib/wigProducts";
import { getWigProducts } from "@/lib/wigProductsServer";

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
    const products = await getWigProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to load wig products:", error);
    return NextResponse.json({ error: "Failed to load wig products." }, { status: 500 });
  }
}

type IncomingVariant = { id?: string; length?: string; texture?: string; lace?: string; pricePence?: number };

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { id?: string; name?: string; description?: string; variants?: IncomingVariant[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.id || !WIG_PRODUCT_IDS.includes(body.id)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const variants = body.variants;
  if (!Array.isArray(variants) || variants.length > 100) {
    return NextResponse.json({ error: "Invalid variant list." }, { status: 400 });
  }
  for (const v of variants) {
    if (
      typeof v.length !== "string" ||
      !v.length.trim() ||
      typeof v.texture !== "string" ||
      !v.texture.trim() ||
      typeof v.lace !== "string" ||
      !v.lace.trim() ||
      typeof v.pricePence !== "number" ||
      !Number.isFinite(v.pricePence) ||
      v.pricePence <= 0
    ) {
      return NextResponse.json(
        { error: "Each variant needs a length, texture, lace, and a price greater than £0." },
        { status: 400 },
      );
    }
  }

  const normalizedVariants: WigVariant[] = variants.map((v) => ({
    id: v.id && v.id.trim() ? v.id : randomUUID(),
    length: v.length!.trim(),
    texture: v.texture!.trim(),
    lace: v.lace!.trim(),
    pricePence: Math.round(v.pricePence!),
  }));

  try {
    await getAdminDb().collection("wigProducts").doc(body.id).set(
      {
        name: body.name.trim(),
        description: (body.description ?? "").trim(),
        variants: normalizedVariants,
        updatedAt: new Date(),
      },
      { merge: true },
    );
    return NextResponse.json({ ok: true, variants: normalizedVariants });
  } catch (error) {
    console.error("Failed to save wig product:", error);
    return NextResponse.json({ error: "Failed to save wig product." }, { status: 500 });
  }
}
