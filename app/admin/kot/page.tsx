"use client";

import React, { useState, useEffect, useRef } from "react";

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
  orderType?: string;
  tableNumber?: string;
}

export default function KOTDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "dine_in" | "online">("all");

  const prevOrderIdsRef = useRef<Set<string>>(new Set());

  // Simple Web Audio Synthesizer for Kitchen Chime Sound (Zero external file dependencies)
  const playKitchenChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5 note
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.25); // A5 note

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.8);
    } catch (e) {}
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      const allOrders: Order[] = Array.isArray(data) ? data : [];
      
      // Filter for active kitchen orders (Received, Preparing, Ready)
      const activeOrders = allOrders.filter((o) => ["Received", "Preparing", "Ready"].includes(o.status));
      
      // Check for new Dine-In incoming orders to play chime sound
      const currentDineInIds = new Set(
        activeOrders
          .filter((o) => o.orderType === "dine_in" || o.address.startsWith("Dine-In") || o.tableNumber)
          .map((o) => o.id)
      );

      if (prevOrderIdsRef.current.size > 0) {
        let hasNewDineIn = false;
        currentDineInIds.forEach((id) => {
          if (!prevOrderIdsRef.current.has(id)) {
            hasNewDineIn = true;
          }
        });
        if (hasNewDineIn && soundEnabled) {
          playKitchenChime();
        }
      }

      prevOrderIdsRef.current = currentDineInIds;
      setOrders(activeOrders);
    } catch (e) {}
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateOrderStatus",
          orderId,
          status: newStatus,
        }),
      });
      fetchOrders();
    } catch (e) {}
  };

  const filteredOrders = orders.filter((o) => {
    const isDineIn = o.orderType === "dine_in" || o.address.startsWith("Dine-In") || o.tableNumber;
    if (filterType === "dine_in" && !isDineIn) return false;
    if (filterType === "online" && isDineIn) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans space-y-4">
      {/* Header Bar */}
      <header className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍳</span>
          <div>
            <h1 className="font-black text-xl text-amber-400 tracking-wider">KITCHEN DISPLAY SYSTEM (KOT)</h1>
            <p className="text-xs text-slate-400">NA KIRRAAK ADDA • Live Order Queue for Chefs & Kitchen Staff</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playKitchenChime();
            }}
            className={`flex items-center gap-2 font-extrabold text-xs px-3.5 py-2 rounded-xl border transition ${
              soundEnabled
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <span>{soundEnabled ? "🔔 Chime Sound ON" : "🔕 Chime Sound OFF"}</span>
          </button>

          {/* Filter Pill */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg ${filterType === "all" ? "bg-amber-500 text-slate-950" : "text-slate-400"}`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilterType("dine_in")}
              className={`px-3 py-1.5 rounded-lg ${filterType === "dine_in" ? "bg-amber-500 text-slate-950" : "text-slate-400"}`}
            >
              Dine-In
            </button>
            <button
              onClick={() => setFilterType("online")}
              className={`px-3 py-1.5 rounded-lg ${filterType === "online" ? "bg-amber-500 text-slate-950" : "text-slate-400"}`}
            >
              Online
            </button>
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
          <span className="text-4xl">👨‍🍳</span>
          <p className="font-bold text-sm text-slate-400">All Kitchen Orders Clear!</p>
          <p className="text-xs">No active orders pending in the kitchen queue right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => {
            const isDineIn = ord.orderType === "dine_in" || ord.address.startsWith("Dine-In") || ord.tableNumber;
            const items = typeof ord.items === "string" ? JSON.parse(ord.items) : ord.items || [];
            const timeAgo = Math.max(1, Math.round((Date.now() - ord.createdAt) / 60000));

            return (
              <div
                key={ord.id}
                className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between shadow-2xl transition ${
                  isDineIn ? "bg-slate-900 border-amber-500/40" : "bg-slate-900 border-slate-800"
                }`}
              >
                {/* Top Ticket Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span
                      className={`inline-block font-black text-xs uppercase px-3 py-1 rounded-full border ${
                        isDineIn
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/50"
                      }`}
                    >
                      {isDineIn ? `🍽️ ${ord.tableNumber || ord.address}` : "🛵 Online Delivery"}
                    </span>
                    <p className="text-xs text-slate-400 font-mono mt-1">Order #{ord.id.slice(-6).toUpperCase()}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {timeAgo}m ago
                    </span>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1">{ord.customerName}</p>
                  </div>
                </div>

                {/* Dish Items List */}
                <div className="space-y-2 py-1">
                  {items.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-sm">
                      <span className="font-extrabold text-white text-base">
                        <span className="text-amber-400 font-black">{it.quantity}x</span> {it.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status Action Buttons */}
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                    <span>Status: <strong className="text-amber-300">{ord.status}</strong></span>
                    <span>Paid: ₹{ord.total}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "Preparing")}
                      className={`py-2 rounded-xl text-xs font-black transition ${
                        ord.status === "Preparing"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      👨‍🍳 Cooking
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "Ready")}
                      className={`py-2 rounded-xl text-xs font-black transition ${
                        ord.status === "Ready"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      🍲 Ready
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "Completed")}
                      className="py-2 rounded-xl text-xs font-black bg-blue-600/80 hover:bg-blue-600 text-white transition"
                    >
                      🏁 Served
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
