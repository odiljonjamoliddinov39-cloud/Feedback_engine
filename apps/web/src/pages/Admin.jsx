import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://friendly-dollop-4jrx7jg77645fqrp5-3001.app.github.dev";

export default function Admin() {
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const [s, f] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/summary`),
        axios.get(`${API_BASE}/api/admin/feedback`, { params: { limit: 50 } })
      ]);
      setSummary(s.data);
      setItems(f.data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Admin</h2>
        <button onClick={load} style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {err && (
        <div style={{ marginTop: 12, background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 12 }}>
          {err}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        <Card title="Total" value={summary?.total ?? "-"} />
        <Card title="😡 Negative" value={summary?.moods?.negative ?? "-"} />
        <Card title="😐 Neutral" value={summary?.moods?.neutral ?? "-"} />
        <Card title="😍 Positive" value={summary?.moods?.positive ?? "-"} />
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 10 }}>Latest feedback</h3>

        <div style={{ border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "140px 90px 160px 1fr", gap: 8, padding: 12, background: "#111827", color: "white" }}>
            <div>Date</div>
            <div>Mood</div>
            <div>Tags</div>
            <div>Comment</div>
          </div>

          {items.map((f) => (
            <div key={f.id} style={{ display: "grid", gridTemplateColumns: "140px 90px 160px 1fr", gap: 8, padding: 12, borderTop: "1px solid #222" }}>
              <div style={{ color: "#6b7280" }}>{new Date(f.createdAt).toLocaleString()}</div>
              <div>{f.mood}</div>
              <div style={{ color: "#6b7280" }}>{(f.tags || []).join(", ")}</div>
              <div>{f.comment || "-"}</div>
            </div>
          ))}

          {items.length === 0 && (
            <div style={{ padding: 12, color: "#6b7280" }}>No feedback yet. Submit from /c/demo first.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ flex: 1, border: "1px solid #222", borderRadius: 14, padding: 12, background: "#0b0f19", color: "white" }}>
      <div style={{ color: "#9ca3af", fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}
