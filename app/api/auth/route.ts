import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getUserByUsername, createUser, verifyPassword, getUserById } from "@/lib/kirraak-db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const { action, username, password, email, phone, name } = await request.json();

    if (action === "register") {
      // Check if username already exists
      const existingUser = getUserByUsername(username);
      if (existingUser) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }

      if (!username || !password || !name) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const user = createUser(username, password, email || "", phone || "", name);

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
