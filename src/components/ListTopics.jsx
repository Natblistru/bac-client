import { useEffect, useMemo, useRef, useState, useCallback, useDeferredValue, memo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../routes/api";
import "./ListTopics.css";

const STATUS_TEXT = { 0: "Topic", 1: "Public" };
const MIN_CHARS = 6;

// acces sigur
const domainOf = (t) => t?.topic_content_unit?.topic_domain?.name ?? "";
const unitOf   = (t) => t?.topic_content_unit?.name ?? "";

/** card topic (memo ca să nu re-randeze toată lista la fiecare mică schimbare) */
const TopicCard = memo(function TopicCard({ r, onOpen }) {
  return (
    <div className="cc-card-wrap" key={r.id}>
      <article
        className="cc-card"
        role="button"
        tabIndex={0}
        data-id={r.id}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpen(e);
        }}
      >
        <div className="cc-ribbon">{STATUS_TEXT[r.status] ?? "Public"}</div>
        <div className="cc-body">
          <h3 className="cc-title">{r.name ?? "Fără titlu"}</h3>
          <p className="cc-desc">{r.profil ? `Profil ${r.profil}.` : "Profil real, umanist"}</p>
          <div className="cc-divider" />
          <div className="cc-foot">
            <span className="cc-left">{r.year ?? "—"}</span>
            <span className="cc-right">{r.type ?? "—"}</span>
          </div>
        </div>
      </article>
    </div>
  );
});

