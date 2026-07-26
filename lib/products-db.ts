import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const getSafeDatabase = (filename: string) => {
  try {
    const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    const targetDir = isVercel ? "/tmp" : path.join(process.cwd(), "data");
    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
      } catch (e) {}
    }
    const targetPath = path.join(targetDir, filename);
    return new Database(targetPath);
  } catch (e) {
    try {
      return new Database(`/tmp/${filename}`);
    } catch (e2) {
      return new Database(":memory:");
    }
  }
};

const db = getSafeDatabase("products.db");

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  isVeg: boolean;
  isBestseller: boolean;
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
    isVeg INTEGER DEFAULT 1,
    isBestseller INTEGER DEFAULT 0,
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

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    createdAt INTEGER NOT NULL
  );
`);

// Seed default categories if empty
const catCount = (db.prepare(`SELECT count(*) as count FROM categories`).get() as any)?.count || 0;
if (catCount === 0) {
  const defaultCats = [
    "Veg Pizza",
    "Non-Veg Pizza",
    "Burgers",
    "Sandwiches",
    "Hot Beverages",
    "Cold Beverages",
    "Snacks & Fast Food",
  ];
  const stmt = db.prepare(`INSERT INTO categories (id, name, createdAt) VALUES (?, ?, ?)`);
  defaultCats.forEach((cat) => {
    stmt.run(`cat_${Date.now()}_${Math.random().toString(16).slice(2)}`, cat, Date.now());
  });
}

const catalogItems = [
  // 1. Veg Pizza
  { name: "Veg Cheese Pizza (8 Inches)", description: "Fresh vegetables with cheese", price: 139, category: "Veg Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", isVeg: 1, isBestseller: 1 },
  { name: "Onion Capsicum Pizza (8 Inches)", description: "Onion, capsicum & mozzarella", price: 139, category: "Veg Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Tomato Cheese Pizza (8 Inches)", description: "Fresh tomato & cheese", price: 139, category: "Veg Pizza", image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Veg Cheese Spicy Pizza (8 Inches)", description: "Spicy veg cheese pizza", price: 149, category: "Veg Pizza", image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Mixed Veg Cheese Pizza (8 Inches)", description: "Loaded mixed vegetables", price: 159, category: "Veg Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Paneer Tikka Pizza (8 Inches)", description: "Paneer tikka with cheese", price: 169, category: "Veg Pizza", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800", isVeg: 1, isBestseller: 1 },
  { name: "Sweet Corn Pizza (8 Inches)", description: "Sweet corn & mozzarella", price: 169, category: "Veg Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Special Double Crust Pizza (8 Inches)", description: "Double crust special", price: 169, category: "Veg Pizza", image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Paneer Tikka Special Double Crust Pizza (8 Inches)", description: "Paneer tikka with double crust", price: 189, category: "Veg Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", isVeg: 1, isBestseller: 1 },

  // 2. Non-Veg Pizza
  { name: "Chicken Cheese Pizza (8 Inches)", description: "Chicken with rich cheesy flavor", price: 179, category: "Non-Veg Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Cheese Spicy Pizza (8 Inches)", description: "Spicy chicken pizza with cheese", price: 189, category: "Non-Veg Pizza", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800", isVeg: 0, isBestseller: 1 },
  { name: "Chicken Tikka Cheese Pizza (8 Inches)", description: "Chicken tikka with cheese", price: 199, category: "Non-Veg Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Paneer Tikka Pizza (8 Inches)", description: "Chicken and paneer tikka combo", price: 209, category: "Non-Veg Pizza", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Special Double Crust Pizza (8 Inches)", description: "Double crust chicken special", price: 219, category: "Non-Veg Pizza", image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Tikka Special Double Crust Pizza (8 Inches)", description: "Chicken tikka with double crust", price: 229, category: "Non-Veg Pizza", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800", isVeg: 0, isBestseller: 1 },

  // 3. Burgers
  { name: "Veg Burger", description: "Classic veg burger", price: 79, category: "Burgers", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Veg Cheese Burger", description: "Veg burger with cheese", price: 89, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Paneer Burger", description: "Paneer patty burger", price: 99, category: "Burgers", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Paneer Cheese Burger", description: "Paneer burger with extra cheese", price: 109, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", isVeg: 1, isBestseller: 1 },
  { name: "Chicken Burger", description: "Classic chicken burger", price: 89, category: "Burgers", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Cheese Burger", description: "Chicken burger with cheese", price: 99, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", isVeg: 0, isBestseller: 1 },
  { name: "Chicken Tikka Burger", description: "Chicken tikka flavored burger", price: 109, category: "Burgers", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Tikka Cheese Burger", description: "Chicken tikka burger with cheese", price: 119, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", isVeg: 0, isBestseller: 1 },

  // 4. Sandwiches
  { name: "Veg Grill Sandwich", description: "Veg grill sandwich", price: 79, category: "Sandwiches", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Veg Cheese Sandwich", description: "Veg sandwich with cheese", price: 89, category: "Sandwiches", image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Paneer Grill Sandwich", description: "Paneer grill sandwich", price: 99, category: "Sandwiches", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Paneer Cheese Grill Sandwich", description: "Paneer sandwich with cheese", price: 109, category: "Sandwiches", image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800", isVeg: 1, isBestseller: 1 },
  { name: "Sweet Corn Sandwich", description: "Sweet corn sandwich", price: 119, category: "Sandwiches", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Sweet Corn Cheese Sandwich", description: "Sweet corn sandwich with cheese", price: 129, category: "Sandwiches", image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Chicken Grill Sandwich", description: "Chicken grill sandwich", price: 89, category: "Sandwiches", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Cheese Grill Sandwich", description: "Chicken grill sandwich with cheese", price: 99, category: "Sandwiches", image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Tikka Sandwich", description: "Chicken tikka sandwich", price: 109, category: "Sandwiches", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Tikka Cheese Sandwich", description: "Chicken tikka sandwich with cheese", price: 119, category: "Sandwiches", image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800", isVeg: 0, isBestseller: 1 },

  // 5. Hot Beverages
  { name: "Tea", description: "Classic hot tea", price: 20, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Milk", description: "Warm milk", price: 25, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Coffee", description: "Fresh coffee", price: 25, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Black Coffee", description: "Strong black coffee", price: 25, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Boost", description: "Boost drink", price: 30, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Ginger Tea", description: "Ginger flavored tea", price: 30, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Masala Chai", description: "Spiced chai", price: 30, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800", isVeg: 1, isBestseller: 1 },
  { name: "Badam Tea", description: "Badam flavored tea", price: 30, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Bullet Coffee", description: "Rich bullet coffee", price: 55, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Hazelnut Coffee", description: "Hazelnut coffee", price: 60, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Hot Chocolate", description: "Creamy hot chocolate", price: 70, category: "Hot Beverages", image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800", isVeg: 1, isBestseller: 1 },

  // 6. Cold Beverages
  { name: "Lime Mojito", description: "Refreshing lime mojito", price: 65, category: "Cold Beverages", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Cold Coffee", description: "Chilled cold coffee", price: 70, category: "Cold Beverages", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800", isVeg: 1, isBestseller: 1 },
  { name: "Blue Mint Mojito", description: "Cool blue mint mojito", price: 75, category: "Cold Beverages", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Chilli Guava", description: "Spicy guava drink", price: 75, category: "Cold Beverages", image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Rajahmundry Rose Milk", description: "Rose milk", price: 80, category: "Cold Beverages", image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Chocolate Milkshake", description: "Rich chocolate milkshake", price: 100, category: "Cold Beverages", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800", isVeg: 1, isBestseller: 1 },
  { name: "Badam Milkshake", description: "Badam milkshake", price: 100, category: "Cold Beverages", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Kharjoor Milkshake", description: "Kharjoor milkshake", price: 120, category: "Cold Beverages", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800", isVeg: 1, isBestseller: 0 },

  // 7. Snacks & Fast Food
  { name: "Cookies (3 pcs)", description: "Fresh cookies", price: 20, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Plain Maggi", description: "Classic plain maggi", price: 40, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Masala Maggi", description: "Spiced maggi", price: 50, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800", isVeg: 1, isBestseller: 1 },
  { name: "Salt French Fries", description: "Classic salted fries", price: 50, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Fried Veg Momos (5 pcs)", description: "Veg momos", price: 60, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Peri Peri French Fries", description: "Peri peri fries", price: 60, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800", isVeg: 1, isBestseller: 1 },
  { name: "Egg Maggi", description: "Egg maggi", price: 65, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Cheese Maggi", description: "Cheesy maggi", price: 65, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800", isVeg: 1, isBestseller: 0 },
  { name: "Chicken Roll (4 pcs)", description: "Chicken rolls", price: 70, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Samosa (4 pcs)", description: "Chicken samosa", price: 70, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Nuggets (5 pcs)", description: "Crispy chicken nuggets", price: 80, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800", isVeg: 0, isBestseller: 0 },
  { name: "Chicken Fried Momos (5 pcs)", description: "Chicken fried momos", price: 80, category: "Snacks & Fast Food", image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800", isVeg: 0, isBestseller: 1 }
];

// Seed full menu into SQLite database
const countRow = db.prepare(`SELECT COUNT(*) as count FROM products WHERE isActive = 1`).get() as { count: number };
if (countRow.count < 30) {
  db.exec(`DELETE FROM products`);
  const stmt = db.prepare(`
    INSERT INTO products (id, name, description, price, category, image, isVeg, isBestseller, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  const now = Date.now();
  for (let i = 0; i < catalogItems.length; i++) {
    const item = catalogItems[i];
    stmt.run(
      `prod_cat_${i + 1}`,
      item.name,
      item.description,
      item.price,
      item.category,
      item.image,
      item.isVeg,
      item.isBestseller,
      now + i,
      now + i
    );
  }
}

