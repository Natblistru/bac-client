import { useState, useEffect, useMemo } from "react";
import api from "../routes/api";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth";
import ResizableSplit from "./ResizableSplit";
import EvalAnswersModal from "./EvalAnswersModal";
import "../App.css";


export default function Evaluation() {
  const [answers, setAnswers] = useState({});
  const [srcIndex, setSrcIndex] = useState(0); // <- indexul sursei curente
  const [highlight, setHighlight] = useState(null); // <- id-ul item evidențiat

  const { id } = useParams();
  const navigate = useNavigate();

  const [hoverLink, setHoverLink] = useState(null);
  const toTopicURL = (id) => `/topics/${id}`; 

  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  const { me, requireAuth } = useAuth();
  const studentId = Number(localStorage.getItem("auth.student_id")) || null;

  const [evalModal, setEvalModal] = useState({
    open: false,
    data: [],
  });

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/evaluations/${id}/tree/${studentId}`, {
          signal: ctrl.signal,
        });
        if (alive) setTree(data);
      } catch (e) {
        // handle err (opțional)
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [id]);

  const sources = tree?.sources ?? [];
  const src = sources[srcIndex] ?? null;

  // Listează toate întrebările (non-virtuale) din sursa curentă
  const questions = useMemo(() => {
    if (!src?.items) return [];
    return src.items.flatMap((it) => it?.questions ?? [])
      .filter((q) => String(q?.type || "").toLowerCase() !== "virtual");
  }, [src]);

  const total = questions.length;

  const done = useMemo(() => {
    const setIds = new Set(questions.map((q) => q.id));
    return Object.entries(answers).reduce((acc, [qid, val]) => {
      if (!setIds.has(Number(qid))) return acc;
      const v = (val ?? "").toString().trim();
      return acc + (v.length > 0 ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  if (loading) return <div>Se încarcă…</div>;
  if (!tree) return <div>Evaluarea nu a fost găsită.</div>;
  // console.log(tree);

  // Stiluri inline pentru footer fix
const footerStyle = {
  position: "fixed",
  left: 0, right: 0, bottom: 0,
  background: "linear-gradient(180deg, #f2f3f4 0%, #e6e8eb 100%)",
  borderTop: "1px solid #cfd3d7",
  boxShadow: "0 -1px 0 rgba(0,0,0,.04), 0 -4px 8px rgba(0,0,0,.06)",
  padding: "6px 8px",
  zIndex: 100
};
const rowStyle = {
  display: "flex",
  gap: 8,
  alignItems: "stretch",
  justifyContent: "center",
  flexWrap: "nowrap",
  overflowX: "auto",     // dacă sunt multe, să poți derula
  userSelect: "none",
  paddingBottom: 2
};

// ajustează tileStyle: să nu se întindă
const tileStyle = (active) => ({
  flex: "0 0 auto",      // << cheie: latime = cât cere conținutul
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "8px 12px",
  background: active
    ? "linear-gradient(180deg, #e8edf6 0%, #dbe5f9 100%)"
    : "linear-gradient(180deg, #f6f7f8 0%, #eceef1 100%)",
  color: "#111827",
  fontWeight: 600,
  border: "1px solid #d4d8dd",
  borderRadius: 4,
  cursor: active ? "default" : "pointer",
  transition: "background .15s ease",
  minHeight: 34,
  whiteSpace: "nowrap"   // textul rămâne pe o linie
});
const tileNameStyle = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: .9 };
const progressStyle = { marginLeft: "auto", fontSize: 12, color: "#4b5563", fontWeight: 600, opacity: .95 };

// containerul „subbutoanelor” în tile activ
const subnavWrap = {
  marginLeft: "auto",
  display: "flex",
  gap: 8,
  alignItems: "center",
  overflowX: "auto",
  whiteSpace: "nowrap",
  paddingBottom: 2
};
// stil subbuton
const chipStyle = (active) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 26,
  height: 22,
  padding: "0 6px",
  borderRadius: 6,
  border: `1px solid ${active ? "#3b82f6" : "#cfd3d7"}`,
  background: active ? "#e8f0ff" : "#f4f5f7",
  color: active ? "#1e3a8a" : "#374151",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  userSelect: "none"
});

// număr de items în sursă
const itemsCount = (s) => (s?.items?.length ?? 0);

//const done = Object.keys(answers).length;

const openAnswersModal = (item) => {
  if (!requireAuth()) {
    return;
  }

  const qs = Array.isArray(item?.questions) ? item.questions : [];
  setEvalModal({ open: true, data: qs });
};

const closeAnswersModal = () => {
  setEvalModal({ open: false, data: [] });
};

  return (
    <div className="app">
      <header className="topbar">
        <h1>{tree?.name ?? ""}</h1>
        <div style={{display: "flex", gap: "12px"}}>
          <div className="progress">
            Answered: 1/9
            {/* Answered: {done}/{questions.length} */}
          </div>
        </div>
      </header>

      <ResizableSplit initial={50} minLeft={300} minRight={360}>
        {/* Stânga: textul sarcinii */}
        <section className="left reading">
          <div
            dangerouslySetInnerHTML={{
              __html: src?.content?.html ?? "",
            }}
          />
        </section>

        {/* Dreapta: întrebările 47–56 */}
        <aside className="right">
          <>
          {src?.items?.map((item, idx) => {
            const n = item?.order_number ?? idx + 1;
            const anchorId = `item-${srcIndex}-${n}`;
            const isHi = highlight?.src === srcIndex && highlight?.itemKey === anchorId;

            return (
              <div
                className="question"
                id={anchorId}
                key={item.id ?? item.order_number ?? idx}
                onMouseLeave={() => {
                  setHoverLink((prev) => prev?.itemKey === anchorId ? null : prev);
                }}
                style={isHi ? { outline: "2px solid #3b82f6", borderRadius: 6 } : undefined}
              >
                <div className="q-head">
                  <span className="q-no">{item.order_number}</span>

                  {/* ICON: apare numai când textarea-ul de sub acest item e în hover */}
                  {hoverLink?.itemKey === anchorId && hoverLink?.topicId && !evalModal.open && (
                    <button
                      type="button"
                      className="jump-badge"
                      title="Deschide pagina temei"
                      aria-label="Deschide pagina temei"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(toTopicURL(hoverLink.topicId));
                      }}
                    >
                      Vezi tema
                    </button>
                  )}

                  <button
                    type="button"
                    className="eval-start-icon"
                    title="Începe evaluarea"
                    aria-label="Începe evaluarea"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAnswersModal(item); // vezi funcția mai jos
                    }}
                  >
                    ▶
                  </button>

                  {item?.task?.html && (
                    <div
                      className="q-text"
                      dangerouslySetInnerHTML={{ __html: item.task.html }}
                    />
                  )}
                </div>

                {item?.questions?.map((q) => {
                  const t = String(q?.type || "").toLowerCase();
                  const inputId = `q-${q.id}`;
                  const rows = Number(q?.content_settings?.nr_rand ?? 4);
                  const max = rows * 75; // 75 caractere/rând
                  const val = answers?.[q.id] ?? "";

                  if (t === "virtual") return null;

                  return (
                    <div className="free-answer" key={q.id}>
                      {t === "input" ? (
                        <div className="field-row">
                          {q?.task?.html && (
                            <label
                              htmlFor={inputId}
                              className="q-task"
                              dangerouslySetInnerHTML={{ __html: q.task.html }}
                            />
                          )}
                          <input
                            id={inputId}
                            type="text"
                            placeholder={q.placeholder || "scrie aici…"}
                            value={val}
                            maxLength={max}
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <div className="field-col">
                          {q?.task?.html && (
                            <label
                              htmlFor={`arg-${q.order_number}`}
                              dangerouslySetInnerHTML={{ __html: q.task.html }}
                            />
                          )}
                          <textarea
                            id={inputId}
                            rows={rows}
                            className="lined"
                            maxLength={max}
                            value={val}
                            onChange={(e) => {
                              const v = e.target.value.slice(0, max);
                              setAnswers((prev) => ({ ...prev, [q.id]: v }));
                            }}

                            onMouseEnter={() => {
                              if (q?.topic_id) {
                                setHoverLink({
                                  itemKey: anchorId,
                                  topicId: q.topic_id,
                                });
                              }
                            }}


                          />
                          <div className="char-count">
                            {val.length}/{max}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          </>
        </aside>
      </ResizableSplit>

      {/* FOOTER FIX cu butoane pentru surse */}
      <footer style={footerStyle}>
        <nav style={rowStyle} aria-label="Navigare surse">
          {sources.map((s, i) => {
            const active = i === srcIndex;
            const label = s?.name || `Subiectul ${i + 1}`;
            const totalItems = itemsCount(s);

            return (
              <div
                key={i}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                title={label}
                style={tileStyle(active)}
                onClick={() => {
                  if (active) return;
                  setSrcIndex(i);
                  // păstrează answers (nu resetăm aici)
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !active) {
                    e.preventDefault();
                    setSrcIndex(i);
                  }
                }}
              >
                <span style={tileNameStyle}>{label}</span>

                {active ? (
                  <div style={subnavWrap} aria-label={`Items for ${label}`}>
                    {(s?.items ?? []).map((it, j) => {
                      const n = it?.order_number ?? j + 1;
                      const anchorId = `item-${i}-${n}`;
                      const chipActive =
                        highlight?.src === i && highlight?.itemKey === anchorId;

                      return (
                        <span
                          key={anchorId}
                          role="button"
                          tabIndex={0}
                          title={`Jump to ${label} – ${n}`}
                          style={chipStyle(chipActive)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setHighlight({ src: i, itemKey: anchorId });
                            const el = document.getElementById(anchorId);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              setHighlight({ src: i, itemKey: anchorId });
                              const el = document.getElementById(anchorId);
                              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }}
                        >
                          {n}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span style={progressStyle}>0 of {totalItems}</span>
                )}
              </div>
            );
          })}
        </nav>
      </footer>

      {evalModal.open && (
        <EvalAnswersModal data={evalModal.data} onClose={closeAnswersModal} />
      )}
    </div>
  );
}
