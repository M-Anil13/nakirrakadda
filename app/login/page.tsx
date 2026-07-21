"use client";

import { useState } from "react";
import { sendOTP, verifyOTP, setupRecaptcha } from "@/lib/auth";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    try {
      setLoading(true);

      setupRecaptcha("recaptcha-container");

      await sendOTP(phone);

      alert("OTP sent successfully!");

      setSent(true);
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);

      const user = await verifyOTP(otp);

      alert("Login Successful!");

      console.log(user);

      window.location.href = "/account";
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111",
      }}
    >
      <div
        style={{
          background: "#222",
          padding: 30,
          borderRadius: 10,
          width: 350,
        }}
      >
        <h2 style={{ color: "white" }}>Login</h2>

        {!sent && (
          <>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 15,
              }}
            />

            <div id="recaptcha-container"></div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                marginTop: 15,
              }}
            >
              Send OTP
            </button>
          </>
        )}

        {sent && (
          <>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 15,
              }}
            />

            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
              }}
            >
              Verify OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}