export function getAllProducts(includeDisabled: boolean = false): Product[] {
  const query = includeDisabled
    ? `SELECT * FROM products ORDER BY isActive DESC, createdAt ASC`
    : `SELECT * FROM products WHERE isActive = 1 ORDER BY createdAt ASC`;
  const stmt = db.prepare(query);
  return stmt.all().map((p: any) => ({
    ...p,
    isVeg: Boolean(p.isVeg),
    isBestseller: Boolean(p.isBestseller),
    isActive: Boolean(p.isActive),
  })) as Product[];
}

export function getProductsByCategory(category: string): Product[] {
  const stmt = db.prepare(`SELECT * FROM products WHERE category = ? AND isActive = 1 ORDER BY createdAt ASC`);
  return stmt.all(category).map((p: any) => ({
    ...p,
    isVeg: Boolean(p.isVeg),
    isBestseller: Boolean(p.isBestseller),
    isActive: Boolean(p.isActive),
  })) as Product[];
}

export function getProduct(id: string): Product | null {
  const stmt = db.prepare(`SELECT * FROM products WHERE id = ?`);
  const p: any = stmt.get(id);
  if (!p) return null;
  return {
    ...p,
    isVeg: Boolean(p.isVeg),
    isBestseller: Boolean(p.isBestseller),
    isActive: Boolean(p.isActive),
  };
}

