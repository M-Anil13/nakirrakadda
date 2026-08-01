"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: string | any[];
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: number;
  tableNumber?: string;
}

function DineInStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId") || "";
  const tableParam = searchParams.get("table") || "Table 1";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = () => {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          const ordersList: Order[] = Array.isArray(data) ? data : [];
          const found = ordersList.find((o) => o.id === orderId);
          if (found) {
            setOrder(found);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  const parsedItems = order
    ? typeof order.items === "string"
      ? JSON.parse(order.items)
      : order.items
    : [];

  const getStatusStep = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "preparing") return 2;
    if (s === "ready" || s === "out_for_delivery") return 3;
    if (s === "completed" || s === "delivered") return 4;
    return 1; // Received
  };

  const currentStep = getStatusStep(order?.status || "Received");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans max-w-2xl mx-auto flex flex-col justify-between">
      <div className="space-y-6 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase px-2.5 py-1 rounded-full">
              🍽️ {order?.tableNumber || tableParam}
            </span>
            <h1 className="font-extrabold text-xl text-white mt-2">Dine-In Order Tracker</h1>
            <p className="text-xs text-slate-400">Order #{orderId.slice(-6).toUpperCase()}</p>
          </div>
          <Link
            href={`/dine-in?table=${encodeURIComponent(order?.tableNumber || tableParam)}`}
            className="bg-amber-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-amber-400 transition flex items-center gap-1 shadow"
          >
            <span>➕ Add More Items</span>
          </Link>
        </div>

        {/* Status Tracker Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-300">Live Kitchen Status</h2>

          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
            <div className={`p-2 rounded-xl border ${currentStep >= 1 ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-slate-950 border-slate-800 text-slate-600"}`}>
              <div className="text-lg">💳</div>
              <div>Order Paid</div>
            </div>
            <div className={`p-2 rounded-xl border ${currentStep >= 2 ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-slate-950 border-slate-800 text-slate-600"}`}>
              <div className="text-lg">👨‍🍳</div>
              <div>Preparing</div>
            </div>
            <div className={`p-2 rounded-xl border ${currentStep >= 3 ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-slate-950 border-slate-800 text-slate-600"}`}>
              <div className="text-lg">🍲</div>
              <div>Ready</div>
            </div>
            <div className={`p-2 rounded-xl border ${currentStep >= 4 ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-600"}`}>
              <div className="text-lg">🏁</div>
              <div>Served</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
            {currentStep === 1 && <p className="text-xs text-amber-300 font-semibold">⌛ Order received! Kitchen staff is preparing your order.</p>}
            {currentStep === 2 && <p className="text-xs text-amber-400 font-semibold">👨‍🍳 Chef is cooking your dishes hot & fresh!</p>}
            {currentStep === 3 && <p className="text-xs text-emerald-400 font-extrabold">🍲 Your food is ready! Table service incoming.</p>}
            {currentStep === 4 && <p className="text-xs text-emerald-300 font-extrabold">🎉 Served! Enjoy your meal at NA KIRRAAK ADDA!</p>}
          </div>
        </div>

        {/* Order Items List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <h2 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">Order Items ({parsedItems.length})</h2>
          <div className="space-y-2 text-xs">
            {parsedItems.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span className="font-semibold text-slate-200">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-bold text-amber-400">₹{(item.price || 0) * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between font-extrabold text-sm text-white">
            <span>Total Paid</span>
            <span className="text-amber-400">₹{order?.total || 0}</span>
          </div>
        </div>
      </div>

      {/* Feature C Quick Re-order Bar */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-xl">
        <p className="text-xs text-slate-400">Want extra rotis, drinks, or desserts for your table?</p>
        <Link
          href={`/dine-in?table=${encodeURIComponent(order?.tableNumber || tableParam)}`}
          className="inline-block w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm py-3 rounded-xl shadow-lg transition"
        >
          ➕ Add More Items to {order?.tableNumber || tableParam}
        </Link>
      </div>
    </div>
  );
}

export default function DineInStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8 text-center">Loading Order Status...</div>}>
      <DineInStatusContent />
    </Suspense>
  );
}
