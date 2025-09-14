import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DraggableModal from "./DraggableModal"
import "./EvalItemsSlider.css"

export default function EvalItemsSlider({ items }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [srcModal, setSrcModal] = useState({ open: false, html: "" });

  const openSource = (html) => {
    setSrcModal({ open: true, html: html || "" });
  };
  const closeSource = () => setSrcModal({ open: false, html: "" });

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

useEffect(() => {
  const el = trackRef.current;
  if (!el) return;

  const indexFromScroll = () =>
    Math.round(el.scrollLeft / el.clientWidth || 0);

  let observed = null;
  let raf = 0;
  let pending = false;

  const applyNow = () => {
    pending = false;

    const idx = indexFromScroll();
    const slide = el.children[idx];
    if (!slide) return;

    // alege una: offsetHeight / scrollHeight / getBoundingClientRect().height
    const h = slide.offsetHeight; // stabil & rapid
    const px = `${h}px`;

    console.log(px)

    if (el.style.height !== px) {
      el.style.height = px;
    }

    console.log(el.style.height)
    console.log(el)

    if (observed !== slide) {
      if (observed) ro.unobserve(observed);
      observed = slide;
      ro.observe(slide); // observăm DOAR slide-ul curent
    }
  };

  const scheduleApply = () => {
    if (pending) return;
    pending = true;
    raf = requestAnimationFrame(applyNow);
  };

  const ro = new ResizeObserver(() => {
    // nu modifica layout aici — doar programează-l
    scheduleApply();
  });

  const onScroll = () => scheduleApply();
  const onResize = () => scheduleApply();

  // init după ce există layout
  scheduleApply();

  el.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  return () => {
    el.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    ro.disconnect();
    cancelAnimationFrame(raf);
  };
}, [items]);



  const nudge = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // const w = Math.max(260, el.clientWidth * 0.9);
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  if (!items?.length) return null;

  return (
  <div className="subslider">
    <div className="subslider-track" ref={trackRef}>
      {items?.map((item, idx) => {


        return (
          <div className="subslide" key={item.id ?? idx}>
            <div className="subslide-card">
                {item?.task?.html && (
                  <>
                <article
                  className="q-text topic-content reading"
                  dangerouslySetInnerHTML={{ __html: item.task?.html }}
                />
                  {item?.short_source_content?.html && (
                    <button
                      type="button"
                      className="src-link"
                      onClick={() =>
                        openSource(item.short_source_content?.html || "")
                      }
                    >
                      Sursa
                    </button>
                  )}
                </>
              )}


            {item?.evaluation_questions?.map((q) => {
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
                            dangerouslySetInnerHTML={{ __html: q.task?.html || "" }}
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
                          dangerouslySetInnerHTML={{ __html: q.task?.html || "" }}
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
                      />
                      <div className="char-count">
                        {val.length}/{max}
                      </div>
                    </div>
                  )}        
                  </div>
                );
              })}

              {(() => {
                const ev = item?.evaluation_source?.evaluation;
                if (!ev?.id) return null;

                const label = ev?.profil
                  ? `${ev.name}, profil ${ev.profil}`
                  : ev.name;

                return (
                  <Link
                    className="eval-link"
                    to={`/evaluations/${ev.id}`}
                    title="Deschide pagina evaluării"
                  >
                    {label}
                  </Link>
                );
              })()}

              {srcModal.open && (
                <DraggableModal
                  title="Sursa"
                  html={srcModal.html}
                  onClose={closeSource}
                />
              )}


            </div>
          </div>
        );
      })}
    </div>

    <button type="button" className="subslider-nav prev"
            onClick={() => nudge(-1)} disabled={!canPrev} aria-label="Previous">‹</button>
    <button type="button" className="subslider-nav next"
            onClick={() => nudge(1)} disabled={!canNext} aria-label="Next">›</button>
  </div>

  );
}