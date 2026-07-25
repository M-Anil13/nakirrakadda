"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Uppal, Hyderabad");
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [gpsActive, setGpsActive] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowMenu(false);
    router.push("/");
  };

  const detectGPSLocation = () => {
    if ("geolocation" in navigator) {
      setLocationStatus("Detecting your live GPS location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch("/api/delivery/validate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userLat: latitude, userLng: longitude }),
            });
            const data = await res.json();
            if (data.allowed) {
              const feeText = data.deliveryFee === 0 ? "FREE Delivery" : `₹${data.deliveryFee} Fee`;
              setSelectedLocation(`⚡ Live GPS (${data.distanceKm.toFixed(1)}km — ${feeText})`);
              setGpsActive(true);
              setLocationStatus(`Live Location Active: ${data.distanceKm.toFixed(1)} km from Uppal store ✓`);
              setTimeout(() => setLocationModalOpen(false), 1200);
            } else {
              setLocationStatus("⚠️ Out of delivery zone (>3km from Uppal store)");
            }
          } catch (e) {
            setSelectedLocation(`⚡ Live GPS (Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)})`);
            setGpsActive(true);
            setTimeout(() => setLocationModalOpen(false), 1000);
          }
        },
        () => {
          setLocationStatus("GPS permission denied by browser. Please pick your area below.");
        }
      );
    } else {
      setLocationStatus("GPS not supported by browser. Please pick your area below.");
    }
  };

  return (
    <>
      <header className="bg-black/90 border-b border-orange-500/30 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo/brand-image.jpeg"
              alt="NA KIRRAAK ADDA"
              className="h-10 w-auto object-contain rounded-xl border border-orange-500/30 shadow-md group-hover:scale-105 transition"
            />
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">NA KIRRAAK ADDA</h1>
              <p className="text-[10px] text-orange-400 font-semibold tracking-wider uppercase mt-0.5">Uppal, Hyderabad</p>
            </div>
          </Link>

          {/* Center: Live Location Selector & GPS Activation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocationModalOpen(true)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition shadow ${
                gpsActive
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                  : "border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
              }`}
            >
              <span>{gpsActive ? "⚡" : "📍"}</span>
              <span className="truncate max-w-[130px] sm:max-w-xs">{selectedLocation}</span>
              <span className="text-[10px]">▾</span>
            </button>
          </div>

          {/* Right: Auth / Menu */}
          <div className="flex items-center gap-3">


            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="bg-[#FF6B00] text-black px-4 py-1.5 rounded-full text-xs font-extrabold hover:bg-orange-400 transition"
                >
                  👤 {user.name} ▾
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#14100C] border border-orange-500/30 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                    <Link
                      href="/user/profile"
                      className="block px-3 py-2 text-white hover:bg-orange-500/20 rounded-xl"
                      onClick={() => setShowMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/user/orders"
                      className="block px-3 py-2 text-white hover:bg-orange-500/20 rounded-xl"
                      onClick={() => setShowMenu(false)}
                    >
                      My Orders
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-3 py-2 text-orange-400 font-bold hover:bg-orange-500/20 rounded-xl"
                        onClick={() => setShowMenu(false)}
                      >
                        ⚙️ Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  className="bg-[#FF6B00] text-black px-4 py-1.5 rounded-full text-xs font-extrabold hover:bg-orange-400 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="border border-orange-500/40 text-orange-400 px-4 py-1.5 rounded-full text-xs font-extrabold hover:bg-orange-500/20 transition hidden sm:inline-block"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#14100C] p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📍</span> Delivery & Live Location
              </h3>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="text-zinc-400 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Activate Live GPS to verify exact distance from our Uppal kitchen store (Free delivery within 1 km, delivery zone up to 3 km).
            </p>

            {/* Live GPS Activation Button */}
            <button
              onClick={detectGPSLocation}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-500/20 py-3 text-xs font-extrabold text-emerald-300 hover:bg-emerald-500/30 transition shadow-lg"
            >
              <span>⚡</span> Activate Live GPS Location
            </button>

            {locationStatus && (
              <p className="text-xs text-center font-semibold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                {locationStatus}
              </p>
            )}

            <div className="pt-2">
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Or Select Delivery Area</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Uppal",
                  "Ramanthapur",
                  "Nagole",
                  "Habsiguda",
                  "Boduppal",
                  "Nacharam",
                  "Tarnaka",
                  "Chiluka Nagar",
                  "Alkapuri X Roads",
                  "Sai Nagar",
                ].map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      setSelectedLocation(`${area}, Hyderabad`);
                      setGpsActive(false);
                      setLocationModalOpen(false);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-left ${
                      selectedLocation.includes(area)
                        ? "border-orange-500 bg-orange-500/20 text-orange-300"
                        : "border-white/10 bg-black/40 text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    📍 {area}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
