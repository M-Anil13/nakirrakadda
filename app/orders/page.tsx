"use client";

export default function OrdersPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: "100%",
          background: "#1f1f1f",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h1>My Orders</h1>

        <p>You are not logged in or you don't have any orders yet.</p>

        <hr style={{ margin: "20px 0" }} />

        <p>
          After you log in with your mobile number, your orders and their status
          will appear here.
        </p>

        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: "#2d2d2d",
            borderRadius: 8,
          }}
        >
          <strong>Example</strong>

          <p>Order #1784572068739</p>
          <p>Status: 🍕 Preparing</p>
          <p>Estimated Time: 25 Minutes</p>
        </div>
      </div>
    </main>
  );
}