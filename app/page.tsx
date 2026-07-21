"use client";

import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";

type MenuItem = {
  name: string;
  description: string;
  price: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type CustomerReview = {
  id: string;
  name: string;
  rating: number;
  review: string;
  photo: string | null;
  createdAt: string;
};

const vegPizzas: MenuItem[] = [
  {
    name: "Veg Cheese Pizza (8 Inches)",
    description: "Fresh vegetables with cheese",
    price: "₹139",
  },
  {
    name: "Onion Capsicum Pizza (8 Inches)",
    description: "Onion, capsicum & mozzarella",
    price: "₹139",
  },
  {
    name: "Tomato Cheese Pizza (8 Inches)",
    description: "Fresh tomato & cheese",
    price: "₹139",
  },
  {
    name: "Veg Cheese Spicy Pizza (8 Inches)",
    description: "Spicy veg cheese pizza",
    price: "₹149",
  },
  {
    name: "Mixed Veg Cheese Pizza (8 Inches)",
    description: "Loaded mixed vegetables",
    price: "₹159",
  },
  {
    name: "Paneer Tikka Pizza (8 Inches)",
    description: "Paneer tikka with cheese",
    price: "₹169",
  },
  {
    name: "Sweet Corn Pizza (8 Inches)",
    description: "Sweet corn & mozzarella",
    price: "₹169",
  },
  {
    name: "Special Double Crust Pizza (8 Inches)",
    description: "Double crust special",
    price: "₹169",
  },
  {
    name: "Paneer Tikka Special Double Crust Pizza (8 Inches)",
    description: "Paneer tikka with double crust",
    price: "₹189",
  },
];

const nonVegPizzas: MenuItem[] = [
  {
    name: "Chicken Cheese Pizza (8 Inches)",
    description: "Chicken with rich cheesy flavor",
    price: "₹179",
  },
  {
    name: "Chicken Cheese Spicy Pizza (8 Inches)",
    description: "Spicy chicken pizza with cheese",
    price: "₹189",
  },
  {
    name: "Chicken Tikka Cheese Pizza (8 Inches)",
    description: "Chicken tikka with cheese",
    price: "₹199",
  },
  {
    name: "Chicken Paneer Tikka Pizza (8 Inches)",
    description: "Chicken and paneer tikka combo",
    price: "₹209",
  },
  {
    name: "Chicken Special Double Crust Pizza (8 Inches)",
    description: "Double crust chicken special",
    price: "₹219",
  },
  {
    name: "Chicken Tikka Special Double Crust Pizza (8 Inches)",
    description: "Chicken tikka with double crust",
    price: "₹229",
  },
];

const burgers: MenuItem[] = [
  {
    name: "Veg Burger",
    description: "Classic veg burger",
    price: "₹79",
  },
  {
    name: "Veg Cheese Burger",
    description: "Veg burger with cheese",
    price: "₹89",
  },
  {
    name: "Paneer Burger",
    description: "Paneer patty burger",
    price: "₹99",
  },
  {
    name: "Paneer Cheese Burger",
    description: "Paneer burger with extra cheese",
    price: "₹109",
  },
  {
    name: "Chicken Burger",
    description: "Classic chicken burger",
    price: "₹89",
  },
  {
    name: "Chicken Cheese Burger",
    description: "Chicken burger with cheese",
    price: "₹99",
  },
  {
    name: "Chicken Tikka Burger",
    description: "Chicken tikka flavored burger",
    price: "₹109",
  },
  {
    name: "Chicken Tikka Cheese Burger",
    description: "Chicken tikka burger with cheese",
    price: "₹119",
  },
];

const sandwiches: MenuItem[] = [
  {
    name: "Veg Grill Sandwich",
    description: "Veg grill sandwich",
    price: "₹79",
  },
  {
    name: "Veg Cheese Sandwich",
    description: "Veg sandwich with cheese",
    price: "₹89",
  },
  {
    name: "Paneer Grill Sandwich",
    description: "Paneer grill sandwich",
    price: "₹99",
  },
  {
    name: "Paneer Cheese Grill Sandwich",
    description: "Paneer sandwich with cheese",
    price: "₹109",
  },
  {
    name: "Sweet Corn Sandwich",
    description: "Sweet corn sandwich",
    price: "₹119",
  },
  {
    name: "Sweet Corn Cheese Sandwich",
    description: "Sweet corn sandwich with cheese",
    price: "₹129",
  },
  {
    name: "Chicken Grill Sandwich",
    description: "Chicken grill sandwich",
    price: "₹89",
  },
  {
    name: "Chicken Cheese Grill Sandwich",
    description: "Chicken grill sandwich with cheese",
    price: "₹99",
  },
  {
    name: "Chicken Tikka Sandwich",
    description: "Chicken tikka sandwich",
    price: "₹109",
  },
  {
    name: "Chicken Tikka Cheese Sandwich",
    description: "Chicken tikka sandwich with cheese",
    price: "₹119",
  },
];

const hotBeverages: MenuItem[] = [
  { name: "Tea", description: "Classic hot tea", price: "₹20" },
  { name: "Milk", description: "Warm milk", price: "₹25" },
  { name: "Coffee", description: "Fresh coffee", price: "₹25" },
  { name: "Black Coffee", description: "Strong black coffee", price: "₹25" },
  { name: "Boost", description: "Boost drink", price: "₹30" },
  { name: "Ginger Tea", description: "Ginger flavored tea", price: "₹30" },
  { name: "Masala Chai", description: "Spiced chai", price: "₹30" },
  { name: "Badam Tea", description: "Badam flavored tea", price: "₹30" },
  { name: "Bullet Coffee", description: "Rich bullet coffee", price: "₹55" },
  { name: "Hazelnut Coffee", description: "Hazelnut coffee", price: "₹60" },
  { name: "Hot Chocolate", description: "Creamy hot chocolate", price: "₹70" },
];

const coldBeverages: MenuItem[] = [
  { name: "Lime Mojito", description: "Refreshing lime mojito", price: "₹65" },
  { name: "Cold Coffee", description: "Chilled cold coffee", price: "₹70" },
  { name: "Blue Mint Mojito", description: "Cool blue mint mojito", price: "₹75" },
  { name: "Chilli Guava", description: "Spicy guava drink", price: "₹75" },
  { name: "Rajahmundry Rose Milk", description: "Rose milk", price: "₹80" },
  { name: "Chocolate Milkshake", description: "Rich chocolate milkshake", price: "₹100" },
  { name: "Badam Milkshake", description: "Badam milkshake", price: "₹100" },
  { name: "Kharjoor Milkshake", description: "Kharjoor milkshake", price: "₹120" },
];

const snacksAndFastFood: MenuItem[] = [
  { name: "Cookies (3 pcs)", description: "Fresh cookies", price: "₹20" },
  { name: "Plain Maggi", description: "Classic plain maggi", price: "₹40" },
  { name: "Masala Maggi", description: "Spiced maggi", price: "₹50" },
  { name: "Salt French Fries", description: "Classic salted fries", price: "₹50" },
  { name: "Fried Veg Momos (5 pcs)", description: "Veg momos", price: "₹60" },
  { name: "Peri Peri French Fries", description: "Peri peri fries", price: "₹60" },
  { name: "Egg Maggi", description: "Egg maggi", price: "₹65" },
  { name: "Cheese Maggi", description: "Cheesy maggi", price: "₹65" },
  { name: "Chicken Roll (4 pcs)", description: "Chicken rolls", price: "₹70" },
  { name: "Chicken Samosa (4 pcs)", description: "Chicken samosa", price: "₹70" },
  { name: "Chicken Nuggets (5 pcs)", description: "Crispy chicken nuggets", price: "₹80" },
  { name: "Chicken Fried Momos (5 pcs)", description: "Chicken fried momos", price: "₹80" },
];

const reviews = [
  {
    name: "Mahesh Tammadi (Local Guide)",
    text: "If you're looking for the ultimate smash burger, absolutely nails it. The patties have those perfect, ultra-crispy, lacy edges but somehow stay incredibly juicy on the inside. Melted American cheese binds it all together in a pillowy potato bun that doesn't get soggy. Simple, executed flawlessly, and zero gimmicks. Easily a 10/10. ❤️ #LoveNAKirraakAdda",
  },
  {
    name: "Gorentla Hemanth",
    text: "The sandwich was very tasty and fresh. I really enjoyed it. The quality and flavor were excellent. Keep up the good work!",
  },
  {
    name: "Vidhi Kokate",
    text: "Really enjoyed the Veg Cheese Burger! 🍔🧀 It was perfectly cooked, loaded with cheese, and tasted amazing. The quality and flavor were excellent. Had a wonderful experience.",
  },
];

function MenuSection({
  title,
  subtitle,
  items,
  onAddToCart,
}: {
  title: string;
  subtitle: string;
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/70 p-6 shadow-2xl shadow-orange-500/10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
          {subtitle}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-white/10 to-orange-500/10 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm text-zinc-300">{item.description}</p>
              </div>
              <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold text-black">
                {item.price}
              </span>
            </div>
            <button
              onClick={() => onAddToCart(item)}
              className="mt-4 inline-flex rounded-full border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-orange-400"
            >
              Add to Cart
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [offlineOrders, setOfflineOrders] = useState(200);
  const [onlineOrders, setOnlineOrders] = useState(0);
  const [celebration, setCelebration] = useState("");
  const [offerClaimed, setOfferClaimed] = useState(false);
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [customerRating, setCustomerRating] = useState(5);
  const [customerReview, setCustomerReview] = useState("");
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);

  const addToCart = (item: MenuItem) => {
    const price = Number(item.price.replace(/[^\d]/g, ""));
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.id === item.name);
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.name ? { ...entry, qty: entry.qty + 1 } : entry,
        );
      }
      return [...prev, { id: item.name, name: item.name, price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.flatMap((item) => {
        if (item.id !== id) return [item];
        const nextQty = item.qty + delta;
        return nextQty > 0 ? [{ ...item, qty: nextQty }] : [];
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems],
  );
  const gst = subtotal * 0.18;
  const deliveryCharge = subtotal > 0 ? 40 : 0;
  const grandTotal = subtotal + gst + deliveryCharge;

  const paymentOptions = [
    "UPI",
    "Google Pay",
    "PhonePe",
    "Paytm",
    "Credit/Debit Card",
    "Cash on Delivery",
  ];

  useEffect(() => {
    fetch("/api/orders")
      .then((response) => response.json())
      .then((data) => {
        const count = data.onlineCount ?? 0;
        setOfflineOrders(data.offlineCount ?? 200);
        setOnlineOrders(count);
        if (count === 1) {
          setCelebration("🎉 Congratulations! You are our First Online Customer. You receive a FREE meal.");
          setOfferClaimed(true);
        } else if (count === 100) {
          setCelebration("🎉 Congratulations! You are our 100th Online Customer. You receive a FREE meal.");
          setOfferClaimed(true);
        } else {
          setCelebration("");
          setOfferClaimed(false);
        }
      });

    try {
      const savedReviews = window.localStorage.getItem("na-kirraak-adda-customer-reviews");
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews) as CustomerReview[];
        setCustomerReviews(parsed);
      }
    } catch {
      setCustomerReviews([]);
    }
  }, []);

  const placeOrder = async () => {
  if (!customerName || !phone || !address) {
    alert("Please fill all customer details.");
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    alert("Please login first.");
    return;
  }

    try{
    const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerName,
      phone,
      address,
      paymentMethod,
      cartItems,
      grandTotal,

      userId: user.uid,
      customerPhone: user.phoneNumber,
      status: "Received",
      createdAt: Date.now(),
    }),
  });
    

    if (!response.ok) {
      alert("Unable to confirm your order. Please try again.");
      return;
    }
    alert("Order Placed Successfully!");

    const data = await response.json();

    setOfflineOrders(data.offlineCount ?? offlineOrders);
    const nextCount = data.onlineCount ?? onlineOrders + 1;
    setOnlineOrders(nextCount);

    if (nextCount === 1)  {
      setCelebration(
        "🎉 Congratulations! You are our First Online Customer. You receive a FREE meal."
      );
      setOfferClaimed(true);
  }   else if (nextCount === 100) {
        setCelebration(
          "🎉 Congratulations! You are our 100th Online Customer. You receive a FREE meal."
        );
        setOfferClaimed(true);
      } else {
        setCelebration("");
        setOfferClaimed(false);
      }

      setCartItems([]);
      setCheckoutOpen(false);
      setCustomerName("");
      setPhone("");
      setAddress("");
      setPaymentMethod("UPI");

    } catch (error) {
      console.error(error);
      alert("Serve error. Please try again.");
    }
  };
    
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomerPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerNameInput.trim() || !customerReview.trim()) {
      return;
    }

    const newReview: CustomerReview = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: customerNameInput.trim(),
      rating: customerRating,
      review: customerReview.trim(),
      photo: customerPhoto,
      createdAt: new Date().toISOString(),
    };

    const nextReviews = [newReview, ...customerReviews];
    setCustomerReviews(nextReviews);
    window.localStorage.setItem("na-kirraak-adda-customer-reviews", JSON.stringify(nextReviews));
    setCustomerNameInput("");
    setCustomerRating(5);
    setCustomerReview("");
    setCustomerPhoto(null);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <button
        onClick={() => {
          document.getElementById("cart-section")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="fixed right-4 top-4 z-50 rounded-full border border-orange-500/40 bg-black/80 p-3 text-xl shadow-lg shadow-orange-500/20"
      >
        🛒
        {cartItems.length > 0 ? (
          <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-sm font-semibold text-black">
            {cartItems.reduce((count, item) => count + item.qty, 0)}
          </span>
        ) : null}
      </button>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-orange-500/20 p-6 shadow-2xl shadow-orange-500/10 sm:p-8 lg:p-12"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/logo/brand-image.jpeg')",
            backgroundPosition: "left center",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#000000",
            minHeight: "auto",
          }}
        >
          <div className="absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_30%)]" />
          <div className="relative flex min-h-[60vh] sm:min-h-[80vh]items-center justify-center px-2 pt-8 sm:pt-10 lg:px-0 lg:pt-0">
            <div className="w-full max-w-3xl text-center flex flex-col items-center justify-center gap-4">
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                NA KIRRAAK ADDA
              </h1>
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.4em] text-[#ff9f1c] md:text-base">
                ONE ADDA - ENDLESS CRAVINGS
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {celebration ? (
                  <div className="w-full rounded-2xl border border-orange-500/30 bg-black/60 px-4 py-3 text-sm font-semibold text-orange-300">
                    {celebration}
                  </div>
                ) : null}
                <p className="w-full text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">
                  Freshly baked • Fast delivery
                </p>
                <div className="w-full rounded-full border border-orange-500/30 bg-black/50 px-4 py-2 text-sm font-semibold">
                  <span className="text-orange-300">🍕 Offline</span>
                  <span className="ml-2 text-white">{offlineOrders}+ Orders Served</span>
                </div>
                <div className="w-full rounded-full border border-orange-500/30 bg-black/50 px-4 py-2 text-sm font-semibold">
                  <span className="text-orange-300">🌐 Website Orders</span>
                  <span className="ml-2 text-white">{onlineOrders} Orders</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-xl">
                <div className="mb-5 flex flex-col items-center gap-3 text-center">
                  <div className="flex justify-center">
                    <a
                      href="/orders"
                      className="blink-btn rounded-full border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                    >
                      Order Now
                    </a>
                  </div>
                  <div className="mt-2 w-full max-w-[17rem] rounded-[1.15rem] border border-orange-500/30 bg-black/70 p-3 shadow-[0_0_20px_rgba(249,115,22,0.14)] backdrop-blur">
                    <div className="text-left">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-400">🎁 LAUNCH OFFER</p>
                      <p className="mt-2 text-[13px] font-semibold text-white">🥇 1st Online Order FREE</p>
                      <p className="mt-1 text-[13px] font-semibold text-white">🎉 100th Online Order FREE</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-black/70 p-5 backdrop-blur">
                  <div className="rounded-[1.5rem] border border-orange-500/20 bg-gradient-to-br from-orange-500/20 to-white/5 p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                      Pizza & Burger House
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-sm text-zinc-400">Open</p>
                        <p className="mt-1 text-lg font-semibold text-white">3:00 PM - 12:00 AM</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-sm text-zinc-400">Order</p>
                        <p className="mt-1 text-lg font-semibold text-white">Fast delivery & dine-in</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cart-section" className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-500/20 bg-zinc-950/90 p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Cart</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Your Order</h2>
            </div>
            <div className="rounded-full border border-orange-500/30 bg-black/40 px-4 py-2 text-sm font-medium text-orange-300">
              {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
            </div>
          </div>

          {cartItems.length === 0 ? (
            <p className="mt-6 text-zinc-300">
              Your cart is empty. Add a few delicious items to start your order.
            </p>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/60 p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-sm text-zinc-400">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="rounded-full border border-orange-500/40 px-3 py-1 text-sm font-semibold text-orange-300"
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center font-semibold text-white">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="rounded-full border border-orange-500/40 px-3 py-1 text-sm font-semibold text-orange-300"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold text-black"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-orange-500/20 bg-black/60 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">Summary</p>
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GST</span>
                    <span>₹{gst.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery Charge</span>
                    <span>₹{deliveryCharge.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold text-white">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="mt-6 w-full rounded-full bg-orange-500 px-5 py-3 font-semibold text-black transition hover:bg-orange-400"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {checkoutOpen && cartItems.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-orange-500/20 bg-zinc-950/90 p-6 lg:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Checkout</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Complete your order</h2>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">Customer Name</label>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">Address</label>
                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none"
                    placeholder="Enter your delivery address"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">Payment Method</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {paymentOptions.map((method) => (
                      <label
                        key={method}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium ${
                          paymentMethod === method
                            ? "border-orange-500 bg-orange-500/10 text-orange-300"
                            : "border-white/10 bg-black/40 text-zinc-300"
                        }`}
                      >
                        <span>{method}</span>
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="accent-orange-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </form>

              <div className="rounded-[1.5rem] border border-orange-500/20 bg-black/60 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">Order Summary</p>
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span>
                        {item.name} × {item.qty}
                      </span>
                      <span>₹{(item.price * item.qty).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-white/10 pt-4 text-sm text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GST</span>
                    <span>₹{gst.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery</span>
                    <span>₹{deliveryCharge.toFixed(0)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold text-white">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>
                <button
                  onClick={placeOrder}
                  className="mt-6 w-full rounded-full bg-orange-500 px-5 py-3 font-semibold text-black transition hover:bg-orange-400"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Signature</p>
          <p className="mt-2 text-xl font-semibold text-white">Cheese loaded pizzas</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Classic</p>
          <p className="mt-2 text-xl font-semibold text-white">Juicy burgers</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Ready</p>
          <p className="mt-2 text-xl font-semibold text-white">Order in minutes</p>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-7xl space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
        <MenuSection title="Veg Pizza" subtitle="Plant-based favorites" items={vegPizzas} onAddToCart={addToCart} />
        <MenuSection title="Non-Veg Pizza" subtitle="Protein-packed picks" items={nonVegPizzas} onAddToCart={addToCart} />
        <MenuSection title="Burgers" subtitle="Hot off the grill" items={burgers} onAddToCart={addToCart} />
        <MenuSection title="Sandwiches" subtitle="Quick bites & comfort" items={sandwiches} onAddToCart={addToCart} />
        <MenuSection title="Hot Beverages" subtitle="Warm sips" items={hotBeverages} onAddToCart={addToCart} />
        <MenuSection title="Cold Beverages" subtitle="Chilled favorites" items={coldBeverages} onAddToCart={addToCart} />
        <MenuSection title="Snacks & Fast Food" subtitle="Crispy cravings" items={snacksAndFastFood} onAddToCart={addToCart} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[2rem] border border-orange-500/20 bg-zinc-950/90 p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Find us</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Visit our location</h2>
            <p className="mt-4 text-zinc-300">
              Stop by for a fresh slice or place a quick order for pickup and delivery.
            </p>
            <div className="mt-6 space-y-3 text-sm text-zinc-300">
              <p>📍 NA KIRRAAK ADDA, Venkateswara Colony, Vijayapuri Colony, Uppal, Hyderabad, Telangana 500039</p>
              <p>📞 +91 9966533466</p>
              <p>✉️ nakirraakadda2026@gmail.com</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            <iframe
              src="https://www.google.com/maps?q=NA%20KIRRAAK%20ADDA&output=embed"
              className="h-[320px] w-full border-0"
              loading="lazy"
              title="Google Map for NA KIRRAAK ADDA"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-500/15 to-white/5 p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">
                Reviews
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">Loved by customers</h2>
            </div>
            <div className="rounded-full border border-orange-500/30 bg-black/40 px-4 py-2 text-sm font-medium text-orange-300">
              4.9/5 rated
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.name} className="rounded-2xl border border-white/10 bg-black/60 p-5">
                {review.name === "Mahesh Tammadi (Local Guide)" ? (
                  <img
                    src="/images/reviews/mahesh-tammadi.jpg"
                    alt="Mahesh Tammadi"
                    className="mb-4 h-20 w-20 rounded-full object-cover"
                  />
                ) : null}
                <p className="text-orange-400">★★★★★</p>
                <p className="mt-3 text-sm text-zinc-300">“{review.text}”</p>
                <p className="mt-4 font-semibold text-white">{review.name}</p>
              </article>
          ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-white/5 p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Customer Reviews</p>
            <h2 className="text-3xl font-bold text-white">Share your experience</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={handleSubmitReview} className="rounded-[1.5rem] border border-white/10 bg-black/60 p-5">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-zinc-300">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full cursor-pointer rounded-xl border border-orange-500/30 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-orange-500 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-zinc-300">Customer Name</span>
                  <input
                    value={customerNameInput}
                    onChange={(event) => setCustomerNameInput(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-white outline-none ring-0"
                    placeholder="Enter your name"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-zinc-300">Rating (1–5 stars)</span>
                  <select
                    value={customerRating}
                    onChange={(event) => setCustomerRating(Number(event.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-white outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} star{rating > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-zinc-300">One-line Review</span>
                  <textarea
                    value={customerReview}
                    onChange={(event) => setCustomerReview(event.target.value)}
                    className="min-h-24 w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-white outline-none"
                    placeholder="Share your favorite moment"
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-full bg-orange-500 px-5 py-3 font-semibold text-black transition hover:bg-orange-400"
                >
                  Submit Review
                </button>
              </div>
            </form>
            <div className="space-y-4">
              {customerReviews.length === 0 ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-black/60 p-5 text-sm text-zinc-300">
                  No reviews yet. Be the first to share your experience.
                </div>
              ) : (
                customerReviews.map((review) => (
                  <article key={review.id} className="rounded-[1.5rem] border border-white/10 bg-black/60 p-5">
                    <div className="flex items-center gap-3">
                      {review.photo ? (
                        <img src={review.photo} alt={review.name} className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/20 text-lg font-semibold text-orange-300">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">{review.name}</p>
                        <p className="text-sm text-orange-400">{Array.from({ length: 5 }, (_, index) => (index < review.rating ? "★" : "☆")).join("")}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-zinc-300">“{review.review}”</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/90 p-6 text-center lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Contact</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Order now for the ultimate bite</h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-300">
            Craving something hot and delicious? Reach out anytime for dine-in, pickup or delivery.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="tel:9966533466" className="rounded-full bg-orange-500 px-5 py-3 font-semibold text-black">
              Call Now
            </a>
            <a href="https://wa.me/919966533466" target="_blank" rel="noreferrer" className="rounded-full border border-orange-500/40 px-5 py-3 font-semibold text-orange-300">
              WhatsApp Order
            </a>
          </div>
          <div className="mt-6 space-y-2 text-sm text-zinc-300">
            <p><span className="font-semibold text-white">Restaurant Name:</span> NA KIRRAAK ADDA</p>
            <p><span className="font-semibold text-white">Address:</span> Venkateswara Colony, Vijayapuri Colony, Uppal, Hyderabad, Telangana 500039</p>
            <p>
              <span className="font-semibold text-white">Phone 1:</span>{" "}
              <a href="tel:9966533466" className="text-orange-500 hover:underline">
                9966533466
              </a>
            </p>
            <p>
              <span className="font-semibold text-white">Phone 2:</span>{" "}
              <a href="tel:8885422211" className="text-orange-500 hover:underline">
                8885422211
              </a>
            </p>
            <p>
              <span className="font-semibold text-white">WhatsApp:</span>{" "}
              <a href="https://wa.me/919966533466" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                Chat on WhatsApp
              </a>
            </p>
            <p>
              <span className="font-semibold text-white">Google Maps:</span>{" "}
              <a href="https://share.google/g5HhIATUstL2jV2bS" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                View Location
              </a>
            </p>
            <p>
              <span className="font-semibold text-white">Instagram:</span>{" "}
              <a href="https://www.instagram.com/nakirraakadda?igsh=MWNsd3p5bmdjMxZA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                @nakirraakadda
              </a>
            </p>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-white">
        <p>
          Website Created by{" "}
          <a
            href="https://www.instagram.com/chandu_reddy_vlog?igsh=MXdoMXRmMWRxZm8zYw%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-orange-500 hover:text-orange-400 hover:underline"
          >
            Chandu Creations
          </a>
          {" • "}
          <a
            href="mailto:mchandra1477@gmail.com"
            className="font-bold text-orange-500 hover:text-orange-400 hover:underline"
          >
            Email
          </a>
        </p>
      </footer>
    </main>
  );
}
