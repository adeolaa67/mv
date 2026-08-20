import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getBookingSlots } from "@/lib/slots";

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
    const slots = await getBookingSlots();
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Failed to load booking slots:", error);
    return NextResponse.json({ error: "Failed to load slots." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { slots?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const slots = body.slots;
  if (
    !Array.isArray(slots) ||
    slots.length === 0 ||
    slots.length > 24 ||
    !slots.every((s) => typeof s === "string" && s.trim().length > 0)
  ) {
    return NextResponse.json({ error: "slots must be a non-empty list of times." }, { status: 400 });
  }

  const trimmed = slots.map((s) => s.trim());
  if (new Set(trimmed).size !== trimmed.length) {
    return NextResponse.json({ error: "Slots must be unique." }, { status: 400 });
  }

  try {
    await getAdminDb().collection("settings").doc("booking").set({
      slots: trimmed,
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save booking slots:", error);
    return NextResponse.json({ error: "Failed to save slots." }, { status: 500 });
  }
}
