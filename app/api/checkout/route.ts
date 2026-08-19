import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { siteContent } from "@/lib/content";
import { SLOTS } from "@/lib/slots";
import { getAdminDb } from "@/lib/firebaseAdmin";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Policy (see lib/content.ts policies): all appointments require a £20
// non-refundable deposit; the remainder is paid in cash/bank transfer on the
// day. So Checkout only ever collects this fixed amount, never a per-service
// price — the booking-flow `categories` don't map cleanly onto priced
// `services` anyway (different taxonomies).
const DEPOSIT_AMOUNT_PENCE = 2000;

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing — set it in .env.local.");
  }
  return new Stripe(secretKey);
}

type CheckoutBody = {
  date?: string;
  slot?: string;
  categorySlug?: string;
  subOption?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export async function POST(request: NextRequest) {
  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { date, slot, categorySlug, subOption, customerName, customerEmail, customerPhone } = body;

  if (!date || !ISO_DATE.test(date)) {
    return NextResponse.json({ error: "date must be yyyy-mm-dd." }, { status: 400 });
  }
  if (!slot || !SLOTS.includes(slot)) {
    return NextResponse.json({ error: "Invalid slot." }, { status: 400 });
  }
  const category = siteContent.categories.find((c) => c.slug === categorySlug);
  if (!category || !subOption || !category.options.includes(subOption)) {
    return NextResponse.json({ error: "Invalid category or option." }, { status: 400 });
  }
  if (!customerName?.trim() || !customerEmail?.trim() || !customerPhone?.trim()) {
    return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
  }

  // Re-check availability server-side — the calendar's greyed-out slots are
  // just UI state from page load; without this, a stale tab or a direct API
  // call could pay a deposit for a slot that's already blocked or taken.
  const db = getAdminDb();
  const [blockedDoc, bookingsSnapshot] = await Promise.all([
    db.collection("blockedDates").doc(date).get(),
    db.collection("bookings").where("date", "==", date).where("status", "==", "confirmed").get(),
  ]);
  if (blockedDoc.exists) {
    return NextResponse.json({ error: "That date is no longer available." }, { status: 409 });
  }
  const takenSlots = bookingsSnapshot.docs.map((doc) => (doc.data() as { slot?: string }).slot);
  if (takenSlots.includes(slot)) {
    return NextResponse.json({ error: "That slot has just been booked." }, { status: 409 });
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: DEPOSIT_AMOUNT_PENCE,
            product_data: {
              name: `${subOption} — booking deposit`,
              description: `${date} at ${slot}. Non-refundable deposit; remainder due on the day.`,
            },
          },
        },
      ],
      customer_email: customerEmail,
      metadata: {
        date,
        slot,
        categorySlug: category.slug,
        subOption,
        customerName,
        customerEmail,
        customerPhone,
      },
      success_url: `${request.nextUrl.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/booking/cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to start checkout." }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create Stripe Checkout session:", error);
    return NextResponse.json({ error: "Failed to start checkout." }, { status: 500 });
  }
}
