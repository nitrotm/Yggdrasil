import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api/client";

export function Settings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword !== newPasswordConfirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      await api.put("/users/me/password", {
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      <section style={{ marginBottom: "2rem" }}>
        <h2>Profile</h2>
        <p>Email: {user?.email ?? "..."}</p>
      </section>
      <section style={{ marginBottom: "2rem" }}>
        <h2>Change password</h2>
        <form onSubmit={handleChangePassword} style={{ maxWidth: "400px" }}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>Password updated</p>}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Confirm new password</label>
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <button type="submit" style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            Save
          </button>
        </form>
      </section>
      <section>
        <h2>Subscription</h2>
        <p>Plan: {user?.plan ?? "..."}</p>
        <Link to="/settings/subscription">Manage subscription</Link>
      </section>
    </div>
  );
}
