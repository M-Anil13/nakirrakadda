"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
    } catch (err: any) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1B1712] rounded-lg p-8 border border-[#FF6B00]">
          <h1 className="text-3xl font-bold text-[#FFC145] mb-2">NA KIRRAAK</h1>
          <p className="text-gray-400 mb-6">ADDA — Welcome Back!</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded focus:outline-none focus:border-[#FFC145]"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded focus:outline-none focus:border-[#FFC145]"
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B00] text-white py-2 rounded font-semibold hover:bg-[#FFC145] hover:text-[#050505] disabled:opacity-50 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-4 text-center">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-[#FFC145] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
