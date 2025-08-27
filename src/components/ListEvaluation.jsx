import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../routes/api";
import "./ListEvaluation.css";

const STATUS_TEXT = { 0: "Evaluare", 1: "Public" };
const MIN_CHARS = 6;

export default function ListEvaluation() {
  const [allRows, setAllRows] = useState([]);   // toate evaluările (fără q)
  const [rows, setRows] = useState([]);         // setul curent (allRows sau search)
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selTypes, setSelTypes] = useState(new Set());
  const [selProfils, setSelProfils] = useState(new Set());
  const [selYears, setSelYears] = useState(new Set());
  const [tooShort, setTooShort] = useState(false);

  const navigate = useNavigate();

  // 1) Fetch inițial: toate evaluările
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/evaluations"); // fără q
        const list = Array.isArray(data) ? data : (data.data ?? []);
        if (alive) {
          setAllRows(list);
          setRows(list); // arătăm „toate” la început
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 2) Căutare doar când q.length ≥ 6; altfel revii la allRows
  useEffect(() => {
    const term = q.trim();

    // caz: 1..5 caractere → nu căuta, arată „toate”
    if (term !== "" && term.length < MIN_CHARS) {
      setTooShort(true);
      setRows(allRows);
      return; // fără request
    }
    setTooShort(false);

    // caz: șir gol → toate
    if (term === "") {
      setRows(allRows);
      return;
    }

    // caz: term.length ≥ 6 → căutare în content (backend)
    let alive = true;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/evaluations", {
          params: { q: term },
          signal: ctrl.signal,
        });
        const list = Array.isArray(data) ? data : (data.data ?? []);
        if (alive) setRows(list);
      } catch (_) {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    }, 300); // debounce

    return () => { alive = false; clearTimeout(t); ctrl.abort(); };
  }, [q, allRows]);

  // opțiuni pentru filtre
  const typeOptions = useMemo(
    () => [...new Set(rows.map(r => r.type).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'ro')),
    [rows]
  );
  const profilOptions = useMemo(
    () => [...new Set(rows.map(r => r.profil).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'ro')),
    [rows]
  );
  const yearOptions = useMemo(
    () => [...new Set(rows.map(r => r.year).filter(v => v != null))].sort((a,b)=>Number(b)-Number(a)),
    [rows]
  );

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

  // DOAR filtre locale (fără bySearch pe q!)
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const byType   = selTypes.size   ? selTypes.has(String(r.type))     : true;
      const byProfil = selProfils.size ? selProfils.has(String(r.profil)) : true;
      const byYear   = selYears.size   ? selYears.has(String(r.year))     : true;
      return byType && byProfil && byYear;
    });
  }, [rows, selTypes, selProfils, selYears]);

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
              {tooShort && <div className="muted" style={{marginTop: 6}}>
                Introdu cel puțin 6 caractere pentru a porni căutarea.
              </div>}
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