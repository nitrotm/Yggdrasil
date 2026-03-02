import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

interface Category {
  id: number;
  name: string;
}

export function EditExpense() {
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories);
  }, []);

  useEffect(() => {
    if (id) {
      api.get<{ category_id: number; amount: number; date: string; description: string | null }>(`/expenses/${id}`).then((e) => {
        setCategoryId(e.category_id);
        setAmount((e.amount / 100).toString());
        setDate(e.date);
        setDescription(e.description ?? "");
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const amt = Math.round(parseFloat(amount) * 100);
    if (isNaN(amt) || amt <= 0) {
      setError("Invalid amount");
      return;
    }
    try {
      await api.put(`/expenses/${id}`, {
        category_id: categoryId,
        amount: amt,
        date,
        description,
      });
      navigate("/expenses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    navigate("/expenses");
  };

  return (
    <div style={{ maxWidth: "400px" }}>
      <h1>Edit expense</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          >
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
        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            Save
          </button>
          <button type="button" onClick={handleDelete} style={{ padding: "0.5rem 1rem", cursor: "pointer", color: "red" }}>
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
