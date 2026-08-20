import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";

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
    const snapshot = await getAdminDb()
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        productName: data.productName ?? "",
        length: data.length ?? "",
        texture: data.texture ?? "",
        lace: data.lace ?? "",
        quantity: data.quantity ?? 1,
        customerName: data.customerName ?? "",
        customerEmail: data.customerEmail ?? "",
        customerPhone: data.customerPhone ?? "",
        shippingAddress: data.shippingAddress ?? null,
        totalPence: data.totalPence ?? 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      };
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to load orders:", error);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}
