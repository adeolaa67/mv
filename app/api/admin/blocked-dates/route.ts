import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";

// middleware.ts only guards page routes under /admin/:path*, not API routes,
// so every handler here re-checks the session cookie itself.
async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = token ? await verifyAdminSessionToken(token) : false;
  return isValid;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const snapshot = await getAdminDb().collection("blockedDates").get();
    return NextResponse.json({ dates: snapshot.docs.map((doc) => doc.id) });
  } catch (error) {
    console.error("Failed to list blockedDates:", error);
    return NextResponse.json({ error: "Failed to load blocked dates." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    await getAdminDb().collection("blockedDates").doc(body.date).set({
      createdBy: "admin",
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to block date:", error);
    return NextResponse.json({ error: "Failed to block date." }, { status: 500 });
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
    await getAdminDb().collection("blockedDates").doc(body.date).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to unblock date:", error);
    return NextResponse.json({ error: "Failed to unblock date." }, { status: 500 });
  }
}
