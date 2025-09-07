import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../routes/api";
import "./ListTopics.css";

const STATUS_TEXT = { 0: "Topic", 1: "Public" };
const MIN_CHARS = 6;
// helpers pt. acces sigur
const roCmp = (a, b) => String(a).localeCompare(String(b), "ro");
const domainOf = (t) => t?.topic_content_unit?.topic_domain?.name ?? "";
const unitOf = (t) => t?.topic_content_unit?.name ?? "";

export default function ListTopics() {
  const [allRows, setAllRows] = useState([]); // toate evaluările (fără q)
  const [rows, setRows] = useState([]); // setul curent (allRows sau search)
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selTypes, setSelTypes] = useState(new Set());
  const [selProfils, setSelProfils] = useState(new Set());
  const [selYears, setSelYears] = useState(new Set());
  const [tooShort, setTooShort] = useState(false);

  // filtre locale
  const [selDomains, setSelDomains] = useState(new Set());
  const [selUnits, setSelUnits] = useState(new Set());

  const navigate = useNavigate();

  // 1) Fetch inițial: toate evaluările
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/topics"); // fără q
        const list = Array.isArray(data) ? data : data.data ?? [];
        if (alive) {
          setAllRows(list);
          setRows(list); // arătăm „toate” la început
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
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
        const { data } = await api.get("/api/topics", {
          params: { q: term },
          signal: ctrl.signal,
        });
        const list = Array.isArray(data) ? data : data.data ?? [];
        if (alive) setRows(list);
      } catch (_) {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    }, 300); // debounce

    return () => {
      alive = false;
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, allRows]);

  const domainOptions = useMemo(() => {
    return [...new Set(rows.map(domainOf).filter(Boolean))].sort(roCmp);
  }, [rows]);

  const unitsByDomain = useMemo(() => {
    const map = new Map();
    for (const t of rows) {
      const d = domainOf(t);
      const u = unitOf(t);
      if (!d || !u) continue;
      if (!map.has(d)) map.set(d, new Set());
      map.get(d).add(u);
    }
    return map;
  }, [rows]);

  const toggleIn = (setter) => (value) =>
    setter((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });

  const clearFilters = () => {
    setSelDomains(new Set());
    setSelUnits(new Set());
  };

  // 5) Când se schimbă domeniile, păstrează doar unitățile valide
  useEffect(() => {
    if (!selDomains.size) return;
    setSelUnits((prev) => {
      const keep = new Set();
      for (const u of prev) {
        for (const d of selDomains) {
          const units = unitsByDomain.get(d);
          if (units?.has(u)) {
            keep.add(u);
            break;
          }
        }
      }
      return keep;
    });
  }, [selDomains, unitsByDomain]);

  // 6) Dacă se schimbă rows (după căutare), prune selecția invalidă
  useEffect(() => {
    setSelDomains((prev) => {
      if (!prev.size) return prev;
      const valid = new Set(domainOptions);
      const keep = new Set();
      for (const d of prev) if (valid.has(d)) keep.add(d);
      return keep;
    });
    setSelUnits((prev) => {
      if (!prev.size) return prev;
      const allValid = new Set();
      for (const d of domainOptions) {
        for (const u of unitsByDomain.get(d) ?? []) {
          allValid.add(u);
        }
      }
      const keep = new Set();
      for (const u of prev) if (allValid.has(u)) keep.add(u);
      return keep;
    });
  }, [rows, domainOptions, unitsByDomain]);

  // 7) Filtrarea locală Domain/Unit peste rows (fără bySearch pe q!)
  const filtered = useMemo(() => {
    return rows.filter((t) => {
      const d = domainOf(t);
      const u = unitOf(t);
      const byDomain = selDomains.size ? selDomains.has(d) : true;
      const byUnit = selUnits.size ? selUnits.has(u) : true;
      return byDomain && byUnit;
    });
  }, [rows, selDomains, selUnits]);

  console.log(filtered);

  return (
    <div className="page-bg">
      <div className="container">
        <h1 className="page-title">Temele pentru BAC: teorie și aplicații</h1>

        <div className="layout">
          {/* ASIDE stânga */}
          <aside className="filters" aria-label="Filtre">
            <div className="filters-head">
              <h2>Filtre</h2>
              <button className="link-btn" onClick={clearFilters}>
                Resetează
              </button>
            </div>

            <div className="row">
              <strong>Domenii</strong>
              <ul className="domains-list">
                {domainOptions.map((d) => {
                  const active = selDomains.has(d);
                  const units = [...(unitsByDomain.get(d) ?? [])].sort(roCmp);
                  return (
                    <li key={d} className="domain-item">
                      <button
                        className={`chip ${active ? "active" : ""}`}
                        onClick={() => toggleIn(setSelDomains)(d)}
                        aria-expanded={active}
                      >
                        {d}
                      </button>

                      {active && !!units.length && (
                        <div className="units-row">
                          {units.map((u) => (
                            <button
                              key={u}
                              className={`chip small ${selUnits.has(u) ? "active" : ""}`}
                              onClick={() => toggleIn(setSelUnits)(u)}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
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
              {tooShort && (
                <div className="muted" style={{ marginTop: 6 }}>
                  Introdu cel puțin 6 caractere pentru a porni căutarea.
                </div>
              )}
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
                      onClick={() => navigate(`/topics/${r.id}`)}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        navigate(`/topics/${r.id}`)
                      }
                    >
                      <div className="cc-ribbon">
                        {STATUS_TEXT[r.status] ?? "Public"}
                      </div>
                      <div className="cc-body">
                        <h3 className="cc-title">{r.name ?? "Fără titlu"}</h3>
                        <p className="cc-desc">
                          {r.profil
                            ? `Profil ${r.profil}.`
                            : "Profil real, umanist"}
                        </p>
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
