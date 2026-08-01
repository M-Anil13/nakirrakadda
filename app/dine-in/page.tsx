"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  base_price?: number;
  category: string;
  image?: string;
  image_url?: string;
  is_veg: boolean | number;
  is_bestseller: boolean | number;
  is_active?: boolean | number;
}

function DineInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTableParam = searchParams.get("table") || searchParams.get("t") || "";
  const initialTable = rawTableParam ? (rawTableParam.toLowerCase().startsWith("table") ? rawTableParam : `Table ${rawTableParam}`) : "Table 1";

  const [tableNumber, setTableNumber] = useState<string>(initialTable);
  const [showTableSelector, setShowTableSelector] = useState<boolean>(!rawTableParam);
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Customer & Payment Form
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI QR");
  const [utrReference, setUtrReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dine-In config & payment settings
  const [dineInConfig, setDineInConfig] = useState({
    dineInGstRate: 0,
    dineInServiceCharge: 0,
    upiId: "9966533466@ybl",
    enableCod: false,
  });

  useEffect(() => {
    // Fetch Dine-In Config
    fetch("/api/dine-in/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setDineInConfig({
            dineInGstRate: data.config.dineInGstRate || 0,
            dineInServiceCharge: data.config.dineInServiceCharge || 0,
            upiId: data.upiId || "9966533466@ybl",
            enableCod: Boolean(data.enableCod),
          });
        }
      })
      .catch(() => {});

    // Fetch Products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const items: MenuItem[] = Array.isArray(data) ? data : data.products || [];
        setMenuItems(items);
        const uniqueCats = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
        setCategories(["All", ...uniqueCats]);
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.item.id === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as { item: MenuItem; quantity: number }[];
    });
  };

  const cartSubtotal = cart.reduce((sum, c) => sum + (c.item.price || c.item.base_price || 0) * c.quantity, 0);
  const gstAmount = Math.round((cartSubtotal * dineInConfig.dineInGstRate) / 100);
  const serviceCharge = dineInConfig.dineInServiceCharge || 0;
  const grandTotal = cartSubtotal + gstAmount + serviceCharge;
  const totalItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    const isVeg = Boolean(item.is_veg);
    if (vegFilter === "veg" && !isVeg) return false;
    if (vegFilter === "non-veg" && isVeg) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
    }
    return true;
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      alert("Please enter your Name and Phone Number");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: `Dine-In (${tableNumber})`,
        tableNumber: tableNumber,
        orderType: "dine_in",
        items: cart.map((c) => ({
          id: c.item.id,
          name: c.item.name,
          price: c.item.price || c.item.base_price || 0,
          quantity: c.quantity,
        })),
        subtotal: cartSubtotal,
        gst: gstAmount,
        deliveryCharge: 0,
        grandTotal: grandTotal,
        paymentMethod: paymentMethod + (utrReference ? ` (Ref: ${utrReference})` : ""),
        paymentStatus: "completed",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success && data.orderId) {
        setCart([]);
        setIsCheckoutOpen(false);
        router.push(`/dine-in/status?orderId=${data.orderId}&table=${encodeURIComponent(tableNumber)}`);
      } else {
        alert(data.error || "Failed to place order. Please try again.");
      }
    } catch (err: any) {
      alert("Error processing order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiLink = `upi://pay?pa=${encodeURIComponent(dineInConfig.upiId)}&pn=${encodeURIComponent("NA KIRRAAK ADDA")}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`DineIn ${tableNumber}`)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍔</span>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide text-amber-400">NA KIRRAAK ADDA</h1>
              <p className="text-xs text-slate-400 font-medium">Digital Dine-In Menu</p>
            </div>
          </div>

          <button
            onClick={() => setShowTableSelector(!showTableSelector)}
            className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold px-3.5 py-1.5 rounded-full text-xs transition"
          >
            <span>🍽️</span>
            <span>{tableNumber}</span>
            <span className="text-[10px] text-amber-400/70">▼</span>
          </button>
        </div>
      </header>

      {/* Table Change Modal */}
      {showTableSelector && (
        <div className="bg-slate-900 border-b border-amber-500/30 px-4 py-3 text-center">
          <p className="text-xs text-slate-300 mb-2">Select your Table Number:</p>
          <div className="flex justify-center gap-2 max-w-sm mx-auto">
            <select
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                setShowTableSelector(false);
              }}
              className="bg-slate-800 text-white text-sm font-semibold border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {Array.from({ length: 20 }, (_, i) => `Table ${i + 1}`).map((tbl) => (
                <option key={tbl} value={tbl}>
                  {tbl}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowTableSelector(false)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-red-600/30 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="inline-block bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md mb-1">
              Dine-In Special
            </span>
            <h2 className="font-extrabold text-base text-white">Ordering for {tableNumber}</h2>
            <p className="text-xs text-slate-300">⚡ Fast kitchen dispatch • Pay first, enjoy hot food!</p>
          </div>
          <span className="text-3xl">🍲</span>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search dishes, biryani, starters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <span className="absolute left-3.5 top-3 text-slate-500 text-sm">🔍</span>
          </div>

          {/* Veg / Non-Veg Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setVegFilter("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  vegFilter === "all" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setVegFilter("veg")}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  vegFilter === "veg" ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Veg
              </button>
              <button
                onClick={() => setVegFilter("non-veg")}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  vegFilter === "non-veg" ? "bg-red-600/30 text-red-300 border border-red-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Non-Veg
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const isVeg = Boolean(item.is_veg);
            const isBestseller = Boolean(item.is_bestseller);
            const inCart = cart.find((c) => c.item.id === item.id);
            const price = item.price || item.base_price || 0;
            const imgSrc = item.image || item.image_url || "/icon.png";

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 flex gap-3.5 items-center justify-between transition"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-3.5 h-3.5 border flex items-center justify-center p-0.5 rounded-[3px] ${
                        isVeg ? "border-emerald-500" : "border-red-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? "bg-emerald-500" : "bg-red-500"}`}></span>
                    </span>
                    {isBestseller && (
                      <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        🔥 Bestseller
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  <p className="font-extrabold text-amber-400 text-sm">₹{price}</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50">
                    <Image src={imgSrc} alt={item.name} fill className="object-cover" />
                  </div>

                  {inCart ? (
                    <div className="flex items-center bg-amber-500 text-slate-950 font-bold rounded-lg px-2 py-0.5 text-xs">
                      <button onClick={() => handleQuantityChange(item.id, -1)} className="px-1 py-0.5 hover:bg-amber-600 rounded">
                        -
                      </button>
                      <span className="px-2">{inCart.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)} className="px-1 py-0.5 hover:bg-amber-600 rounded">
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-amber-400 font-bold text-xs px-3.5 py-1 rounded-lg transition"
                    >
                      + ADD
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-3.5 shadow-xl shadow-amber-500/20 flex items-center justify-between text-slate-950">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider opacity-80">{totalItemCount} Items added</p>
              <p className="font-black text-lg">₹{grandTotal}</p>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-sm px-5 py-2.5 rounded-xl shadow transition"
            >
              Pay & Place Order →
            </button>
          </div>
        </div>
      )}

      {/* Checkout & Payment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-amber-400">Checkout — {tableNumber}</h3>
                <p className="text-xs text-slate-400">Complete payment to send order to kitchen</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-white font-bold text-xl">
                ✕
              </button>
            </div>

            {/* Order Items Summary */}
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">Selected Dishes:</p>
              {cart.map((c) => (
                <div key={c.item.id} className="flex justify-between text-slate-300">
                  <span>
                    {c.quantity}x {c.item.name}
                  </span>
                  <span className="font-medium">₹{(c.item.price || c.item.base_price || 0) * c.quantity}</span>
                </div>
              ))}
              <div className="border-t border-slate-800 pt-2 space-y-1 font-semibold text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Delivery Charge</span>
                  <span>FREE</span>
                </div>
                {dineInConfig.dineInGstRate > 0 && (
                  <div className="flex justify-between">
                    <span>GST ({dineInConfig.dineInGstRate}%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-white text-sm font-black pt-1 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-amber-400">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Customer Details & Pay-First Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Payment Section */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
                <p className="text-xs font-bold text-amber-300">⚡ Pay-First Policy: Pay via UPI & Submit</p>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <p className="text-slate-400 text-[10px]">UPI ID</p>
                    <p className="font-extrabold text-amber-400">{dineInConfig.upiId}</p>
                  </div>
                  <a
                    href={upiLink}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-md text-[11px]"
                  >
                    Pay ₹{grandTotal} Now ↗
                  </a>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Transaction Ref / UTR No. (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit UTR or Payment Ref"
                    value={utrReference}
                    onChange={(e) => setUtrReference(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg transition"
              >
                {isSubmitting ? "Sending to Kitchen..." : "Confirm & Send Order to Kitchen 👨‍🍳"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DineInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8 text-center">Loading Dine-In Menu...</div>}>
      <DineInContent />
    </Suspense>
  );
}