export function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const id = `prod_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO products (id, name, description, price, category, image, isVeg, isBestseller, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    product.name,
    product.description,
    product.price,
    product.category,
    product.image || null,
    product.isVeg !== undefined ? (product.isVeg ? 1 : 0) : 1,
    product.isBestseller !== undefined ? (product.isBestseller ? 1 : 0) : 0,
    1,
    now,
    now
  );
  return getProduct(id)!;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const existing = getProduct(id);
  if (!existing) return null;

  const now = Date.now();
  const stmt = db.prepare(`
    UPDATE products 
    SET name = ?, description = ?, price = ?, category = ?, image = ?, isVeg = ?, isBestseller = ?, isActive = ?, updatedAt = ?
    WHERE id = ?
  `);
  stmt.run(
    updates.name ?? existing.name,
    updates.description ?? existing.description,
    updates.price ?? existing.price,
    updates.category ?? existing.category,
    updates.image ?? existing.image,
    updates.isVeg !== undefined ? (updates.isVeg ? 1 : 0) : (existing.isVeg ? 1 : 0),
    updates.isBestseller !== undefined ? (updates.isBestseller ? 1 : 0) : (existing.isBestseller ? 1 : 0),
    updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : (existing.isActive ? 1 : 0),
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
  let stmt = db.prepare(`SELECT name FROM categories ORDER BY name`);
  let rows = stmt.all() as any[];

  // If categories table is empty or missing existing product categories, auto sync from products catalog!
  if (rows.length === 0) {
    const existingCats = db.prepare(`SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ''`).all() as any[];
    const insertStmt = db.prepare(`INSERT OR IGNORE INTO categories (id, name, createdAt) VALUES (?, ?, ?)`);
    
    const defaults = [
      "Veg Pizza",
      "Non-Veg Pizza",
      "Burgers",
      "Sandwiches",
      "Hot Beverages",
      "Cold Beverages",
      "Snacks & Fast Food",
    ];

    const allCatNames = new Set([
      ...defaults,
      ...existingCats.map((r: any) => r.category),
    ]);

    allCatNames.forEach((catName) => {
      const id = `cat_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      try {
        insertStmt.run(id, catName, Date.now());
      } catch (e) {}
    });

    rows = stmt.all() as any[];
  }

  return rows.map((r) => r.name);
}

export function addCategory(name: string): boolean {
  try {
    const id = `cat_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const stmt = db.prepare(`INSERT INTO categories (id, name, createdAt) VALUES (?, ?, ?)`);
    stmt.run(id, name.trim(), Date.now());
    return true;
  } catch (e) {
    return false;
  }
}

export function updateCategory(oldName: string, newName: string): boolean {
  try {
    const stmt = db.prepare(`UPDATE categories SET name = ? WHERE name = ?`);
    stmt.run(newName.trim(), oldName);
    // Update products with this category
    const pStmt = db.prepare(`UPDATE products SET category = ? WHERE category = ?`);
    pStmt.run(newName.trim(), oldName);
    return true;
  } catch (e) {
    return false;
  }
}

export function deleteCategory(name: string): boolean {
  try {
    const stmt = db.prepare(`DELETE FROM categories WHERE name = ?`);
    stmt.run(name);
    return true;
  } catch (e) {
    return false;
  }
}
