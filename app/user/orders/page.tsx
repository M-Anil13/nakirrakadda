"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  subtotal: number;
  gst: number;
  packagingFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetchOrders();
  }, [token, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/user/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-yellow-900";
      case "preparing":
        return "bg-blue-900";
      case "ready":
        return "bg-green-900";
      case "out_for_delivery":
        return "bg-orange-900";
      case "delivered":
        return "bg-green-700";
      case "cancelled":
        return "bg-red-900";
      default:
        return "bg-gray-900";
    }
  };

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#FFC145] mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-[#1B1712] rounded-lg p-8 border border-[#FF6B00] text-center">
            <p className="text-gray-400 mb-4">No orders yet.</p>
            <Link
              href="/"
              className="inline-block bg-[#FF6B00] text-white py-2 px-6 rounded font-semibold hover:bg-[#FFC145] hover:text-[#050505] transition"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#1B1712] rounded-lg p-6 border border-[#FF6B00]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order ID</p>
                    <p className="text-white font-mono text-sm">{order.id.substring(0, 12)}...</p>
                  </div>
                  <span className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded text-sm font-semibold`}>
                    {order.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="text-white text-lg font-bold">₹{order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mb-4">
                  <p>Subtotal: ₹{order.subtotal.toFixed(2)} | GST: ₹{order.gst.toFixed(2)} | Delivery: ₹{order.deliveryFee.toFixed(2)}</p>
                </div>

                <Link
                  href={`/order/${order.id}`}
                  className="w-full bg-[#FF6B00] text-white py-2 rounded font-semibold text-center hover:bg-[#FFC145] hover:text-[#050505] transition block"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
