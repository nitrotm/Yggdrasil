import { useEffect, useState } from "react";
import { api } from "../api/client";

interface Category {
  id: number;
  user_id: number | null;
  name: string;
  icon: string | null;
  color: string | null;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/categories", { name });
      setName("");
      api.get<Category[]>("/categories").then(setCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const customCategories = categories.filter((c) => c.user_id !== null);

  return (
    <div>
      <h1>Categories</h1>
      <form onSubmit={handleAdd} style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          style={{ padding: "0.5rem", flex: 1 }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Add
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Custom categories: {customCategories.length}/5 (Free plan limit)</p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {categories.map((c) => (
          <li key={c.id} style={{ padding: "0.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              {c.icon} {c.name}
            </span>
            {c.user_id !== null && (
              <button onClick={() => handleDelete(c.id)} style={{ cursor: "pointer", color: "red", background: "none", border: "none" }}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
