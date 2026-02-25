import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://friendly-dollop-4jrx7jg77645fqrp5-3001.app.github.dev";

export default function CustomerFlow() {
  const { slug } = useParams();

  const [mood, setMood] = useState(null); // ✅ define mood
  const [blocks, setBlocks] = useState([]);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function loadMood(nextMood) {
    setError("");
    setDone(false);
    setMood(nextMood);
    setTags([]);
    setComment("");

    try {
      const res = await axios.get(`${API_BASE}/api/company/${slug}/flow`, {
        params: { mood: nextMood }
      });
      setBlocks(res.data.blocks || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  }

  function toggleTag(t) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function submitFeedback() {
    setError("");
    if (!mood) return setError("Pick a mood first");

    try {
      await axios.post(`${API_BASE}/api/feedback`, {
        companySlug: slug,
        mood,
        tags,
        comment
      });
      setDone(true);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>How was your experience?</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => loadMood("negative")}>😡</button>
        <button onClick={() => loadMood("neutral")}>😐</button>
        <button onClick={() => loadMood("positive")}>😍</button>
      </div>

      {error && <p style={{ color: "tomato" }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
        {blocks.map((b, i) => {
          if (b.type === "tag_selector") {
            return (
              <div key={i} style={{ marginTop: 14 }}>
                <strong>{b.title}</strong>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {b.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleTag(opt)}
                      style={{
                        border: "1px solid #444",
                        padding: "6px 10px",
                        borderRadius: 10,
                        background: tags.includes(opt) ? "#fff" : "transparent",
                        color: tags.includes(opt) ? "#000" : "#fff"
                      }}
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
              <div key={i} style={{ marginTop: 14 }}>
                <strong>{b.title}</strong>
                <div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={b.placeholder}
                    style={{ width: 420, height: 120, marginTop: 8 }}
                  />
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {mood && blocks.length > 0 && (
        <button onClick={submitFeedback} style={{ marginTop: 18 }}>
          Submit
        </button>
      )}

      {done && <p style={{ marginTop: 12 }}>✅ Saved</p>}
    </div>
  );
}
