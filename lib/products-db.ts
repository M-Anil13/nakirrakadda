import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "products.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS featured_items (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL UNIQUE,
    discount REAL DEFAULT 0,
    offerText TEXT,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY (productId) REFERENCES products(id)
  );
`);

export function getAllProducts(): Product[] {
  const stmt = db.prepare(`SELECT * FROM products WHERE isActive = 1 ORDER BY name`);
  return stmt.all() as Product[];
}

export function getProductsByCategory(category: string): Product[] {
  const stmt = db.prepare(`SELECT * FROM products WHERE category = ? AND isActive = 1`);
  return stmt.all(category) as Product[];
}

export function getProduct(id: string): Product | null {
  const stmt = db.prepare(`SELECT * FROM products WHERE id = ?`);
  return (stmt.get(id) as Product) || null;
}

export function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const id = `prod_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO products (id, name, description, price, category, image, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, product.name, product.description, product.price, product.category, product.image || null, 1, now, now);
  return getProduct(id)!;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const existing = getProduct(id);
  if (!existing) return null;

  const now = Date.now();
  const stmt = db.prepare(`
    UPDATE products 
    SET name = ?, description = ?, price = ?, category = ?, image = ?, isActive = ?, updatedAt = ?
    WHERE id = ?
  `);
  stmt.run(
    updates.name ?? existing.name,
    updates.description ?? existing.description,
    updates.price ?? existing.price,
    updates.category ?? existing.category,
    updates.image ?? existing.image,
    updates.isActive ?? existing.isActive,
    now,
    id
  );
  return getProduct(id);
}

export function deleteProduct(id: string): boolean {
  const stmt = db.prepare(`UPDATE products SET isActive = 0, updatedAt = ? WHERE id = ?`);
  stmt.run(Date.now(), id);
  return true;
}

export function getFeaturedItems() {
  const stmt = db.prepare(`
    SELECT p.*, f.discount, f.offerText, f."order"
    FROM featured_items f
    JOIN products p ON f.productId = p.id
    ORDER BY f."order" ASC
  `);
  return stmt.all();
}

export function setFeaturedItem(productId: string, discount: number = 0, offerText: string = ''): boolean {
  const product = getProduct(productId);
  if (!product) return false;

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO featured_items (id, productId, discount, offerText)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(`feat_${productId}`, productId, discount, offerText);
  return true;
}

export function removeFeaturedItem(productId: string): boolean {
  const stmt = db.prepare(`DELETE FROM featured_items WHERE productId = ?`);
  stmt.run(productId);
  return true;
}

export function getCategories(): string[] {
  const stmt = db.prepare(`SELECT DISTINCT category FROM products WHERE isActive = 1 ORDER BY category`);
  return stmt.all().map((row: any) => row.category);
}
