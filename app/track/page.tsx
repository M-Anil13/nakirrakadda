"use client";

import { useState } from "react";

export default function TrackPage() {
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  async function trackOrder() {
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch("/api/order-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          orderId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        maxWidth: 450,
        margin: "40px auto",
        padding: 20,
      }}
    >
      <h1>Track Your Order</h1>

      <input
        type="tel"
        placeholder="Enter Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 15,
        }}
      />

      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 20,
        }}
      />

      <button
        onClick={trackOrder}
        style={{
          width: "100%",
          padding: 14,
          cursor: "pointer",
        }}
      >
        {loading ? "Searching..." : "Track Order"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 20 }}>
          {error}
        </p>
      )}

      {order && (
        <div
          style={{
            marginTop: 25,
            border: "1px solid #ddd",
            padding: 20,
            borderRadius: 10,
          }}
        >
          <h2>Order Found</h2>

          <p>
            <strong>Order ID:</strong> {order.orderId}
          </p>

          <p>
            <strong>Customer:</strong> {order.customerName}
          </p>

          <p>
            <strong>Phone:</strong> {order.phone}
          </p>

          <p>
            <strong>Status:</strong> {order.status}
          </p>

          <p>
            <strong>Total:</strong> ₹{order.grandTotal}
          </p>
        </div>
      )}
    </div>
  );
}