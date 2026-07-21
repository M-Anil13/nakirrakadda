"use client";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

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

        {!loggedIn ? (
          <>
            <p>You are not logged in.</p>

            <div style={{ marginTop: 20 }}>
              <Link href="/login">
                <button
                  style={{
                    background: "#ff6600",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Login with Mobile Number
                </button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p>You don't have any orders yet.</p>

            <hr style={{ margin: "20px 0" }} />

            <p>
              Your orders and their live status will appear here after you place
              your first order.
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
          </>
        )}
      </div>
    </main>
  );
}