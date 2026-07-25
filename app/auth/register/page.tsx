"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          name: formData.name,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
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
          <p className="text-gray-400 mb-6">ADDA — Join the Adda!</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded focus:outline-none focus:border-[#FFC145]"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username (unique)"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded focus:outline-none focus:border-[#FFC145]"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded focus:outline-none focus:border-[#FFC145]"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded focus:outline-none focus:border-[#FFC145]"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded focus:outline-none focus:border-[#FFC145]"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded focus:outline-none focus:border-[#FFC145]"
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B00] text-white py-2 rounded font-semibold hover:bg-[#FFC145] hover:text-[#050505] disabled:opacity-50 transition"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-4 text-center">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#FFC145] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
