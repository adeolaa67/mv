import { randomUUID } from "crypto";
import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { PRODUCT_CATEGORIES, ProductCategorySlug, WigVariant, WigTexture } from "@/lib/wigProducts";
import { createWigProduct, deleteWigProduct, getWigProduct, getWigProducts } from "@/lib/wigProductsServer";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = token ? await verifyAdminSessionToken(token) : false;
  return isValid;
}

function isValidCategory(value: unknown): value is ProductCategorySlug {
  return typeof value === "string" && PRODUCT_CATEGORIES.some((c) => c.slug === value);
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

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { category?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isValidCategory(body.category)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  try {
    const product = await createWigProduct(body.category);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}

type IncomingVariant = { id?: string; length?: string; lace?: string; pricePence?: number };
type IncomingTexture = { id?: string; name?: string; extraPricePence?: number };

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: {
    id?: string;
    name?: string;
    description?: string;
    variants?: IncomingVariant[];
    textures?: IncomingTexture[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }
  const existing = await getWigProduct(body.id);
  if (!existing) {
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
    // Length and lace are each optional — a product may only vary by one of
    // them, or by neither — only the price is ever mandatory.
    if (typeof v.pricePence !== "number" || !Number.isFinite(v.pricePence) || v.pricePence <= 0) {
      return NextResponse.json(
        { error: "Each variant needs a price greater than £0." },
        { status: 400 },
      );
    }
  }

  const textures = body.textures ?? [];
  if (!Array.isArray(textures) || textures.length > 50) {
    return NextResponse.json({ error: "Invalid texture list." }, { status: 400 });
  }
  for (const t of textures) {
    if (typeof t.name !== "string" || !t.name.trim()) {
      return NextResponse.json({ error: "Each texture needs a name." }, { status: 400 });
    }
    // The extra price is optional — a texture with no charge should be sent
    // as 0, never required to be a positive amount.
    if (typeof t.extraPricePence !== "number" || !Number.isFinite(t.extraPricePence) || t.extraPricePence < 0) {
      return NextResponse.json(
        { error: `"${t.name.trim()}" has an invalid extra price.` },
        { status: 400 },
      );
    }
  }

  const normalizedVariants: WigVariant[] = variants.map((v) => ({
    id: v.id && v.id.trim() ? v.id : randomUUID(),
    length: (v.length ?? "").trim(),
    lace: (v.lace ?? "").trim(),
    pricePence: Math.round(v.pricePence!),
  }));

  const normalizedTextures: WigTexture[] = textures.map((t) => ({
    id: t.id && t.id.trim() ? t.id : randomUUID(),
    name: t.name!.trim(),
    extraPricePence: Math.round(t.extraPricePence!),
  }));

  try {
    await getAdminDb().collection("wigProducts").doc(body.id).set(
      {
        category: existing.category,
        name: body.name.trim(),
        description: (body.description ?? "").trim(),
        variants: normalizedVariants,
        textures: normalizedTextures,
        updatedAt: new Date(),
      },
      { merge: true },
    );
    return NextResponse.json({ ok: true, variants: normalizedVariants, textures: normalizedTextures });
  } catch (error) {
    console.error("Failed to save wig product:", error);
    return NextResponse.json({ error: "Failed to save wig product." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    const existing = await getWigProduct(body.id);
    await deleteWigProduct(body.id);
    // Best-effort — only clean up an actual uploaded Blob, not a still-blank product.
    if (existing?.imageUrl?.includes("/uploads/wigProduct/")) {
      await del(existing.imageUrl).catch(() => {});
    }
    if (existing?.videoUrl?.includes("/uploads/wigProductVideo/")) {
      await del(existing.videoUrl).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
