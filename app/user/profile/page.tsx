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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[#1B1712] rounded-lg p-8 border border-[#FF6B00]">
          <h1 className="text-3xl font-bold text-[#FFC145] mb-6">My Profile</h1>

          <div className="space-y-4 mb-8">
            <div>
              <p className="text-gray-400">Name</p>
              <p className="text-white text-lg">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Username</p>
              <p className="text-white text-lg">@{user.username}</p>
            </div>
            {user.email && (
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white text-lg">{user.email}</p>
              </div>
            )}
            {user.phone && (
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="text-white text-lg">{user.phone}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Link
              href="/user/addresses"
              className="flex-1 bg-[#FF6B00] text-white py-2 rounded font-semibold text-center hover:bg-[#FFC145] hover:text-[#050505] transition"
            >
              Manage Addresses
            </Link>
            <Link
              href="/user/orders"
              className="flex-1 bg-[#FF6B00] text-white py-2 rounded font-semibold text-center hover:bg-[#FFC145] hover:text-[#050505] transition"
            >
              My Orders
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
