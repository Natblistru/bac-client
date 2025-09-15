import { useState, useEffect, useRef } from "react";

export default function EvalAnswersModal({
  data = [],
  onClose,
  title = "Începe evaluarea",
}) {
  const boxRef = useRef(null);
  const [pos, setPos] = useState({ x: 480, y: 80 });
  const [drag, setDrag] = useState(null); // { offX, offY } | null

  // Escape pentru închidere
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Click în afara ferestrei => închide (fără overlay interactiv)
  useEffect(() => {
    const onDown = (e) => {
      const box = boxRef.current;
      if (!box) return;
      if (!box.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
    };
  }, [onClose]);

  // Drag natural pe left/top cu limite
  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const nx = e.clientX - drag.offX;
      const ny = e.clientY - drag.offY;

      const bw = boxRef.current?.offsetWidth ?? 0;
      const bh = boxRef.current?.offsetHeight ?? 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const x = Math.max(0, Math.min(nx, vw - bw));
      const y = Math.max(0, Math.min(ny, vh - bh));
      setPos({ x, y });
    };
    const onUp = () => setDrag(null);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag]);

  const startDrag = (e) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDrag({ offX: e.clientX - rect.left, offY: e.clientY - rect.top });
  };

  return (
    <>
      {/* Dimming pasiv: nu blochează scroll/click */}
      <div className="eval-modal-dim" aria-hidden="true" />

      <div
        ref={boxRef}
        className="eval-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ left: pos.x, top: pos.y }}
      >
        <div
          className="eval-modal-head"
          onMouseDown={startDrag}
          role="toolbar"
          aria-label="Bara modal"
        >
          <strong>{title}</strong>
          <button
            type="button"
            className="eval-close"
            aria-label="Închide"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="eval-modal-body">
          {data.length === 0 ? (
            <p>Nu există întrebări pentru acest item.</p>
          ) : (
            <ol className="eval-q-list">
              {data.map((q) => (
                <li key={q.id} className="eval-q">
                  {q?.task?.html ? (
                    <div
                      className="eval-q-text"
                      dangerouslySetInnerHTML={{ __html: q.task.html }}
                    />
                  ) : (
                    <div className="eval-q-text">(fără enunț textual)</div>
                  )}

                  <ul className="eval-a-list">
                    {(q?.evaluation_answers || []).map((a) => (
                      <li key={a.id} className="eval-a">
                        {a?.task?.html ? (
                          <span
                            className="eval-a-text"
                            dangerouslySetInnerHTML={{ __html: a.task.html }}
                          />
                        ) : a?.content ? (
                          <span className="eval-a-text">{a.content}</span>
                        ) : (
                          <span className="eval-a-text">(fără conținut)</span>
                        )}
                        {typeof a?.max_points === "number" && (
                          <span className="eval-a-points">· {a.max_points}p</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </>
  );
}