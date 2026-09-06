import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getWigProduct } from "@/lib/wigProductsServer";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing — set it in .env.local.");
  }
  return new Stripe(secretKey);
}

type ShopCheckoutBody = {
  productId?: string;
  variantId?: string;
  textureId?: string;
  quantity?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export async function POST(request: NextRequest) {
  let body: ShopCheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { productId, variantId, textureId, quantity, customerName, customerEmail, customerPhone } = body;

  if (!productId) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity! < 1 || quantity! > 50) {
    return NextResponse.json({ error: "Quantity must be between 1 and 50." }, { status: 400 });
  }
  if (!customerName?.trim() || !customerEmail?.trim() || !customerPhone?.trim()) {
    return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
  }

  const product = await getWigProduct(productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || !variant) {
    return NextResponse.json({ error: "That wig option is no longer available." }, { status: 409 });
  }
  // A texture is only mandatory when the product actually has some defined —
  // older/simpler products with no texture list skip this entirely.
  const texture = product.textures.length > 0 ? product.textures.find((t) => t.id === textureId) : undefined;
  if (product.textures.length > 0 && !texture) {
    return NextResponse.json({ error: "That texture option is no longer available." }, { status: 409 });
  }
  const unitAmount = variant.pricePence + (texture?.extraPricePence ?? 0);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      shipping_address_collection: { allowed_countries: ["GB"] },
      line_items: [
        {
          quantity,
          price_data: {
            currency: "gbp",
            unit_amount: unitAmount,
            product_data: {
              name: `${product.name} — ${[variant.length, texture?.name, variant.lace].filter(Boolean).join(", ")}`,
            },
          },
        },
      ],
      customer_email: customerEmail,
      metadata: {
        type: "wig-order",
        category: product.category,
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        length: variant.length,
        texture: texture?.name ?? "",
        lace: variant.lace,
        quantity: String(quantity),
        customerName,
        customerEmail,
        customerPhone,
      },
      success_url: `${request.nextUrl.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/shop/cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to start checkout." }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create shop Stripe Checkout session:", error);
    return NextResponse.json({ error: "Failed to start checkout." }, { status: 500 });
  }
}
