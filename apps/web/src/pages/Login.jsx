import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "/api";

export default function Login() {
  const nav = useNavigate();
  const isMobile = window.innerWidth < 860;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const canSubmit = useMemo(() => email.trim() && password && !loading, [email, password, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email: email.trim(), password });
      localStorage.setItem("token", res.data.token);
      nav("/admin", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.bg} />

      <div style={S.center}>
        <div
          style={{
            ...S.layout,
            gridTemplateColumns: isMobile ? "1fr" : "1fr 420px",
          }}
        >
          {!isMobile && (
            <div style={S.side}>
              <BrandPanel />
            </div>
          )}

          <div style={S.card}>
            <div style={S.cardTitle}>Welcome back</div>
            <div style={S.cardSub}>Sign in to your dashboard</div>

            {err && <div style={S.alert}>{err}</div>}

            <form onSubmit={onSubmit} style={S.form}>
              <div style={S.field}>
                <label style={S.label}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={S.input}
                />
              </div>

              <div style={S.field}>
                <label style={S.label}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    style={{ ...S.input, paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={S.eyeBtn}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  ...S.btn,
                  opacity: canSubmit ? 1 : 0.5,
                }}
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <div style={S.footer}>
                No account? <Link to="/register" style={S.link}>Create one</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <>
      <div style={S.brandTitle}>Feedback Engine</div>
      <div style={S.brandSub}>Turn customer mood into measurable action.</div>

      <div style={{ marginTop: 20 }}>
        <Bullet text="Secure admin dashboard" />
        <Bullet text="Live feedback monitoring" />
        <Bullet text="Company link + QR ready" />
      </div>
    </>
  );
}

function Bullet({ text }) {
  return (
    <div style={{ marginTop: 12, opacity: 0.8 }}>
      • {text}
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at 30% 20%, #1e293b, #050812)",
    color: "white",
  },
  bg: {
    position: "absolute",
    inset: 0,
    opacity: 0.1,
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  layout: {
    width: "100%",
    maxWidth: 1000,
    display: "grid",
    gap: 20,
  },
  side: {
    padding: 24,
    borderRadius: 18,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 800,
  },
  brandSub: {
    marginTop: 6,
    opacity: 0.7,
  },
  card: {
    padding: 24,
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(8px)",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 800,
  },
  cardSub: {
    marginBottom: 16,
    opacity: 0.7,
  },
  alert: {
    background: "rgba(255,0,0,0.1)",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  form: {
    display: "grid",
    gap: 14,
  },
  field: {
    display: "grid",
    gap: 6,
  },
  label: {
    fontSize: 13,
    opacity: 0.8,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
  },
  eyeBtn: {
    position: "absolute",
    right: 6,
    top: 6,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "white",
  },
  btn: {
    padding: 12,
    borderRadius: 10,
    background: "linear-gradient(135deg, #6366f1, #10b981)",
    border: "none",
    color: "white",
    fontWeight: 700,
  },
  footer: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
  },
  link: {
    color: "#a5b4fc",
    fontWeight: 600,
  },
};