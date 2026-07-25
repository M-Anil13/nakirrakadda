"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Save token & user details & permissions to localStorage
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminName", data.admin.name);
      localStorage.setItem("adminRole", data.admin.role || "Staff");
      localStorage.setItem(
        "adminPermissions",
        JSON.stringify(
          data.admin.permissions || {
            canEditMenu: true,
            canManageOrders: true,
            canManageRoles: true,
            canViewAnalytics: true,
          }
        )
      );
      localStorage.setItem("isSuperAdmin", String(Boolean(data.admin.isSuperAdmin)));

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setError("An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] border border-orange-500/20 bg-zinc-950/90 p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white">NA KIRRAAK ADDA</h1>
            <p className="text-xs text-orange-400 font-extrabold uppercase tracking-wider mt-1">Admin & Staff Portal Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Username / Mobile Number / Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                placeholder="Enter Name, Mobile No., or Email..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Password / Passcode PIN
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                placeholder="Enter password or 4-digit PIN..."
                required
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#FF6B00] px-5 py-3.5 text-xs font-black uppercase text-black transition hover:bg-orange-400 disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {loading ? "Logging in..." : "Login to Portal"}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center space-y-1">
            <p className="text-[11px] text-zinc-400 font-semibold">
              🔑 Admin: <span className="text-white">admin@nakirraak.com</span> / <span className="text-white">NA@Kirraak2026</span>
            </p>
            <p className="text-[11px] text-zinc-500">
              Staff / Employees log in using Name or Mobile Number & PIN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
