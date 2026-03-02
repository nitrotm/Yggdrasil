import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Expense {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  category_name: string;
}

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    api.get<Expense[]>(`/expenses?month=${month}`).then(setExpenses);
  }, [month]);

  const formatAmount = (n: number) => (n / 100).toFixed(2);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div>
      <h1>Expenses</h1>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <label>
          Month:{" "}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
        <Link to="/expenses/new" style={{ padding: "0.5rem 1rem", background: "#4CAF50", color: "#fff", borderRadius: "4px", textDecoration: "none" }}>
          Add expense
        </Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Date</th>
            <th style={{ textAlign: "left" }}>Category</th>
            <th style={{ textAlign: "left" }}>Description</th>
            <th style={{ textAlign: "right" }}>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.category_name}</td>
              <td>{e.description ?? ""}</td>
              <td style={{ textAlign: "right" }}>{formatAmount(e.amount)} USD</td>
              <td>
                <Link to={`/expenses/${e.id}/edit`}>Edit</Link>{" "}
                <button onClick={() => handleDelete(e.id)} style={{ cursor: "pointer", color: "red", background: "none", border: "none" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
