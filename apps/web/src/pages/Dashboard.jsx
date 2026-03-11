import { useEffect, useState } from "react";

function KpiCard({ title, value, sub }) {
  return (
    <div className="card">
      <div className="cardTop">
        <div className="title">{title}</div>
        <button className="dots">⋯</button>
      </div>
      <div className="value">{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Replace with your real API later
    // fetch("http://localhost:3000/stats").then(r => r.json()).then(setStats);
    setStats({
      total: 211,
      happy: 201,
      angry: 9,
      avg: 4.71,
      sla: "80.39%",
      live: 1,
      waiting: 0,
    });
  }, []);

  if (!stats) return <div className="page">Loading…</div>;

  return (
    <div className="page">
      <div className="grid">
        <div className="span2">
          <KpiCard title="Total feedback" value={stats.total} sub="Today" />
        </div>

        <KpiCard title="Happy" value={stats.happy} sub="Answered / good" />
        <KpiCard title="Angry" value={stats.angry} sub="Needs attention" />

        <KpiCard title="Avg score" value={stats.avg} sub="CSI-like" />
        <KpiCard title="SLA" value={stats.sla} sub="Last 60 min" />
        <KpiCard title="Live" value={stats.live} sub="Active now" />
        <KpiCard title="Waiting" value={stats.waiting} sub="Queue" />

        <div className="span3 card tall">
          <div className="cardTop">
            <div className="title">Recent feedback</div>
            <button className="dots">⋯</button>
          </div>

          <div className="table">
            <div className="row head">
              <div>Time</div>
              <div>Mood</div>
              <div>Comment</div>
            </div>

            {[
              { t: "15:01", m: "😊", c: "Great service" },
              { t: "14:58", m: "😐", c: "Okay" },
              { t: "14:50", m: "😡", c: "Too slow" },
            ].map((x, i) => (
              <div className="row" key={i}>
                <div>{x.t}</div>
                <div>{x.m}</div>
                <div className="muted">{x.c}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="span2 card tall">
          <div className="cardTop">
            <div className="title">Status blocks</div>
            <button className="dots">⋯</button>
          </div>

          <div className="statusGrid">
            <div className="status ok">
              <div className="statusNum">2</div>
              <div className="statusLabel">Online</div>
            </div>
            <div className="status warn">
              <div className="statusNum">0</div>
              <div className="statusLabel">Paused</div>
            </div>
            <div className="status info">
              <div className="statusNum">4</div>
              <div className="statusLabel">In progress</div>
            </div>
            <div className="status pink">
              <div className="statusNum">0</div>
              <div className="statusLabel">Active chat</div>
            </div>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
  .page{
    min-height:100vh;
    padding:24px;
    background:#0b1220;
    color:#e5e7eb;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
  }
  .grid{
    display:grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap:14px;
  }
  .card{
    background: linear-gradient(180deg, #0f1b33, #0b1428);
    border:1px solid rgba(255,255,255,.08);
    border-radius:14px;
    padding:14px;
    box-shadow: 0 10px 30px rgba(0,0,0,.25);
  }
  .tall{ min-height: 240px; }
  .span2{ grid-column: span 2; }
  .span3{ grid-column: span 3; }
  .cardTop{
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:10px;
  }
  .title{ font-size:13px; opacity:.85; }
  .dots{
    background:transparent;
    border:0;
    color:#9ca3af;
    font-size:18px;
    cursor:pointer;
  }
  .value{
    font-size:52px;
    font-weight:700;
    letter-spacing:-1px;
    line-height:1;
    margin-top:8px;
  }
  .sub{ margin-top:8px; font-size:12px; color:#9ca3af; }
  .table{ margin-top:10px; }
  .row{
    display:grid;
    grid-template-columns: 80px 60px 1fr;
    gap:10px;
    padding:10px 0;
    border-top:1px solid rgba(255,255,255,.06);
  }
  .head{ color:#9ca3af; font-size:12px; }
  .muted{ color:#cbd5e1; opacity:.9; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .statusGrid{
    margin-top:10px;
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap:12px;
  }
  .status{
    border-radius:12px;
    padding:14px;
    border:1px solid rgba(255,255,255,.10);
  }
  .statusNum{ font-size:40px; font-weight:800; line-height:1; }
  .statusLabel{ margin-top:6px; font-size:12px; opacity:.9; }
  .ok{ background:rgba(34,197,94,.18); }
  .warn{ background:rgba(245,158,11,.18); }
  .info{ background:rgba(59,130,246,.18); }
  .pink{ background:rgba(168,85,247,.18); }

  @media (max-width: 1100px){
    .grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .span2, .span3{ grid-column: span 2; }
    .value{ font-size:44px; }
  }
`;