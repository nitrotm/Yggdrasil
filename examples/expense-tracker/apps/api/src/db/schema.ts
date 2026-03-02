export const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  date TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budgets (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  limit_amount INTEGER NOT NULL CHECK (limit_amount >= 0),
  PRIMARY KEY (user_id, category_id, month)
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
`;

const PREDEF_CATEGORIES = [
  { name: "Food", icon: "🍽️", color: "#4CAF50" },
  { name: "Transport", icon: "🚗", color: "#2196F3" },
  { name: "Entertainment", icon: "🎬", color: "#9C27B0" },
  { name: "Shopping", icon: "🛒", color: "#FF9800" },
  { name: "Health", icon: "💊", color: "#F44336" },
  { name: "Other", icon: "📦", color: "#607D8B" },
];

export function seedPredefCategories(db: import("better-sqlite3").Database): void {
  const count = db.prepare("SELECT COUNT(*) as n FROM categories WHERE user_id IS NULL").get() as { n: number };
  if (count.n >= 6) return;

  const insert = db.prepare(
    "INSERT INTO categories (user_id, name, icon, color) VALUES (?, ?, ?, ?)"
  );
  for (const c of PREDEF_CATEGORIES) {
    insert.run(null, c.name, c.icon, c.color);
  }
}
