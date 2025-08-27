import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../routes/api";
import "./ListEvaluation.css";

const STATUS_TEXT = { 0: "Evaluare", 1: "Public" }; // ajustează după cum dorești

export default function ListEvaluation() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/api/evaluations");
        if (alive) setRows(Array.isArray(data) ? data : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.name, r.year, r.type, r.profil, STATUS_TEXT[r.status]]
        .map((v) => (v ?? "").toString().toLowerCase())
        .some((v) => v.includes(s))
    );
  }, [rows, q]);

  return (
   <div className="page-bg">
    <div className="container">
      <div className="cc-toolbar">
        <h1>Evaluări</h1>
        <input
          className="cc-search"
          placeholder="Caută după nume, an, tip, profil…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="cc-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="cc-card skeleton" key={i} />
          ))}
        </div>
      ) : (
        <div className="cc-grid">
          {filtered.map((r) => (
            <div className="cc-card-wrap" key={r.id}>
              <article
                className="cc-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/evaluations/${r.id}`)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  navigate(`/evaluations/${r.id}`)
                }
              >
                <div className="cc-ribbon">
                  {STATUS_TEXT[r.status] ?? "Public"}
                </div>
                <div className="cc-body">
                  <h3 className="cc-title">{r.name ?? "Fără titlu"}</h3>
                  <p className="cc-desc">
                    {`Profil ${r.profil}.`}
                  </p>
                  <div className="cc-divider" />
                  <div className="cc-foot">
                    <span className="cc-left">
                      {r.year ?? "—"}
                    </span>
                    <span className="cc-right">{r.type ?? "—"}</span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  );
}