export default function ListTopics() {
  const [allRows, setAllRows] = useState([]);  // colecția de bază
  const [rows, setRows]       = useState([]);  // rezultat curent (toate sau căutare)
  const [loading, setLoading] = useState(false);

  const [q, setQ]             = useState("");
  const deferredQ             = useDeferredValue(q);  // UI rămâne fluid cât tastezi
  const [tooShort, setTooShort] = useState(false);

  // filtre locale
  const [selDomains, setSelDomains] = useState(() => new Set());
  const [selUnits, setSelUnits]     = useState(() => new Set());

  const navigate = useNavigate();

  // --- fetch inițial
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/topics");
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        if (alive) {
          setAllRows(list);
          setRows(list);
        }
      } catch {/* ignore */} 
      finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // --- căutare (debounced, abortable)
  const debounceRef = useRef(null);
  useEffect(() => {
    const term = deferredQ.trim();

    if (term !== "" && term.length < MIN_CHARS) {
      setTooShort(true);
      setRows(allRows);
      return;
    }
    setTooShort(false);

    if (term === "") {
      setRows(allRows);
      return;
    }

    let alive = true;
    const ctrl = new AbortController();

    // debounce stabil (nu recreăm funcția)
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/topics", {
          params: { q: term },
          signal: ctrl.signal,
        });
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        if (alive) setRows(list);
      } catch {/* ignore */} 
      finally {
        if (alive) setLoading(false);
      }
    }, 300);

    return () => {
      alive = false;
      clearTimeout(debounceRef.current);
      ctrl.abort();
    };
  }, [deferredQ, allRows]);

  // --- derive: domenii & unități (din rows curente)
  const { domainOptions, unitsByDomain } = useMemo(() => {
    // Map domeniu -> Set(unități)
    const map = new Map();
    for (const t of rows) {
      const d = domainOf(t);
      const u = unitOf(t);
      if (!d) continue;
      if (!map.has(d)) map.set(d, new Set());
      if (u) map.get(d).add(u);
    }
    // array stabil pentru domenii (alfabetic pentru UX previzibil, schimbă la nevoie)
    const doms = Array.from(map.keys()).sort((a, b) =>
      String(a).localeCompare(String(b), "ro")
    );
    return { domainOptions: doms, unitsByDomain: map };
  }, [rows]);

  // --- handlere stabile (nu mai recreează funcții la fiecare render)
  const onSearchChange = useCallback((e) => setQ(e.target.value), []);
  const onOpenCard = useCallback((e) => {
    const id = e.currentTarget?.dataset?.id;
    if (id) navigate(`/topics/${id}`);
  }, [navigate]);

  const toggleIn = useCallback((setter, value) => {
    setter(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }, []);
  const clearFilters = useCallback(() => {
    setSelDomains(new Set());
    setSelUnits(new Set());
  }, []);

  // --- sincronizare selecții când se schimbă domeniile/unitățile valide
  useEffect(() => {
    if (!selDomains.size) return;
    setSelUnits((prev) => {
      const keep = new Set();
      for (const u of prev) {
        for (const d of selDomains) {
          const setU = unitsByDomain.get(d);
          if (setU?.has(u)) { keep.add(u); break; }
        }
      }
      return keep;
    });
  }, [selDomains, unitsByDomain]);

  useEffect(() => {
    // prune domenii invalide
    setSelDomains(prev => {
      if (!prev.size) return prev;
      const valid = new Set(domainOptions);
      const keep = new Set();
      for (const d of prev) if (valid.has(d)) keep.add(d);
      return keep;
    });
    // prune unități invalide
    setSelUnits(prev => {
      if (!prev.size) return prev;
      const allValid = new Set();
      for (const d of domainOptions) {
        const setU = unitsByDomain.get(d);
        if (setU) for (const u of setU) allValid.add(u);
      }
      const keep = new Set();
      for (const u of prev) if (allValid.has(u)) keep.add(u);
      return keep;
    });
  }, [rows, domainOptions, unitsByDomain]);

  // --- filtrarea locală (memoizată)
  const filtered = useMemo(() => {
    const byDomainActive = selDomains.size > 0;
    const byUnitActive   = selUnits.size > 0;

    if (!byDomainActive && !byUnitActive) return rows;

    return rows.filter((t) => {
      const d = domainOf(t);
      const u = unitOf(t);
      const okD = byDomainActive ? selDomains.has(d) : true;
      const okU = byUnitActive   ? selUnits.has(u)   : true;
      return okD && okU;
    });
  }, [rows, selDomains, selUnits]);

  return (
    <div className="page-bg">
      <div className="container">
        <h1 className="page-title">Temele pentru BAC: teorie și aplicații</h1>

        <div className="layout">
          {/* ASIDE */}
          <aside className="filters" aria-label="Filtre">
            <div className="filters-head">
              <h2>Filtre</h2>
              <button className="link-btn" onClick={clearFilters}>Resetează</button>
            </div>

            <div className="row">
              <strong>Domenii</strong>
              <ul className="domains-list">
                {domainOptions.map((d) => {
                  const active = selDomains.has(d);
                  const unitsSet = unitsByDomain.get(d);
                  const units = unitsSet ? Array.from(unitsSet).sort((a, b) =>
                    String(a).localeCompare(String(b), "ro")
                  ) : [];

                  return (
                    <li key={d} className="domain-item">
                      <button
                        className={`chip ${active ? "active" : ""}`}
                        onClick={() => toggleIn(setSelDomains, d)}
                        aria-expanded={active}
                      >
                        {d}
                      </button>

                      {active && units.length > 0 && (
                        <div className="units-row">
                          {units.map((u) => (
                            <button
                              key={u}
                              className={`chip small ${selUnits.has(u) ? "active" : ""}`}
                              onClick={() => toggleIn(setSelUnits, u)}
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

          {/* CONȚINUT */}
          <main>
            <div className="cc-searchbar">
              <input
                className="cc-search"
                placeholder="Caută după conținut…"
                value={q}
                onChange={onSearchChange}
              />
              {tooShort && (
                <div className="muted" style={{ marginTop: 6 }}>
                  Introdu cel puțin {MIN_CHARS} caractere pentru a porni căutarea.
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
              <div className="cc-grid" style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}>
                {filtered.map((r) => (
                  <TopicCard key={r.id} r={r} onOpen={onOpenCard} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
