import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "/api";

export default function Register() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const pwScore = useMemo(() => scorePassword(password), [password]);
  const pwLabel = useMemo(() => {
    if (!password) return "Enter a password";
    if (pwScore <= 1) return "Weak";
    if (pwScore === 2) return "Okay";
    return "Strong";
  }, [pwScore, password]);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", res.data.token);
      nav("/admin", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.bg} aria-hidden="true">
        <div style={S.glowA} />
        <div style={S.glowB} />
        <div style={S.grid} />
      </div>

      <div style={S.center}>
        <div className="_auth_layout" style={S.layout}>
          {/* Left: brand/info (hidden on small screens) */}
          <div className="_auth_side" style={S.side}>
            <div style={S.brandRow}>
              <div style={S.logo}>FE</div>
              <div>
                <div style={S.brandTitle}>Feedback Engine</div>
                <div style={S.brandSub}>Create an account to manage feedback.</div>
              </div>
            </div>

            <div style={S.bullets}>
              <Bullet title="Fast setup" text="Create account and you’re in." />
              <Bullet title="One dashboard" text="See all feedback in one place." />
              <Bullet title="Clear insights" text="Mood + tags + comments, ready." />
            </div>
          </div>

          {/* Right: register card */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={S.cardTitle}>Create your account</div>
              <div style={S.cardSub}>Get access to the admin dashboard</div>
            </div>

            {err && <div style={S.alert}>{err}</div>}

            <form onSubmit={onSubmit} style={S.form}>
              <div style={S.field}>
                <label style={S.label}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  inputMode="email"
                  style={S.input}
                />
              </div>

              <div style={S.field}>
                <label style={S.label}>
                  Password <span style={{ opacity: 0.7 }}>(min 6)</span>
                </label>

                <div style={S.pwWrap}>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    style={{ ...S.input, paddingRight: 46 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={S.eyeBtn}
                    title={showPw ? "Hide" : "Show"}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>

                <div style={S.meterRow}>
                  <div style={S.meterWrap}>
                    <div style={{ ...S.meterFill, width: `${(pwScore / 3) * 100}%` }} />
                  </div>
                  <div style={S.meterLabel}>{pwLabel}</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                style={{ ...S.btn, opacity: canSubmit ? 1 : 0.55, cursor: canSubmit ? "pointer" : "not-allowed" }}
              >
                {loading ? "Creating..." : "Create account"}
              </button>

              <div style={S.footer}>
                <span style={{ opacity: 0.8 }}>Already have an account?</span>{" "}
                <Link to="/login" style={S.link}>
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <MobileCSS />
    </div>
  );
}

function Bullet({ title, text }) {
  return (
    <div style={S.bullet}>
      <div style={S.dot} />
      <div>
        <div style={S.bTitle}>{title}</div>
        <div style={S.bText}>{text}</div>
      </div>
    </div>
  );
}

function scorePassword(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) || /\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 3);
}

// Proper responsive CSS (no hacks)
function MobileCSS() {
  return (
    <style>{`
      @media (max-width: 860px) {
        ._auth_layout { grid-template-columns: 1fr !important; }
        ._auth_side { display: none !important; }
      }
    `}</style>
  );
}

const S = {
  page: { minHeight: "100vh", width: "100vw", position: "relative", overflow: "hidden" },

  bg: { position: "absolute", inset: 0, background: "#050812" },
  glowA: {
    position: "absolute",
    left: "-15%",
    top: "-20%",
    width: "55vw",
    height: "55vw",
    maxWidth: 720,
    maxHeight: 720,
    background: "radial-gradient(circle, rgba(99,102,241,0.55), transparent 60%)",
    filter: "blur(60px)",
  },
  glowB: {
    position: "absolute",
    right: "-15%",
    bottom: "-25%",
    width: "60vw",
    height: "60vw",
    maxWidth: 840,
    maxHeight: 840,
    background: "radial-gradient(circle, rgba(16,185,129,0.45), transparent 60%)",
    filter: "blur(70px)",
  },
  grid: {
    position: "absolute",
    inset: 0,
    opacity: 0.14,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
    backgroundSize: "64px 64px",
    maskImage: "radial-gradient(circle at 50% 30%, black 0%, transparent 70%)",
  },

  center: {
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  layout: {
    width: "min(980px, 100%)",
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 18,
    alignItems: "stretch",
  },

  side: {
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(12, 16, 28, 0.55)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  brandRow: { display: "flex", gap: 12, alignItems: "center" },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    letterSpacing: 0.5,
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
  },
  brandTitle: { fontSize: 18, fontWeight: 900 },
  brandSub: { fontSize: 13, opacity: 0.75, marginTop: 3 },

  bullets: { display: "grid", gap: 12, marginTop: 6 },
  bullet: { display: "flex", gap: 10, alignItems: "flex-start" },
  dot: {
    marginTop: 6,
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
    boxShadow: "0 0 0 4px rgba(255,255,255,0.06)",
  },
  bTitle: { fontSize: 13, fontWeight: 900 },
  bText: { fontSize: 13, opacity: 0.75, marginTop: 2, lineHeight: 1.35 },

  card: {
    width: "100%",
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(12, 16, 28, 0.78)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.50)",
  },

  cardHeader: { marginBottom: 10 },
  cardTitle: { fontSize: 22, fontWeight: 900, lineHeight: 1.1 },
  cardSub: { fontSize: 13, opacity: 0.75, marginTop: 4 },

  alert: {
    marginTop: 10,
    marginBottom: 6,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#fecaca",
    padding: 10,
    borderRadius: 12,
    fontSize: 13,
  },

  form: { display: "grid", gap: 12, marginTop: 10 },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 12, opacity: 0.9 },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
  },

  pwWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
  },

  meterRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 8 },
  meterWrap: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.10)",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  meterFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, rgba(239,68,68,1), rgba(245,158,11,1), rgba(16,185,129,1))",
    width: "0%",
    transition: "width 160ms ease",
  },
  meterLabel: { fontSize: 12, opacity: 0.8, minWidth: 92, textAlign: "right" },

  btn: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
    color: "white",
    fontWeight: 900,
  },

  footer: { fontSize: 13, textAlign: "center" },
  link: { color: "#a5b4fc", textDecoration: "none", fontWeight: 900 },
};