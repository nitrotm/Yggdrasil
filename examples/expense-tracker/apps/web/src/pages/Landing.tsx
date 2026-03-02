import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Expense Tracker</h1>
      <p style={{ fontSize: "1.25rem", color: "#666", marginBottom: "2rem" }}>
        Track your expenses, set budgets, and get insights.
      </p>
      <Link
        to="/register"
        style={{
          display: "inline-block",
          padding: "0.75rem 2rem",
          background: "#4CAF50",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Get started free
      </Link>
      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
