import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Summary {
  total: number;
  topCategories: Array<{ name: string; total: number; icon: string | null }>;
}

export function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recent, setRecent] = useState<Array<{ id: number; amount: number; date: string; category_name: string }>>([]);

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7);
    api.get<Summary>(`/reports/summary?month=${month}`).then(setSummary);
    api.get<typeof recent>(`/expenses?limit=5`).then(setRecent);
  }, []);

  const formatAmount = (n: number) => (n / 100).toFixed(2);

  return (
    <div>
      <h1>Dashboard</h1>
      <Link to="/expenses/new" style={{ display: "inline-block", marginBottom: "1rem", padding: "0.5rem 1rem", background: "#4CAF50", color: "#fff", borderRadius: "4px", textDecoration: "none" }}>
        Add expense
      </Link>
      {summary && (
        <div style={{ marginBottom: "2rem", padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
          <h2>This month</h2>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{formatAmount(summary.total)} USD</p>
          {summary.topCategories.length > 0 && (
            <div>
              <h3>Top categories</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {summary.topCategories.map((c) => (
                  <li key={c.name}>
                    {c.icon} {c.name}: {formatAmount(c.total)} USD
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <div>
        <h2>Recent expenses</h2>
        {recent.length === 0 ? (
          <p>No expenses yet. Add your first one!</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Date</th>
                <th style={{ textAlign: "left" }}>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.category_name}</td>
                  <td style={{ textAlign: "right" }}>{formatAmount(e.amount)} USD</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
