import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebaseAdmin";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing — set it in .env.local.");
  }
  return new Stripe(secretKey);
}

// This is the only place a booking is ever written to Firestore — never from
// the success-page redirect, which a user can hit (or fake) without paying.
// Stripe signs the payload so we can trust it came from Stripe once verified.
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  // Signature verification needs the exact raw bytes Stripe signed — must
  // read as text, not request.json(), or the signature check will fail.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata;

  if (!metadata?.date || !metadata.slot) {
    console.error("checkout.session.completed missing booking metadata:", session.id);
    return NextResponse.json({ received: true });
  }

  // Doc ID is the Stripe session ID (not autoId) so redelivery of the same
  // event — which Stripe does — overwrites the same doc instead of creating
  // a second booking for one payment.
  await getAdminDb()
    .collection("bookings")
    .doc(session.id)
    .set(
      {
        date: metadata.date,
        slot: metadata.slot,
        categorySlug: metadata.categorySlug ?? "",
        subOption: metadata.subOption ?? "",
        customerName: metadata.customerName ?? "",
        customerEmail: metadata.customerEmail ?? "",
        customerPhone: metadata.customerPhone ?? "",
        priceFrom: "£20 deposit",
        status: "confirmed",
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? ""),
        createdAt: new Date(),
        cancelledAt: null,
      },
      { merge: true },
    );

  return NextResponse.json({ received: true });
}
