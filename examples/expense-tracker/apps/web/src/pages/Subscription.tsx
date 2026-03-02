import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api/client";

export function Subscription() {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await api.post("/subscriptions/upgrade", {});
      await loadUser();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Subscription</h1>
      <p>Current plan: {user?.plan ?? "..."}</p>
      {user?.plan === "free" ? (
        <div>
          <p>Upgrade to Pro for unlimited expenses and categories.</p>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{ padding: "0.5rem 1rem", cursor: loading ? "wait" : "pointer", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "4px" }}
          >
            {loading ? "Upgrading..." : "Upgrade to Pro (mock)"}
          </button>
        </div>
      ) : (
        <p>You have Pro plan.</p>
      )}
    </div>
  );
}
