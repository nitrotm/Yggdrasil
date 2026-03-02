import { useEffect, useState } from "react";
import { api } from "../api/client";

interface ReportRow {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  total: number;
}

export function Reports() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<ReportRow[]>([]);

  useEffect(() => {
    api.get<ReportRow[]>(`/reports?month=${month}`).then(setData);
  }, [month]);

  const total = data.reduce((s, r) => s + r.total, 0);
  const formatAmount = (n: number) => (n / 100).toFixed(2);

  return (
    <div>
      <h1>Reports</h1>
      <label style={{ marginBottom: "1rem", display: "block" }}>
        Month: <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </label>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Category</th>
            <th style={{ textAlign: "right" }}>Amount</th>
            <th style={{ textAlign: "right" }}>%</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id}>
              <td>{r.icon} {r.name}</td>
              <td style={{ textAlign: "right" }}>{formatAmount(r.total)} PLN</td>
              <td style={{ textAlign: "right" }}>{total > 0 ? ((r.total / total) * 100).toFixed(1) : "0"}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "1rem", fontWeight: "bold" }}>Total: {formatAmount(total)} PLN</p>
    </div>
  );
}
