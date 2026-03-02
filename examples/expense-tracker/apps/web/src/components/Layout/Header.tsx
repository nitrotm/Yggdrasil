import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  return (
    <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem 2rem", borderBottom: "1px solid #eee" }}>
      <Link to="/dashboard" style={{ fontSize: "1.25rem", fontWeight: "bold", textDecoration: "none", color: "#333" }}>
        Expense Tracker
      </Link>
      <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/budgets">Budgets</Link>
        <Link to="/reports">Reports</Link>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(!open)}
            style={{ padding: "0.5rem", background: "#eee", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            {user?.email ?? "..."} ▼
          </button>
          {open && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "0.25rem",
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                minWidth: "200px",
              }}
            >
              <Link
                to="/settings"
                style={{ display: "block", padding: "0.75rem 1rem", textDecoration: "none", color: "#333" }}
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                style={{ width: "100%", padding: "0.75rem 1rem", textAlign: "left", border: "none", background: "none", cursor: "pointer" }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
