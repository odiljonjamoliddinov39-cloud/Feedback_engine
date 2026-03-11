import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "/api";

export default function CustomerFlow() {
  const { slug } = useParams();

  const [company, setCompany] = useState(null);
  const [mood, setMood] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => !!mood && !loading, [mood, loading]);

  async function loadFlow(nextMood) {
    setErr("");
    setDone(false);
    setMood(nextMood);
    setTags([]);
    setComment("");
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/company/${slug}/flow`, {
        params: { mood: nextMood },
      });

      setCompany(res.data?.company || null);
      setBlocks(res.data?.blocks || []);
    } catch (e) {
      setBlocks([]);
      setCompany(null);
      setErr(e?.response?.data?.error || e.message || "Failed to load flow");
    } finally {
      setLoading(false);
    }
  }

  function toggleTag(t) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function submitFeedback() {
    setErr("");
    setDone(false);
    if (!mood) return setErr("Pick a mood first");

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/feedback`, {
        companySlug: slug,
        mood,
        tags,
        comment,
      });
      setDone(true);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  // nice default header even before mood chosen
  useEffect(() => {
    setCompany({ slug, name: "Demo Company", slogan: "The space to improve business" });
  }, [slug]);

  return (
    <div style={S.page}>
      <Background />

      <div style={S.center}>
        <div style={S.wrap}>
          <div style={S.header}>
            <div>
              <div style={S.title}>{company?.name || "Company"}</div>
              <div style={S.sub}>{company?.slogan || "How was your experience today?"}</div>
            </div>

            <div style={S.topLinks}>
              <Link to="/login" style={S.linkSoft}>Admin Login</Link>
            </div>
          </div>

          <div style={S.panel}>
            <div style={S.panelInner}>
              <div style={S.sectionTitle}>How was your experience?</div>

              <div style={S.moods}>
                <MoodBtn active={mood === "negative"} onClick={() => loadFlow("negative")} emoji="😡" label="Bad" />
                <MoodBtn active={mood === "neutral"} onClick={() => loadFlow("neutral")} emoji="😐" label="Okay" />
                <MoodBtn active={mood === "positive"} onClick={() => loadFlow("positive")} emoji="😍" label="Great" />
              </div>

              {err && <div style={S.alert}>{err}</div>}

              {loading && <div style={S.loading}>Loading…</div>}

              <div style={{ marginTop: 10 }}>
                {blocks.map((b, i) => {
                  if (b.type === "tag_selector") {
                    return (
                      <div key={i} style={S.block}>
                        <div style={S.blockTitle}>{b.title}</div>
                        <div style={S.tagsWrap}>
                          {(b.options || []).map((opt) => (
                            <button
                              key={opt}
                              onClick={() => toggleTag(opt)}
                              style={{ ...S.tag, ...(tags.includes(opt) ? S.tagOn : null) }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (b.type === "text_input") {
                    return (
                      <div key={i} style={S.block}>
                        <div style={S.blockTitle}>{b.title}</div>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder={b.placeholder || "Write here..."}
                          style={S.textarea}
                        />
                      </div>
                    );
                  }

                  if (b.type === "redirect") {
                    return (
                      <div key={i} style={S.block}>
                        <a href={b.url} target="_blank" rel="noreferrer" style={S.redirect}>
                          {b.label || "Open link"} →
                        </a>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              <div style={S.bottomRow}>
                <button
                  onClick={submitFeedback}
                  disabled={!canSubmit}
                  style={{ ...S.btn, opacity: canSubmit ? 1 : 0.55, cursor: canSubmit ? "pointer" : "not-allowed" }}
                >
                  {loading ? "Saving..." : "Submit"}
                </button>

                {done && <div style={S.saved}>✅ Saved</div>}
              </div>
            </div>
          </div>

          <div style={S.footerNote}>Tip: Share this link as a QR code: <span style={{ opacity: 0.9 }}>/c/{slug}</span></div>
        </div>
      </div>
    </div>
  );
}

function MoodBtn({ emoji, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...S.moodBtn, ...(active ? S.moodBtnOn : null) }}>
      <div style={{ fontSize: 20 }}>{emoji}</div>
      <div style={S.moodLabel}>{label}</div>
    </button>
  );
}

function Background() {
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

  center: { position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", justifyContent: "center", padding: 16 },
  wrap: { width: "min(900px, 100%)", paddingTop: 20, paddingBottom: 24 },

  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" },
  title: { fontSize: 26, fontWeight: 900, lineHeight: 1.1 },
  sub: { marginTop: 4, opacity: 0.75, fontSize: 13 },
  topLinks: { display: "flex", gap: 10 },
  linkSoft: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 13,
  },

  panel: {
    marginTop: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(12,16,28,0.72)",
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  },
  panelInner: { padding: 16 },

  sectionTitle: { fontSize: 16, fontWeight: 900 },
  moods: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
  moodBtn: {
    flex: "1 1 120px",
    minWidth: 120,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  moodBtnOn: { background: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.18)" },
  moodLabel: { fontWeight: 900, fontSize: 13, opacity: 0.9 },

  alert: {
    marginTop: 12,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#fecaca",
    padding: 12,
    borderRadius: 14,
    fontSize: 13,
  },
  loading: { marginTop: 12, opacity: 0.7, fontSize: 13 },

  block: { marginTop: 14 },
  blockTitle: { fontSize: 13, fontWeight: 900, opacity: 0.9, marginBottom: 8 },

  tagsWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 800,
  },
  tagOn: { background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.22)" },

  textarea: {
    width: "100%",
    minHeight: 120,
    resize: "vertical",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
  },

  redirect: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    textDecoration: "none",
    fontWeight: 900,
  },

  bottomRow: { marginTop: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  btn: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
    color: "white",
    fontWeight: 900,
    minWidth: 140,
  },
  saved: { fontWeight: 900, color: "#bbf7d0" },

  footerNote: { marginTop: 12, fontSize: 12, opacity: 0.7 },
};