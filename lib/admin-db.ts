import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "admin.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

export interface AdminSession {
  id: string;
  adminId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: number;
  updatedAt: number;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    name TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    adminId TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    createdAt INTEGER NOT NULL,
    expiresAt INTEGER NOT NULL,
    FOREIGN KEY (adminId) REFERENCES admins(id)
  );

  CREATE TABLE IF NOT EXISTS customer_orders (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
`);

// Hash a password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initialize default admin if not exists
const adminCheck = db.prepare(`SELECT * FROM admins WHERE email = ?`).get('admin@nakirraak.com') as any;
if (!adminCheck) {
  const adminId = `admin_${Date.now()}`;
  const passwordHash = hashPassword('NA@Kirraak2026');
  db.prepare(`
    INSERT INTO admins (id, email, passwordHash, name, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminId, 'admin@nakirraak.com', passwordHash, 'NA Kirraak Admin', Date.now());
}

export function verifyAdminLogin(email: string, password: string): { admin: any; token: string } | null {
  const admin = db.prepare(`SELECT * FROM admins WHERE email = ?`).get(email) as any;
  if (!admin) return null;

  const passwordHash = hashPassword(password);
  if (admin.passwordHash !== passwordHash) return null;

  // Create session
  const sessionId = `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = Date.now();
  const expiresAt = createdAt + 7 * 24 * 60 * 60 * 1000; // 7 days

  db.prepare(`
    INSERT INTO sessions (id, adminId, token, createdAt, expiresAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, admin.id, token, createdAt, expiresAt);

  return { admin, token };
}

export function verifyAdminToken(token: string): any | null {
  const session = db.prepare(`
    SELECT s.*, a.* 
    FROM sessions s
    JOIN admins a ON s.adminId = a.id
    WHERE s.token = ? AND s.expiresAt > ?
  `).get(token, Date.now()) as any;
  
  return session || null;
}

export function getAllOrders() {
  const stmt = db.prepare(`SELECT * FROM customer_orders ORDER BY createdAt DESC`);
  return stmt.all() as Order[];
}

export function getOrder(id: string) {
  const stmt = db.prepare(`SELECT * FROM customer_orders WHERE id = ?`);
  return stmt.get(id) as Order | undefined;
}

export function updateOrderStatus(id: string, status: string): boolean {
  const stmt = db.prepare(`UPDATE customer_orders SET status = ?, updatedAt = ? WHERE id = ?`);
  stmt.run(status, Date.now(), id);
  return true;
}

export function createOrder(order: any): any {
  const id = `order_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO customer_orders (id, customerName, phone, address, items, total, status, paymentMethod, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    order.customerName,
    order.phone,
    order.address,
    JSON.stringify(order.items),
    order.total,
    order.status || 'Received',
    order.paymentMethod,
    now,
    now
  );
  return getOrder(id);
}
