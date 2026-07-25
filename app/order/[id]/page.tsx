"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface OrderDetail {
  id: string;
  subtotal: number;
  gst: number;
  packagingFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: number;
  statusHistory: Array<{
    status: string;
    changedAt: number;
  }>;
}

const statusSteps = ["received", "preparing", "ready", "out_for_delivery", "delivered"];

export default function OrderTrackPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetchOrder();
  }, [orderId, router]);

  const fetchOrder = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`/api/user/orders?id=${orderId}`, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;
  if (!order) return <div className="text-center py-10 text-white">Order not found</div>;

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-[#FFC145] hover:underline"
        >
          ← Back
        </button>

        <div className="bg-[#1B1712] rounded-lg p-8 border border-[#FF6B00] mb-6">
          <h1 className="text-3xl font-bold text-[#FFC145] mb-2">Order Tracking</h1>
          <p className="text-gray-400 font-mono text-sm">{orderId}</p>
        </div>

        {/* Status Stepper */}
        <div className="bg-[#1B1712] rounded-lg p-8 border border-[#FF6B00] mb-6">
          <h2 className="text-xl font-bold text-[#FFC145] mb-6">Delivery Status</h2>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const stepHistory = order.statusHistory.find((h) => h.status === step);

              return (
                <div key={step} className="flex items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? "bg-[#FF6B00]" : "bg-gray-700"
                  }`}>
                    {isCompleted && <span className="text-white font-bold">✓</span>}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-white font-semibold capitalize">
                      {step.replace("_", " ")}
                    </h3>
                    {stepHistory && (
                      <p className="text-gray-400 text-sm">
                        {new Date(stepHistory.changedAt).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-[#1B1712] rounded-lg p-8 border border-[#FF6B00]">
          <h2 className="text-xl font-bold text-[#FFC145] mb-4">Order Summary</h2>
          
          <div className="space-y-2 text-gray-300 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{order.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Packaging</span>
              <span>₹{order.packagingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{order.deliveryFee.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-[#FF6B00] pt-4">
            <div className="flex justify-between text-lg font-bold text-[#FFC145]">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#FF6B00]">
            <p className="text-gray-400">
              <strong>Payment:</strong> {order.paymentStatus.toUpperCase()} ({order.paymentMethod})
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Ordered on {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
