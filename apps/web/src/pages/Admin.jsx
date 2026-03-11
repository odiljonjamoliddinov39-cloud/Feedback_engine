import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "/api";

export default function Admin() {
  const nav = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [activeSlug, setActiveSlug] = useState("");
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSlogan, setNewSlogan] = useState("");

  const token = useMemo(() => localStorage.getItem("token"), []);

  function logout() {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  }

  function headers() {
    const t = localStorage.getItem("token");
    if (!t) return null;
    return { Authorization: `Bearer ${t}` };
  }

  async function loadCompanies() {
    const h = headers();
    if (!h) return logout();

    const res = await axios.get(`${API_BASE}/companies`, { headers: h });
    const list = res.data?.companies || [];
    setCompanies(list);

    if (!activeSlug && list.length > 0) {
      setActiveSlug(list[0].slug);
    }
  }

  async function loadData(slug) {
    const h = headers();
    if (!h) return logout();

    setErr("");
    setLoading(true);

    try {
      const [s, f] = await Promise.all([
        axios.get(`${API_BASE}/admin/summary`, { headers: h, params: { companySlug: slug } }),
        axios.get(`${API_BASE}/admin/feedback`, { headers: h, params: { companySlug: slug, limit: 50 } }),
      ]);

      setSummary(s.data || null);
      setItems(f.data?.items || []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) return logout();
      setSummary(null);
      setItems([]);
      setErr(e?.response?.data?.error || e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function createCompany(e) {
    e.preventDefault();
    const h = headers();
    if (!h) return logout();

    setErr("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/companies`,
        { name: newName, slug: newSlug, slogan: newSlogan },
        { headers: h }
      );

      const c = res.data?.company;
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
      setNewSlogan("");

      await loadCompanies();
      if (c?.slug) setActiveSlug(c.slug);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) nav("/login", { replace: true });
    else loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeSlug) loadData(activeSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  return (
    <div style={S.page}>
      <Bg />

      <div style={S.center}>
        <div style={S.wrap}>
          <div style={S.topbar}>
            <div>
              <div style={S.title}>Admin</div>
              <div style={S.sub}>Manage your companies & view feedback</div>
            </div>

            <div style={S.actions}>
              <button onClick={() => setShowCreate((v) => !v)} style={S.btnGhost}>
                {showCreate ? "Close" : "New company"}
              </button>
              <button onClick={logout} style={S.btnDanger}>Logout</button>
            </div>
          </div>

          <div style={S.row}>
            <div style={S.selectWrap}>
              <div style={S.label}>Company</div>
              <select
                value={activeSlug}
                onChange={(e) => setActiveSlug(e.target.value)}
                style={S.select}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
              <div style={S.smallHint}>
                Public link: <span style={{ opacity: 0.95, fontWeight: 900 }}>/c/{activeSlug || "..."}</span>
              </div>
            </div>

            <button onClick={() => activeSlug && loadData(activeSlug)} disabled={!activeSlug || loading} style={S.btnPrimary}>
              {loading ? "Loading..." : "Refresh data"}
            </button>
          </div>

          {showCreate && (
            <form onSubmit={createCompany} style={S.panel}>
              <div style={S.panelTitle}>Create company</div>

              <div style={S.grid2}>
                <div style={S.field}>
                  <div style={S.label}>Name</div>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My Cafe" style={S.input} />
                </div>

                <div style={S.field}>
                  <div style={S.label}>Slug (optional)</div>
                  <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="my-cafe" style={S.input} />
                </div>
              </div>

              <div style={S.field}>
                <div style={S.label}>Slogan (optional)</div>
                <input value={newSlogan} onChange={(e) => setNewSlogan(e.target.value)} placeholder="The space to improve business" style={S.input} />
              </div>

              <button type="submit" disabled={loading} style={S.btnPrimary}>
                {loading ? "Creating..." : "Create"}
              </button>
            </form>
          )}

          {err && <div style={S.alert}>{err}</div>}

          <div style={S.cards}>
            <Card title="Total" value={summary?.total ?? "-"} />
            <Card title="😡 Negative" value={summary?.moods?.negative ?? "-"} />
            <Card title="😐 Neutral" value={summary?.moods?.neutral ?? "-"} />
            <Card title="😍 Positive" value={summary?.moods?.positive ?? "-"} />
          </div>

          <div style={S.panel}>
            <div style={S.panelTitle}>Latest feedback</div>

            <div className="_table" style={S.table}>
              <div style={S.tHead}>
                <div>Date</div><div>Mood</div><div>Tags</div><div>Comment</div>
              </div>
              {items.map((f, idx) => (
                <div key={f?.id ?? idx} style={S.tRow}>
                  <div style={S.muted}>{f?.createdAt ? new Date(f.createdAt).toLocaleString() : "-"}</div>
                  <div><span style={{ ...S.pill, ...pillMood(f?.mood) }}>{f?.mood ?? "-"}</span></div>
                  <div style={S.muted}>{(f?.tags || []).join(", ") || "-"}</div>
                  <div>{f?.comment || "-"}</div>
                </div>
              ))}
              {!loading && items.length === 0 && <div style={S.empty}>No feedback yet.</div>}
            </div>

            <div className="_mobileList" style={S.mobileList}>
              {items.map((f, idx) => (
                <div key={f?.id ?? idx} style={S.mobileItem}>
                  <div style={S.mobileTop}>
                    <div style={S.mutedSmall}>{f?.createdAt ? new Date(f.createdAt).toLocaleString() : "-"}</div>
                    <span style={{ ...S.pill, ...pillMood(f?.mood) }}>{f?.mood ?? "-"}</span>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={S.mobileLabel}>Tags</div>
                    <div style={S.muted}>{(f?.tags || []).join(", ") || "-"}</div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={S.mobileLabel}>Comment</div>
                    <div>{f?.comment || "-"}</div>
                  </div>
                </div>
              ))}
              {!loading && items.length === 0 && <div style={S.empty}>No feedback yet.</div>}
            </div>
          </div>

          <style>{`
            @media (max-width: 860px) {
              ._table { display: none !important; }
              ._mobileList { display: grid !important; }
            }
            @media (min-width: 861px) {
              ._mobileList { display: none !important; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={S.card}>
      <div style={S.cardTitle}>{title}</div>
      <div style={S.cardValue}>{value}</div>
    </div>
  );
}

function pillMood(mood) {
  if (mood === "negative") return { background: "rgba(239,68,68,0.18)", borderColor: "rgba(239,68,68,0.35)", color: "#fecaca" };
  if (mood === "positive") return { background: "rgba(16,185,129,0.18)", borderColor: "rgba(16,185,129,0.35)", color: "#bbf7d0" };
  if (mood === "neutral") return { background: "rgba(245,158,11,0.16)", borderColor: "rgba(245,158,11,0.30)", color: "#fde68a" };
  return {};
}

function Bg() {
  return (
    <div aria-hidden="true" style={S.bg}>
      <div style={S.glowA} />
      <div style={S.glowB} />
      <div style={S.grid} />
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", width: "100vw", position: "relative", overflow: "hidden", color: "white" },
  bg: { position: "absolute", inset: 0, background: "#050812" },
  glowA: { position: "absolute", left: "-15%", top: "-20%", width: "55vw", height: "55vw", maxWidth: 720, maxHeight: 720, background: "radial-gradient(circle, rgba(99,102,241,0.55), transparent 60%)", filter: "blur(60px)" },
  glowB: { position: "absolute", right: "-15%", bottom: "-25%", width: "60vw", height: "60vw", maxWidth: 840, maxHeight: 840, background: "radial-gradient(circle, rgba(16,185,129,0.45), transparent 60%)", filter: "blur(70px)" },
  grid: { position: "absolute", inset: 0, opacity: 0.14, backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(circle at 50% 30%, black 0%, transparent 70%)" },

  center: { position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", justifyContent: "center", padding: 16 },
  wrap: { width: "min(1100px, 100%)", paddingTop: 18, paddingBottom: 24 },

  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  title: { fontSize: 26, fontWeight: 900 },
  sub: { marginTop: 4, opacity: 0.75, fontSize: 13 },

  actions: { display: "flex", gap: 10 },
  btnGhost: { padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", fontWeight: 900, cursor: "pointer" },
  btnDanger: { padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.14)", color: "#fecaca", fontWeight: 900, cursor: "pointer" },
  btnPrimary: { padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))", color: "white", fontWeight: 900, cursor: "pointer", minWidth: 160 },

  row: { marginTop: 14, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" },
  selectWrap: { flex: 1, minWidth: 260 },
  label: { fontSize: 12, opacity: 0.8, fontWeight: 900, marginBottom: 6 },
  select: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", outline: "none" },
  smallHint: { marginTop: 6, fontSize: 12, opacity: 0.7 },

  alert: { marginTop: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#fecaca", padding: 12, borderRadius: 14, fontSize: 13 },

  cards: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginTop: 14 },
  card: { borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(12,16,28,0.72)", backdropFilter: "blur(10px)", padding: 14 },
  cardTitle: { fontSize: 12, opacity: 0.75, fontWeight: 800 },
  cardValue: { fontSize: 28, fontWeight: 900, marginTop: 6 },

  panel: { marginTop: 14, borderRadius: 18, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(12,16,28,0.72)", backdropFilter: "blur(10px)", overflow: "hidden", padding: 14 },
  panelTitle: { fontSize: 16, fontWeight: 900, marginBottom: 10 },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "grid", gap: 6, marginBottom: 10 },
  input: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", outline: "none" },

  table: { width: "100%" },
  tHead: { display: "grid", gridTemplateColumns: "190px 110px 220px 1fr", gap: 10, padding: 12, fontWeight: 900, background: "rgba(255,255,255,0.04)", borderRadius: 14 },
  tRow: { display: "grid", gridTemplateColumns: "190px 110px 220px 1fr", gap: 10, padding: 12, borderTop: "1px solid rgba(255,255,255,0.06)", alignItems: "center" },

  pill: { padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 900, textTransform: "capitalize" },
  muted: { opacity: 0.75, fontSize: 13 },
  mutedSmall: { opacity: 0.7, fontSize: 12 },

  empty: { padding: 12, opacity: 0.7, fontSize: 13 },

  mobileList: { display: "none", gap: 12 },
  mobileItem: { borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", padding: 12 },
  mobileTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  mobileLabel: { fontSize: 11, opacity: 0.7, fontWeight: 900, marginBottom: 4 },
};