import { useState, useEffect } from "react";
import api from "../routes/api";
import { useParams } from "react-router-dom";
import ResizableSplit from "./ResizableSplit";
import "../App.css";


export default function Evaluation() {
  const [answers, setAnswers] = useState({});

  const { id } = useParams();

  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(id);
  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/evaluations/${id}/tree`, {
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

  if (loading) return <div>Se încarcă…</div>;
  if (!tree) return <div>Evaluarea nu a fost găsită.</div>;
  console.log(tree);

  const done = Object.keys(answers).length;

  return (
    <div className="app">
      <header className="topbar">
        <h1>{tree?.name ?? ""}</h1>
        <div className="progress">
          Answered: 1/9
          {/* Answered: {done}/{questions.length} */}
        </div>
      </header>

      <ResizableSplit initial={50} minLeft={300} minRight={360}>
        {/* Stânga: textul sarcinii */}
        <section className="left reading">
          <div
            dangerouslySetInnerHTML={{
              __html: tree?.sources?.[0]?.content?.html,
            }}
          />
        </section>

        {/* Dreapta: întrebările 47–56 */}
        <aside className="right">
          <>
            {tree?.sources?.[0]?.items?.map((item) => (
              <div className="question" key={item.id ?? item.order_number}>
                <div className="q-head">
                  <span className="q-no">{item.order_number}</span>
                  {item?.task?.html && (
                    <div
                      className="q-text"
                      dangerouslySetInnerHTML={{ __html: item.task.html }}
                    />
                  )}
                </div>

                {item?.questions?.map((q) => {
                  const t    = String(q?.type || '').toLowerCase();
                  const inputId = `q-${q.id}`;
                  const rows = Number(q?.content_settings?.nr_rand ?? 4);
                  const max = rows * 75;      // 75 caractere/rând = total caractere
                  const val = answers?.[q.id] ?? "";

                  if (t === 'virtual') return null;

                  return (
                    <div className="free-answer" key={q.id}>
                      {t === 'input' ? (
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
                            <label htmlFor={`arg-${q.order_number}`} dangerouslySetInnerHTML={{ __html: q.task.html }} />
                          )}
                          <textarea
                            id={inputId}
                            rows={rows}
                            className="lined"
                            style={{ height: rows * 26 }}
                            maxLength={max}
                            value={val}
                            onChange={(e) => {
                              const v = e.target.value.slice(0, max);
                              setAnswers((prev) => ({ ...prev, [q.id]: v }));
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
            ))}
          </>
        </aside>
      </ResizableSplit>
    </div>
  );
}
