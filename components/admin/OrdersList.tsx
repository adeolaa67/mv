"use client";

import { useEffect, useState } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/wigProducts";

type Order = {
  id: string;
  category: string;
  productName: string;
  length: string;
  texture: string;
  lace: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: { line1: string; line2: string; city: string; postalCode: string; country: string } | null;
  totalPence: number;
  createdAt: string | null;
};

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setOrders(data.orders);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl border border-hairline bg-white/40 px-6 py-8">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 border border-hairline bg-white/40 px-6 py-8">
      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}
      {orders.length === 0 ? (
        <p className="text-sm text-ink/50">No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="space-y-1 border-t border-hairline pt-4 text-sm first:border-t-0 first:pt-0">
            <p className="text-xs uppercase tracking-widest text-bronze">
              {PRODUCT_CATEGORIES.find((c) => c.slug === order.category)?.label ?? "Hair"}
            </p>
            <p className="font-medium">
              {order.quantity} × {order.productName} — {order.length}, {order.texture}, {order.lace}
            </p>
            <p className="text-ink/60">
              £{(order.totalPence / 100).toFixed(2)} · {order.customerName} · {order.customerEmail} ·{" "}
              {order.customerPhone}
            </p>
            {order.shippingAddress && (
              <p className="text-ink/60">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, {order.shippingAddress.city}{" "}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            )}
            {order.createdAt && (
              <p className="text-xs text-ink/40">{new Date(order.createdAt).toLocaleString("en-GB")}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
