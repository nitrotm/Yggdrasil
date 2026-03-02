import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

interface Category {
  id: number;
  name: string;
}

export function AddExpense() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [budgetExceeded, setBudgetExceeded] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Category[]>("/categories").then((list) => setCategories(list));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBudgetExceeded(null);
    const amt = Math.round(parseFloat(amount) * 100);
    if (isNaN(amt) || amt <= 0) {
      setError("Invalid amount");
      return;
    }
    try {
      const res = await api.post<{ id: number; budgetExceeded?: { categoryName: string } }>("/expenses", {
        category_id: categoryId,
        amount: amt,
        date,
        description,
      });
      if (res.budgetExceeded) {
        setBudgetExceeded(`Budget exceeded for ${res.budgetExceeded.categoryName}`);
      }
      setTimeout(() => navigate("/expenses"), res.budgetExceeded ? 2000 : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px" }}>
      <h1>Add expense</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {budgetExceeded && <p style={{ color: "orange" }}>{budgetExceeded}</p>}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value={0}>Select...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button type="submit" style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Save
        </button>
      </form>
    </div>
  );
}
