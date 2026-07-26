"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: string | OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: number;
  updatedAt: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [totalOrgOrders, setTotalOrgOrders] = useState(200);

  const loadUserOrders = async () => {
    try {
      // Get logged in user if any
      const userDataStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = userDataStr ? JSON.parse(userDataStr) : null;
      setCurrentUser(user);
      const userPhone = user?.phone || "";

      const res = await fetch("/api/orders");
      if (res.ok) {
        const allOrders: Order[] = await res.json();
        setTotalOrgOrders(200 + allOrders.length);
        
        // Filter: If logged in or phone typed, show matching orders. Otherwise show empty until phone/login provided.
        if (userPhone || phoneSearch) {
          const targetPhone = phoneSearch || userPhone;
          const userOrders = allOrders.filter((o) => o.phone.includes(targetPhone) || o.customerName.toLowerCase().includes(targetPhone.toLowerCase()));
          setOrders(userOrders);
        } else {
          setOrders([]);
        }
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserOrders();
    // Auto-poll status every 5 seconds for live updates
    const interval = setInterval(loadUserOrders, 5000);
    return () => clearInterval(interval);
  }, [phoneSearch]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("received")) {
      return { text: "🟡 Received — Awaiting Admin Confirmation", bg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" };
    }
    if (s.includes("prepar")) {
      return { text: "🔵 Kitchen Preparing Your Fresh Order", bg: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
    }
    if (s.includes("out") || s.includes("delivery")) {
      return { text: "🛵 Out for Delivery — Rider On The Way", bg: "bg-orange-500/20 text-orange-300 border-orange-500/40" };
    }
    if (s.includes("complete") || s.includes("deliver")) {
      return { text: "✅ Order Completed & Delivered!", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    }
    return { text: `ORDER STATUS: ${status.toUpperCase()}`, bg: "bg-zinc-800 text-zinc-300 border-zinc-700" };
  };

  const getStepActive = (status: string, stepIndex: number) => {
    const s = status.toLowerCase();
    if (s.includes("received")) return stepIndex === 1;
    if (s.includes("prepar")) return stepIndex <= 2;
    if (s.includes("out") || s.includes("delivery")) return stepIndex <= 3;
    if (s.includes("complete") || s.includes("deliver")) return stepIndex <= 4;
    return stepIndex === 1;
  };

  return (
    <div className="min-h-screen bg-[#0A0806] text-white py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">
              {currentUser ? `👤 Welcome, ${currentUser.name}` : "Track Your Orders"}
            </h1>
            <p className="text-xs text-orange-400 font-semibold mt-1">
              {currentUser
                ? "Showing your personal order history & live delivery tracking"
                : "Enter your mobile number below or login to view your personal orders"}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full bg-[#FF6B00] px-4 py-2 text-xs font-extrabold text-black hover:bg-orange-400 transition"
          >
            + New Order
          </Link>
        </div>

        {/* Organization Total Delivered Orders Badge */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-1">
          <p className="text-xl font-black text-emerald-400">🎉 {totalOrgOrders}+ Orders Delivered</p>
          <p className="text-xs text-emerald-300 font-semibold">Total successful Kirrak orders completed by NA KIRRAAK ADDA organization</p>
        </div>

        {/* Non-logged in User Notice & Search Bar */}
        {!currentUser ? (
          <div className="rounded-2xl border border-white/10 bg-[#14100C] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">🔍 Track Specific Order by Phone</span>
              <Link
                href="/auth/login"
                className="text-xs font-extrabold text-orange-400 hover:underline"
              >
                🔑 Login for Personal Orders →
              </Link>
            </div>
            <input
              type="tel"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              placeholder="Enter your 10-digit mobile number to track your active order..."
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white outline-none focus:border-orange-500"
            />
          </div>
        ) : (
          /* Logged In User Filter */
          <div className="rounded-2xl border border-white/10 bg-[#14100C] p-4 flex gap-3 items-center">
            <span className="text-lg">🔍</span>
            <input
              type="text"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              placeholder={`Filter orders for ${currentUser.phone}...`}
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-500"
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-zinc-400">
            <p className="text-2xl mb-2">⏳</p>
            <p className="text-sm font-semibold">Loading live orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#14100C] p-12 text-center text-zinc-400 space-y-4">
            <p className="text-5xl">🍕</p>
            <h3 className="text-xl font-bold text-white">No Active Orders Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Place an order from our Kirrak Adda menu to track live status from kitchen to doorstep!
            </p>
            <Link
              href="/"
              className="inline-block rounded-full bg-[#FF6B00] px-6 py-2.5 text-xs font-extrabold text-black hover:bg-orange-400 transition"
            >
              Order Delicious Food
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              let parsedItems: OrderItem[] = [];
              try {
                parsedItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
              } catch (e) {
                parsedItems = [];
              }

              return (
                <article
                  key={order.id}
                  className="rounded-3xl border border-white/10 bg-[#14100C] p-6 space-y-5 shadow-2xl hover:border-orange-500/30 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Order ID</span>
                      <h3 className="text-sm font-mono font-bold text-white">{order.id}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">👤 {order.customerName} ({order.phone})</p>
                    </div>
                    <span className={`rounded-full border px-4 py-1.5 text-xs font-extrabold ${badge.bg}`}>
                      {badge.text}
                    </span>
                  </div>

                  {/* Visual Status Progress Tracker Bar */}
                  <div className="py-2">
                    <p className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">Live Status Tracker</p>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className={`p-2 rounded-xl border ${getStepActive(order.status, 1) ? "border-yellow-500 bg-yellow-500/20 text-yellow-300" : "border-white/5 bg-black/40 text-zinc-600"}`}>
                        1. Received 🟡
                      </div>
                      <div className={`p-2 rounded-xl border ${getStepActive(order.status, 2) ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-white/5 bg-black/40 text-zinc-600"}`}>
                        2. Preparing 👨‍🍳
                      </div>
                      <div className={`p-2 rounded-xl border ${getStepActive(order.status, 3) ? "border-orange-500 bg-orange-500/20 text-orange-300" : "border-white/5 bg-black/40 text-zinc-600"}`}>
                        3. On Way 🛵
                      </div>
                      <div className={`p-2 rounded-xl border ${getStepActive(order.status, 4) ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/5 bg-black/40 text-zinc-600"}`}>
                        4. Delivered ✅
                      </div>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ordered Items</p>
                    {parsedItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-zinc-300 py-0.5">
                        <span>{item.name} × {item.qty}</span>
                        <span className="font-bold text-white">₹{(item.price * item.qty).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Payment & Bill Breakdown Card */}
                  {/* Payment & Bill Breakdown Card */}
                  {(() => {
                    const itemsSubtotal = parsedItems.reduce((acc, item) => acc + (Number((item as any).price || (item as any).unit_price || 0) * Number((item as any).qty || (item as any).quantity || 1)), 0);
                    const orderGst = (order as any).gst !== undefined && (order as any).gst !== null ? Number((order as any).gst) : Math.round(itemsSubtotal * 0.05);
                    const orderDelivery = (order as any).deliveryCharge !== undefined && (order as any).deliveryCharge !== null
                      ? Number((order as any).deliveryCharge)
                      : Math.max(0, Math.round(Number(order.total) - itemsSubtotal - orderGst));

                    return (
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2 text-xs">
                        <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Payment & Bill Invoice Breakdown</p>
                        
                        <div className="flex justify-between text-zinc-400">
                          <span>Items Subtotal:</span>
                          <span className="font-semibold text-white">₹{itemsSubtotal.toFixed(0)}</span>
                        </div>

                        <div className="flex justify-between text-zinc-400">
                          <span>GST (5% Tax):</span>
                          <span className="font-semibold text-white">₹{orderGst.toFixed(0)}</span>
                        </div>

                        <div className="flex justify-between text-zinc-400">
                          <span>Delivery Charge:</span>
                          <span className="font-semibold text-white">{orderDelivery > 0 ? `₹${orderDelivery.toFixed(0)}` : "FREE Delivery (₹0)"}</span>
                        </div>

                        <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-sm">
                          <span className="text-white">Grand Total:</span>
                          <span className="text-emerald-400 font-black">₹{order.total}</span>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-zinc-400">
                          <span>💳 <strong>Payment Method:</strong> {order.paymentMethod}</span>
                          <span>📍 <strong>Address:</strong> {order.address}</span>
                        </div>
                      </div>
                    );
                  })()}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
