"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [router]);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");

    if (newPassword !== confirmPassword) {
      setPwMsg("New password and confirm password do not match!");
      return;
    }

    if (newPassword.length < 6) {
      setPwMsg("New password must be at least 6 characters long.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "changePassword",
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwMsg("✓ Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwMsg(data.error || "Failed to update password.");
      }
    } catch (e) {
      setPwMsg("Error updating password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[#1B1712] rounded-2xl p-8 border border-[#FF6B00] space-y-6 shadow-2xl">
          <h1 className="text-3xl font-bold text-[#FFC145]">My Profile</h1>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-white text-lg font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Username</p>
              <p className="text-white text-lg font-semibold">@{user.username}</p>
            </div>
            {user.email && (
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-white text-lg font-semibold">{user.email}</p>
              </div>
            )}
            {user.phone && (
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-white text-lg font-semibold">{user.phone}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/user/addresses"
              className="flex-1 bg-[#FF6B00] text-black py-2.5 rounded-xl font-extrabold text-center hover:bg-[#FFC145] transition text-xs"
            >
              📍 Manage Addresses
            </Link>
            <Link
              href="/user/orders"
              className="flex-1 bg-[#FF6B00] text-black py-2.5 rounded-xl font-extrabold text-center hover:bg-[#FFC145] transition text-xs"
            >
              📦 My Orders
            </Link>
          </div>

          {/* Change Password Collapsible Section */}
          <div className="border-t border-white/10 pt-6">
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="w-full flex items-center justify-between text-sm font-bold text-orange-400 bg-black/40 p-4 rounded-xl border border-orange-500/30 hover:bg-black/60 transition"
            >
              <span>🔐 Change Account Password</span>
              <span>{showPasswordChange ? "▲" : "▼"}</span>
            </button>

            {showPasswordChange && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4 bg-black/60 p-5 rounded-2xl border border-white/10">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-white/10 bg-black/80 px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-white/10 bg-black/80 px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-white/10 bg-black/80 px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500"
                    required
                  />
                </div>

                {pwMsg && (
                  <p className={`text-xs font-semibold ${pwMsg.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
                    {pwMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="rounded-full bg-[#FF6B00] px-6 py-2.5 text-xs font-extrabold text-black hover:bg-orange-400 transition"
                >
                  {pwLoading ? "Updating..." : "✓ Update Password"}
                </button>
              </form>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-red-600/20 border border-red-500/40 text-red-400 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition text-xs"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
