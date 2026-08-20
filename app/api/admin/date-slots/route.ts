import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getAllDateSlotOverrides } from "@/lib/slots";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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
    const overrides = await getAllDateSlotOverrides();
    return NextResponse.json({ overrides });
  } catch (error) {
    console.error("Failed to load date slot overrides:", error);
    return NextResponse.json({ error: "Failed to load date times." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { date?: string; slots?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.date || !ISO_DATE.test(body.date)) {
    return NextResponse.json({ error: "date must be yyyy-mm-dd." }, { status: 400 });
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
    await getAdminDb().collection("dateSlots").doc(body.date).set({
      slots: trimmed,
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save date slot override:", error);
    return NextResponse.json({ error: "Failed to save date times." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { date?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.date || !ISO_DATE.test(body.date)) {
    return NextResponse.json({ error: "date must be yyyy-mm-dd." }, { status: 400 });
  }

  try {
    await getAdminDb().collection("dateSlots").doc(body.date).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to reset date slot override:", error);
    return NextResponse.json({ error: "Failed to reset date times." }, { status: 500 });
  }
}
