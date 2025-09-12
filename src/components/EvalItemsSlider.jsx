import { useRef, useEffect, useState } from "react";
import "./EvalItemsSlider.css"

export default function EvalItemsSlider({ items }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

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
      {items.map((it) => (
        <div className="subslide" key={it.id}>
          <div className="subslide-card">
            <article
              className="topic-content reading"
              dangerouslySetInnerHTML={{ __html: it.task?.html || "" }}
            />
            {typeof it.evaluation_questions_count === "number" && (
              <div className="subslide-meta">
                {it.evaluation_questions_count} întrebări
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    <button type="button" className="subslider-nav prev"
            onClick={() => nudge(-1)} disabled={!canPrev} aria-label="Previous">‹</button>
    <button type="button" className="subslider-nav next"
            onClick={() => nudge(1)} disabled={!canNext} aria-label="Next">›</button>
  </div>

  );
}