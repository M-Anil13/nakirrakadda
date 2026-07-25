import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "kirraak.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

export interface User {
  id: string;
  username: string;
  password_hash: string;
  email: string;
  phone: string;
  name: string;
  role: "user" | "admin" | "kitchen";
  created_at: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  lat: number;
  lng: number;
  formatted_address: string;
  is_default: boolean;
  created_at: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  is_bestseller: boolean;
  created_at: number;
}

export interface ItemModifier {
  id: string;
  menu_item_id: string;
  name: string;
  price_delta: number;
  type: "size" | "addon";
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  subtotal: number;
  gst: number;
  packaging_fee: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_status: "pending" | "completed" | "failed";
  order_status: "received" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  payment_method: string;
  paytm_order_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  modifiers_json: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  changed_at: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order_value: number;
  expires_at: number;
  is_active: boolean;
}

export interface DeliveryConfig {
  id: string;
  store_lat: number;
  store_lng: number;
  store_address: string;
  free_delivery_radius_km: number;
  chargeable_radius_start_km: number;
  chargeable_radius_end_km: number;
  gst_rate: number;
  packaging_fee: number;
  min_order_value: number;
  delivery_fees_json: string;
  updated_at: number;
}

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    label TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    formatted_address TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price REAL NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    is_veg INTEGER DEFAULT 0,
    is_available INTEGER DEFAULT 1,
    is_bestseller INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS item_modifiers (
    id TEXT PRIMARY KEY,
    menu_item_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price_delta REAL DEFAULT 0,
    type TEXT NOT NULL,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    address_id TEXT NOT NULL,
    subtotal REAL NOT NULL,
    gst REAL NOT NULL,
    packaging_fee REAL NOT NULL,
    delivery_fee REAL NOT NULL,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'received',
    payment_method TEXT,
    paytm_order_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    menu_item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    modifiers_json TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
  );

  CREATE TABLE IF NOT EXISTS order_status_history (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    changed_at INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_order_value REAL DEFAULT 0,
    expires_at INTEGER,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS delivery_config (
    id TEXT PRIMARY KEY,
    store_lat REAL NOT NULL,
    store_lng REAL NOT NULL,
    store_address TEXT,
    free_delivery_radius_km REAL DEFAULT 1,
    chargeable_radius_start_km REAL DEFAULT 1,
    chargeable_radius_end_km REAL DEFAULT 3,
    gst_rate REAL DEFAULT 18,
    packaging_fee REAL DEFAULT 20,
    min_order_value REAL DEFAULT 100,
    delivery_fees_json TEXT,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reset_otps (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Initialize default delivery config if not exists
const configCheck = db.prepare(`SELECT * FROM delivery_config LIMIT 1`).get();
if (!configCheck) {
  const defaultDeliveryFees = JSON.stringify({
    "1-1.5": 40,
    "1.5-2": 50,
    "2-3": 60,
  });
  db.prepare(`
    INSERT INTO delivery_config 
    (id, store_lat, store_lng, store_address, free_delivery_radius_km, chargeable_radius_start_km, 
     chargeable_radius_end_km, gst_rate, packaging_fee, min_order_value, delivery_fees_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "config_1",
    17.3998,
    78.5630,
    "NA KIRRAAK ADDA, Uppal, Hyderabad",
    1,
    1,
    3,
    18,
    20,
    100,
    defaultDeliveryFees,
    Date.now()
  );
}

// Initialize default admin user
const adminCheck = db.prepare(`SELECT * FROM users WHERE role = 'admin' LIMIT 1`).get();
if (!adminCheck) {
  const adminId = `user_${Date.now()}`;
  const passwordHash = bcrypt.hashSync("NA@Kirraak2026", 10);
  db.prepare(`
    INSERT INTO users (id, username, password_hash, email, phone, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, "admin", passwordHash, "admin@nakirraak.com", "9966533466", "NA Kirraak Admin", "admin", Date.now());
}

// User functions
export function getUserByUsername(username: string): User | null {
  return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as User | null;
}

export function getUserById(id: string): User | null {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | null;
}

export function createUser(username: string, password: string, email: string, phone: string, name: string): User {
  const id = `user_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare(`
    INSERT INTO users (id, username, password_hash, email, phone, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, username, passwordHash, email, phone, name, "user", Date.now());
  return getUserById(id)!;
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function updateUserPassword(userId: string, currentPass: string, newPass: string): { success: boolean; error?: string } {
  const user = getUserById(userId);
  if (!user) {
    return { success: false, error: "User account not found." };
  }

  const isCurrentValid = verifyPassword(currentPass, user.password_hash);
  if (!isCurrentValid) {
    return { success: false, error: "Incorrect current password." };
  }

  if (newPass.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  const newHash = bcrypt.hashSync(newPass, 10);
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newHash, userId);
  return { success: true };
}

export function createResetOtp(email: string): { success: boolean; user?: User; otpCode?: string; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const user = db.prepare(`
    SELECT * FROM users
    WHERE LOWER(email) = ?
  `).get(cleanEmail) as User | null;

  if (!user || !user.email) {
    return { success: false, error: "No registered user account found with that email address." };
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const id = `otp_${Date.now()}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  db.prepare(`
    INSERT INTO reset_otps (id, identifier, otp_code, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, user.email.toLowerCase(), otpCode, expiresAt, Date.now());

  return { success: true, user, otpCode };
}

export function verifyResetOtpAndChangePassword(email: string, otpCode: string, newPass: string): { success: boolean; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = otpCode.trim();

  const user = db.prepare(`
    SELECT * FROM users
    WHERE LOWER(email) = ?
  `).get(cleanEmail) as User | null;

  if (!user) {
    return { success: false, error: "No registered user account found with that email address." };
  }

  const otpRow = db.prepare(`
    SELECT * FROM reset_otps
    WHERE LOWER(identifier) = ?
    AND otp_code = ? AND expires_at > ?
    ORDER BY created_at DESC LIMIT 1
  `).get(cleanEmail, cleanOtp, Date.now()) as any;

  if (!otpRow) {
    return { success: false, error: "Invalid or expired 6-digit OTP code." };
  }

  if (newPass.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  const newHash = bcrypt.hashSync(newPass, 10);
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newHash, user.id);
  db.prepare(`DELETE FROM reset_otps WHERE id = ?`).run(otpRow.id);

  return { success: true };
}

// Address functions
export function getUserAddresses(userId: string): Address[] {
  return db.prepare(`SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC`).all(userId) as Address[];
}

export function createAddress(userId: string, label: string, lat: number, lng: number, address: string): Address {
  const id = `addr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  db.prepare(`
    INSERT INTO addresses (id, user_id, label, lat, lng, formatted_address, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, label, lat, lng, address, 0, Date.now());
  return db.prepare(`SELECT * FROM addresses WHERE id = ?`).get(id) as Address;
}

export function updateAddress(id: string, userId: string, label: string, address: string): Address | null {
  db.prepare(`UPDATE addresses SET label = ?, formatted_address = ? WHERE id = ? AND user_id = ?`).run(label, address, id, userId);
  return db.prepare(`SELECT * FROM addresses WHERE id = ?`).get(id) as Address | null;
}

export function setDefaultAddress(id: string, userId: string): boolean {
  db.prepare(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`).run(userId);
  db.prepare(`UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?`).run(id, userId);
  return true;
}

// Delivery config functions
export function getDeliveryConfig(): DeliveryConfig {
  const config = db.prepare(`SELECT * FROM delivery_config LIMIT 1`).get() as DeliveryConfig;
  return config;
}

export function updateDeliveryConfig(updates: Partial<DeliveryConfig>): DeliveryConfig {
  const current = getDeliveryConfig();
  db.prepare(`
    UPDATE delivery_config SET 
    store_lat = ?, store_lng = ?, store_address = ?, 
    free_delivery_radius_km = ?, chargeable_radius_start_km = ?, chargeable_radius_end_km = ?,
    gst_rate = ?, packaging_fee = ?, min_order_value = ?, delivery_fees_json = ?,
    updated_at = ?
    WHERE id = ?
  `).run(
    updates.store_lat ?? current.store_lat,
    updates.store_lng ?? current.store_lng,
    updates.store_address ?? current.store_address,
    updates.free_delivery_radius_km ?? current.free_delivery_radius_km,
    updates.chargeable_radius_start_km ?? current.chargeable_radius_start_km,
    updates.chargeable_radius_end_km ?? current.chargeable_radius_end_km,
    updates.gst_rate ?? current.gst_rate,
    updates.packaging_fee ?? current.packaging_fee,
    updates.min_order_value ?? current.min_order_value,
    updates.delivery_fees_json ?? current.delivery_fees_json,
    Date.now(),
    current.id
  );
  return getDeliveryConfig();
}

// Menu functions
export function getAllMenuItems(): MenuItem[] {
  return db.prepare(`SELECT * FROM menu_items WHERE is_available = 1 ORDER BY category, name`).all() as MenuItem[];
}

export function getMenuItemsByCategory(category: string): MenuItem[] {
  return db.prepare(`SELECT * FROM menu_items WHERE category = ? AND is_available = 1`).all(category) as MenuItem[];
}

// Order functions
export function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Order {
  const id = `order_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const now = Date.now();
  db.prepare(`
    INSERT INTO orders (id, user_id, address_id, subtotal, gst, packaging_fee, delivery_fee, discount, total, 
                       payment_status, order_status, payment_method, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, order.user_id, order.address_id, order.subtotal, order.gst, order.packaging_fee, order.delivery_fee,
    order.discount, order.total, order.payment_status, order.order_status, order.payment_method, now, now);
  
  // Create status history entry
  db.prepare(`INSERT INTO order_status_history (id, order_id, status, changed_at) VALUES (?, ?, ?, ?)`).run(
    `hist_${Date.now()}`, id, order.order_status, now
  );
  
  return db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as Order;
}

export function getUserOrders(userId: string): Order[] {
  return db.prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as Order[];
}

export function getOrder(id: string): Order | null {
  return db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as Order | null;
}

export function updateOrderStatus(orderId: string, status: string): boolean {
  db.prepare(`UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?`).run(status, Date.now(), orderId);
  db.prepare(`INSERT INTO order_status_history (id, order_id, status, changed_at) VALUES (?, ?, ?, ?)`).run(
    `hist_${Date.now()}`, orderId, status, Date.now()
  );
  return true;
}

export function getOrderStatusHistory(orderId: string): OrderStatusHistory[] {
  return db.prepare(`SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC`).all(orderId) as OrderStatusHistory[];
}
