import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "orders.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS counters (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL
  )
`);

const initialCount = 200;
const onlineInitialCount = 0;
const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO counters (key, value) VALUES ('orders_served', ?)
`);
insertStmt.run(initialCount);

const insertOnlineStmt = db.prepare(`
  INSERT OR IGNORE INTO counters (key, value) VALUES ('online_orders', ?)
`);
insertOnlineStmt.run(onlineInitialCount);

export function getOrdersServed(): number {
  const row = db.prepare(`SELECT value FROM counters WHERE key = 'orders_served'`).get() as
    | { value: number }
    | undefined;
  return row?.value ?? initialCount;
}

export function getOnlineOrders(): number {
  const row = db.prepare(`SELECT value FROM counters WHERE key = 'online_orders'`).get() as
    | { value: number }
    | undefined;
  return row?.value ?? onlineInitialCount;
}

export function incrementOrdersServed(): number {
  const stmt = db.prepare(`
    UPDATE counters
    SET value = value + 1
    WHERE key = 'orders_served'
  `);
  stmt.run();
  return getOrdersServed();
}

export function incrementOnlineOrders(): number {
  const stmt = db.prepare(`
    UPDATE counters
    SET value = value + 1
    WHERE key = 'online_orders'
  `);
  stmt.run();
  return getOnlineOrders();
}
