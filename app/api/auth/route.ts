import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getUserByUsername,
  createUser,
  verifyPassword,
  getUserById,
  updateUserPassword,
  createResetOtp,
  verifyResetOtpAndChangePassword,
} from "@/lib/kirraak-db";
import { sendPasswordResetOtpEmail } from "@/lib/email-service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password, email, phone, name, userId, currentPassword, newPassword, identifier, otpCode } = body;

    if (action === "register") {
      if (!username || !password || !name || !email) {
        return NextResponse.json({ error: "Missing required fields (Username, Password, Name, Email)" }, { status: 400 });
      }

      // Check if username already exists
      const existingUser = getUserByUsername(username);
      if (existingUser) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }

      const user = createUser(username, password, email, phone || "", name);

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    if (action === "login") {
      if (!username || !password) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
      }

      const user = getUserByUsername(username);
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const isValidPassword = verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    if (action === "changePassword") {
      if (!userId || !currentPassword || !newPassword) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const result = updateUserPassword(userId, currentPassword, newPassword);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Password updated successfully!" });
    }

    if (action === "requestResetOtp") {
      const resetEmail = email || identifier || "";
      if (!resetEmail) {
        return NextResponse.json({ error: "Please enter your registered Email Address." }, { status: 400 });
      }

      const result = createResetOtp(resetEmail);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      if (result.user?.email && result.otpCode) {
        sendPasswordResetOtpEmail({
          email: result.user.email,
          otpCode: result.otpCode,
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: `✓ 6-Digit OTP verification code sent to ${result.user?.email}!`,
        otpCode: result.otpCode,
      });
    }

    if (action === "resetPasswordWithOtp") {
      const resetEmail = email || identifier || "";
      if (!resetEmail || !otpCode || !newPassword) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const result = verifyResetOtpAndChangePassword(resetEmail, otpCode, newPassword);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Password reset successfully! You can now log in." });
    }

    if (action === "verify") {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");

      if (!token) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = getUserById(decoded.id);

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        return NextResponse.json({
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        });
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
