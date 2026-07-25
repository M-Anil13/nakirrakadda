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

  return (
    <header className="bg-[#1B1712] border-b border-[#FF6B00] sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#FFC145]">NA KIRRAAK ADDA</h1>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="bg-[#FF6B00] text-white px-4 py-2 rounded font-semibold hover:bg-[#FFC145] hover:text-[#050505] transition"
              >
                {user.name}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1B1712] border border-[#FF6B00] rounded shadow-lg">
                  <Link
                    href="/user/profile"
                    className="block px-4 py-2 text-white hover:bg-[#FF6B00] hover:text-[#050505]"
                    onClick={() => setShowMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/user/addresses"
                    className="block px-4 py-2 text-white hover:bg-[#FF6B00] hover:text-[#050505]"
                    onClick={() => setShowMenu(false)}
                  >
                    Addresses
                  </Link>
                  <Link
                    href="/user/orders"
                    className="block px-4 py-2 text-white hover:bg-[#FF6B00] hover:text-[#050505]"
                    onClick={() => setShowMenu(false)}
                  >
                    My Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2 text-[#FFC145] hover:bg-[#FF6B00] hover:text-[#050505] font-semibold"
                      onClick={() => setShowMenu(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900 hover:text-white"
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
                className="bg-[#FF6B00] text-white px-4 py-2 rounded font-semibold hover:bg-[#FFC145] hover:text-[#050505] transition"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="border border-[#FF6B00] text-[#FFC145] px-4 py-2 rounded font-semibold hover:bg-[#FF6B00] hover:text-[#050505] transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
