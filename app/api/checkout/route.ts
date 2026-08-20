import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { siteContent } from "@/lib/content";
import { getEffectiveSlotsForDate } from "@/lib/slots";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getServicePrices } from "@/lib/prices";
import { getAddOnsByCategory } from "@/lib/addOns";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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
  addOnIds?: string[];
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

  const { date, slot, categorySlug, subOption, addOnIds, customerName, customerEmail, customerPhone } = body;

  if (!date || !ISO_DATE.test(date)) {
    return NextResponse.json({ error: "date must be yyyy-mm-dd." }, { status: 400 });
  }
  const validSlots = await getEffectiveSlotsForDate(date);
  if (!slot || !validSlots.includes(slot)) {
    return NextResponse.json({ error: "Invalid slot." }, { status: 400 });
  }
  const category = siteContent.categories.find((c) => c.slug === categorySlug);
  if (!category || !subOption || !category.options.includes(subOption)) {
    return NextResponse.json({ error: "Invalid category or option." }, { status: 400 });
  }
  if (!customerName?.trim() || !customerEmail?.trim() || !customerPhone?.trim()) {
    return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
  }

  const prices = await getServicePrices();
  const pricePence = prices[category.slug];
  if (!pricePence) {
    return NextResponse.json(
      { error: "Pricing isn't set up for this service yet — please contact us directly to book." },
      { status: 409 },
    );
  }

  // Add-ons are optional — an empty/missing list is fine, but any ID that IS
  // sent must be a real, priced add-on for this category (never trust the
  // client's own price for these).
  const addOnsForCategory = (await getAddOnsByCategory())[category.slug] ?? [];
  const requestedAddOnIds = Array.isArray(addOnIds) ? addOnIds : [];
  const selectedAddOns = addOnsForCategory.filter((a) => requestedAddOnIds.includes(a.id));
  if (selectedAddOns.length !== requestedAddOnIds.length) {
    return NextResponse.json({ error: "One or more selected extras are no longer available." }, { status: 400 });
  }

  // Re-check availability server-side — the calendar's greyed-out slots are
  // just UI state from page load; without this, a stale tab or a direct API
  // call could pay for a slot that's already blocked or taken.
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
            unit_amount: pricePence,
            product_data: {
              name: subOption,
              description: `${date} at ${slot}. Paid in full.`,
            },
          },
        },
        ...selectedAddOns
          .filter((addOn) => addOn.pricePence > 0)
          .map((addOn) => ({
            quantity: 1,
            price_data: {
              currency: "gbp" as const,
              unit_amount: addOn.pricePence,
              product_data: { name: `Extra: ${addOn.name}` },
            },
          })),
      ],
      customer_email: customerEmail,
      metadata: {
        date,
        slot,
        categorySlug: category.slug,
        subOption,
        addOnNames: selectedAddOns.map((a) => a.name).join(", "),
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
