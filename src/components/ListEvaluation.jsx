import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../routes/api";
import "./ListEvaluation.css";

const STATUS_TEXT = { 0: "Evaluare", 1: "Public" };

export default function ListEvaluation() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // seturi pentru selecții multiple
  const [selTypes, setSelTypes] = useState(new Set());
  const [selProfils, setSelProfils] = useState(new Set());
  const [selYears, setSelYears] = useState(new Set());

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
    return () => { alive = false; };
  }, []);

  // opțiuni unice pentru filtre (din backend)
  const typeOptions = useMemo(
    () => [...new Set(rows.map(r => r.type).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'ro')),
    [rows]
  );
  const profilOptions = useMemo(
    () => [...new Set(rows.map(r => r.profil).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'ro')),
    [rows]
  );
  const yearOptions = useMemo(
    () => [...new Set(rows.map(r => r.year).filter(v => v !== null && v !== undefined))]
            .sort((a,b)=>Number(b)-Number(a)),
    [rows]
  );

  // utilitare pentru toggle în Set
  const toggleIn = (setter) => (value) =>
    setter(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });

  const clearFilters = () => {
    setSelTypes(new Set());
    setSelProfils(new Set());
    setSelYears(new Set());
  };

  // filtrarea combinată (cautare + filtre multiple)
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(r => {
      const bySearch =
        !s ||
        [r.name, r.year, r.type, r.profil, STATUS_TEXT[r.status]]
          .map(v => (v ?? "").toString().toLowerCase())
          .some(v => v.includes(s));

      const byType   = selTypes.size   ? selTypes.has(String(r.type))   : true;
      const byProfil = selProfils.size ? selProfils.has(String(r.profil)) : true;
      const byYear   = selYears.size   ? selYears.has(String(r.year))   : true;

      return bySearch && byType && byProfil && byYear;
    });
  }, [rows, q, selTypes, selProfils, selYears]);

  return (
    <div className="page-bg">
      <div className="container">
        <h1 className="page-title">BAC – Examen național pentru clasa a XII-a:</h1>

        <div className="layout">
          {/* ASIDE stânga */}
          <aside className="filters" aria-label="Filtre">
            <div className="filters-head">
              <h2>Filtre</h2>
              <button className="link-btn" onClick={clearFilters}>Resetează</button>
            </div>

            <FilterGroup
              title="Tip"
              options={typeOptions}
              selected={selTypes}
              onToggle={toggleIn(setSelTypes)}
            />
            <FilterGroup
              title="Profil"
              options={profilOptions}
              selected={selProfils}
              onToggle={toggleIn(setSelProfils)}
            />
            <FilterGroup
              title="An"
              options={yearOptions}
              selected={selYears}
              onToggle={toggleIn(setSelYears)}
            />
          </aside>

          {/* CONȚINUT dreapta */}
          <main>
            <div className="cc-searchbar">
              <input
                className="cc-search"
                placeholder="Caută după conținut…"
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
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(`/evaluations/${r.id}`)}
                    >
                      <div className="cc-ribbon">{STATUS_TEXT[r.status] ?? "Public"}</div>
                      <div className="cc-body">
                        <h3 className="cc-title">{r.name ?? "Fără titlu"}</h3>
                        <p className="cc-desc">{r.profil ? `Profil ${r.profil}.` : "—"}</p>
                        <div className="cc-divider" />
                        <div className="cc-foot">
                          <span className="cc-left">{r.year ?? "—"}</span>
                          <span className="cc-right">{r.type ?? "—"}</span>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* mic component pentru grup de checkbox-uri */
function FilterGroup({ title, options, selected, onToggle }) {
  return (
    <section className="filter-group">
      <h3>{title}</h3>
      <div className="checklist">
        {options.length === 0 && <div className="muted">—</div>}
        {options.map((opt) => {
          const val = String(opt);
          const id = `${title}-${val}`;
          return (
            <label key={id} htmlFor={id} className="chk">
              <input
                id={id}
                type="checkbox"
                checked={selected.has(val)}
                onChange={() => onToggle(val)}
              />
              <span>{val}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}