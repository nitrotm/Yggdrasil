import { useEffect, useState } from "react";
import { api } from "../api/client";

interface Category {
  id: number;
  name: string;
}

interface BudgetRow {
  category_id: number;
  category_name: string;
  limit_amount: number;
  current_total: number;
}

export function Budgets() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories);
  }, []);

  useEffect(() => {
    api.get<BudgetRow[]>(`/budgets?month=${month}`).then(setBudgets);
  }, [month]);

  const handleSave = async (categoryId: number, limitAmount: number) => {
    await api.put("/budgets", { category_id: categoryId, month, limit_amount: limitAmount });
    api.get<BudgetRow[]>(`/budgets?month=${month}`).then(setBudgets);
  };

  const formatAmount = (n: number) => (n / 100).toFixed(2);

  const budgetByCategory = budgetMap(budgets);

  return (
    <div>
      <h1>Budgets</h1>
      <label style={{ marginBottom: "1rem", display: "block" }}>
        Month: <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </label>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Category</th>
            <th style={{ textAlign: "right" }}>Spent</th>
            <th style={{ textAlign: "right" }}>Limit</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => {
            const b = budgetByCategory.get(c.id);
            return (
              <BudgetRow
                key={c.id}
                category={c}
                budget={b}
                onSave={handleSave}
                formatAmount={formatAmount}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function budgetMap(budgets: BudgetRow[]) {
  const m = new Map<number, BudgetRow>();
  for (const b of budgets) {
    m.set(b.category_id, b);
  }
  return m;
}

function BudgetRow({
  category,
  budget,
  onSave,
  formatAmount,
}: {
  category: Category;
  budget?: BudgetRow;
  onSave: (categoryId: number, limitAmount: number) => void;
  formatAmount: (n: number) => string;
}) {
  const [limit, setLimit] = useState(budget ? (budget.limit_amount / 100).toString() : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Math.round(parseFloat(limit) * 100);
    if (!isNaN(amt) && amt >= 0) {
      onSave(category.id, amt);
    }
  };

  return (
    <tr>
      <td>{category.name}</td>
      <td style={{ textAlign: "right" }}>{budget ? formatAmount(budget.current_total) : "0"} USD</td>
      <td>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Limit"
            style={{ width: "100px", padding: "0.25rem" }}
          />
          <button type="submit" style={{ padding: "0.25rem 0.5rem", cursor: "pointer" }}>
            Save
          </button>
        </form>
      </td>
    </tr>
  );
}
