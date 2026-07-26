# 🍔 NA KIRRAAK ADDA — Online Restaurant & Ordering System

Welcome to **NA KIRRAAK ADDA**, a modern, high-performance food ordering web application built with **Next.js 16**, **TypeScript**, **TailwindCSS**, **Supabase PostgreSQL / SQLite**, and **Zustand**.

---

## 🌟 Key Features

### 🛒 Customer Ordering & Experience
- **Interactive Food Catalog**: Pure Veg / Non-Veg filter pills, category filters, and live search.
- **Dynamic Delivery Radius Validation**: GPS location detection with Haversine distance calculations (0-1 km FREE, 1-3 km chargeable, 3 km+ blocked).
- **Persistent Cart & Checkout**: Zustand cart state with item quantity controls and address selector.
- **Promotional Offers & Coupons**: Promo banners slider and discount coupons with single-use per user/device restrictions.
- **Flexible Payment Gateways**: Dynamic UPI QR Code, GPay / PhonePe / Paytm / BHIM links, Direct Bank Deposit details, and Cash on Delivery (COD).
- **User Account Management**: User Registration, Login (JWT tokens), Profile Password Change, and **6-Digit OTP Email Password Recovery**.

### ⚙️ Admin & Staff Control Panel
- **Real-Time Order Dashboard**: Status management (*Received*, *Preparing*, *Out for Delivery*, *Completed*, *Cancelled*) with Excel/CSV Export and sound alerts.
- **Product & Category Manager**: Add/edit items, upload images, toggle bestseller badges, and **store disabled products at the bottom** for easy re-activation.
- **Staff & Role Management**: Add kitchen staff & delivery drivers with custom access permissions.
- **Payment Gateway Config**: Enable/disable UPI, Bank Transfer, or COD, and update UPI IDs in real time.
- **Admin Email & SMTP Settings**: Configure recipient email and SMTP server for automated order notifications and status updates.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **State Management**: Zustand
- **Database**: Supabase PostgreSQL (Cloud / Production) & SQLite (Local Development)
- **Authentication**: JWT & bcryptjs
- **Email Service**: Nodemailer (SMTP)

---

## 🚀 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chanduneeru/na-kirraak-adda.git
   cd na-kirraak-adda
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: [http://localhost:3000](http://localhost:3000)

---

## ⚡ Supabase Setup & Database SQL

Run the following SQL script in your **Supabase SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  email TEXT NOT NULL, phone TEXT, name TEXT NOT NULL, role TEXT DEFAULT 'user', created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_orders (
  id TEXT PRIMARY KEY, customerName TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL,
  items JSONB NOT NULL, total NUMERIC NOT NULL, status TEXT DEFAULT 'Received',
  paymentMethod TEXT DEFAULT 'Cash on Delivery', assignedStaff TEXT DEFAULT '',
  couponCode TEXT DEFAULT '', deviceId TEXT DEFAULT '', createdAt BIGINT NOT NULL, updatedAt BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, price NUMERIC NOT NULL,
  category TEXT NOT NULL, image TEXT, is_veg INTEGER DEFAULT 1, is_bestseller INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1, created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, title TEXT NOT NULL, subtitle TEXT NOT NULL,
  discountType TEXT DEFAULT 'flat', discountValue NUMERIC NOT NULL, minOrderValue NUMERIC DEFAULT 0,
  icon TEXT DEFAULT '🔥', isActive INTEGER DEFAULT 1, oneTimePerUser INTEGER DEFAULT 1, createdAt BIGINT NOT NULL
);
```

---

## 🌐 Deploying to Vercel

1. Import repository `chanduneeru/na-kirraak-adda` on **[Vercel](https://vercel.com)**.
2. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
3. Click **Deploy**!

---

## 👨‍💻 Author & Credits

- **Author & Developer**: `naniyadav` (`nakirraakadda2026@gmail.com`)
- **Creators**: Chandu Creations & Nexzen.me
