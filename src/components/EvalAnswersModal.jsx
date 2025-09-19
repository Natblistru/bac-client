import { useState, useEffect, useRef, useMemo } from "react";

function StepDots({ options = [], defaultActive = 0, onChange }) {
  const [active, setActive] = useState(0);

  // ținem un ref la onChange ca să nu fie dependență instabilă în efecte
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // sincronizează active doar când chiar s-a schimbat defaultActive/numărul de opțiuni
  useEffect(() => {
    const clamped = Math.min(Math.max(defaultActive, 0), Math.max(0, options.length - 1));
    setActive(prev => (prev === clamped ? prev : clamped));
  }, [defaultActive, options.length]);

  // notifică părintele DOAR când se schimbă efectiv indexul sau numărul de opțiuni
  useEffect(() => {
    if (options.length) {
      onChangeRef.current?.(active, options[active]);
    }
  }, [active, options.length]);

  const handlePick = (i) => {
    setActive(prev => (prev === i ? prev : i));
    // notificăm imediat (opțional), dar și efectul de mai sus va acoperi cazul
    onChangeRef.current?.(i, options[i]);
  };

  const getPts = (opt, i) =>
    typeof opt?.points === "number"
      ? opt.points
      : Number(String(opt?.label ?? "").match(/-?\d+/)?.[0] ?? i + 1);

  const ratio = options.length > 1 ? active / (options.length - 1) : 0;

  return (
    <span
      className="stepbar"
      role="radiogroup"
      aria-label={`Nivel: ${active + 1} din ${options.length}`}
      style={{ "--ratio": ratio }}
    >
      {options.map((opt, i) => {
        const state = i <= active ? "on" : "off";
        return (
          <button
            key={i}
            type="button"
            className={`dot ${state}`}
            role="radio"
            aria-checked={i === active}
            onClick={() => handlePick(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") handlePick(Math.min(active + 1, options.length - 1));
              if (e.key === "ArrowLeft")  handlePick(Math.max(active - 1, 0));
            }}
            title={`Selectează nivel ${i + 1}`}
          >
            {getPts(opt, i)}
          </button>
        );
      })}
    </span>
  );
}

export default function EvalAnswersModal({
  data = [],
  onClose,
  title = "Începe evaluarea",
}) {
  const boxRef = useRef(null);
  const [pos, setPos] = useState({ x: 480, y: 80 });
  const [drag, setDrag] = useState(null); // { offX, offY } | null

  const [answerLevels, setAnswerLevels] = useState({});

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

  const pointsOfOption = (opt) => {
  if (typeof opt?.points === "number") return opt.points;
  const m = String(opt?.label ?? "").match(/-?\d+/);
  return m ? Number(m[0]) : 0;
};

const totals = useMemo(() => {
  let cur = 0, max = 0;
  for (const q of data ?? []) {
    const answers = Array.isArray(q?.answers) ? q.answers : [];
    for (const a of answers) {
      max += Number(a?.max_points ?? 0);
      const opts = Array.isArray(a?.options) ? a.options : [];
      if (opts.length > 0) {
        const idx = answerLevels[a.id]?.index ?? 0;      // primul cerc inițial
        cur += pointsOfOption(opts[idx]);
      }
    }
  }
  return { cur, max };
}, [data, answerLevels]);

  // console.log(data)

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
          <div className="eval-head-left">
            <strong className="modal-title">{title}</strong>
            <span
              className="score-badge"
              title={`Scor: ${totals.cur} / ${totals.max}`}
              aria-label={`Scor curent ${totals.cur} din ${totals.max}`}
            >
              {totals.cur}/{totals.max}
            </span>
          </div>
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
            <table className="eval-table">
              <thead>
                <tr>
                  <th className="col-no">#</th>
                  <th className="col-task">Criteriu</th>
                  <th className="col-steps">Nivel</th>
                  <th className="col-label">Descriere nivel</th>
                </tr>
              </thead>
              <tbody>
                {data.map((q, qi) =>
                  (q?.answers ?? []).map((a) => {
                    const opts = Array.isArray(a?.options) ? a.options : [];
                    const fallbackIdx = 0;
                    const activeIdx  = answerLevels[a.id]?.index ?? fallbackIdx;
                    const activeLbl  = answerLevels[a.id]?.label ?? opts[fallbackIdx]?.label ?? "";

                    return (
                      <tr key={`${q.id}-${a.id}`}>
                        <td className="col-no">{qi + 1}</td>
                        <td className="col-task">{a.task}</td>
                        <td className="col-steps">
                          {opts.length > 0 && (
                            <StepDots
                              options={opts}
                              defaultActive={activeIdx}
                              onChange={(i, opt) =>
                                setAnswerLevels(prev => {
                                  const newLabel = opt?.label ?? "";
                                  const prevEntry = prev[a.id];
                                  if (prevEntry?.index === i && prevEntry?.label === newLabel) return prev;
                                  return { ...prev, [a.id]: { index: i, label: newLabel } };
                                })
                              }
                            />
                          )}
                        </td>
                        <td className="col-label">
                          {opts.length > 0 && <span className="opt-active-label">{activeLbl}</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  );
}