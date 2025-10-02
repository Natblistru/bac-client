import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import api, { bootCsrf } from "../routes/api";

function StepDots({ options = [], value = 0, onChange }) {
  const handlePick = (i) => {
    if (i !== value) onChange?.(i, options[i]);
  };

  const getPts = (opt, i) =>
    typeof opt?.points === "number"
      ? opt.points
      : Number(String(opt?.label ?? "").match(/-?\d+/)?.[0] ?? i + 1);

  const ratio = options.length > 1 ? value / (options.length - 1) : 0;

   return (
     <span
       className="stepbar"
       role="radiogroup"
      aria-label={`Nivel: ${value + 1} din ${options.length}`}
       style={{ "--ratio": ratio }}
     >
       {options.map((opt, i) => {
        const state = i <= value ? "on" : "off";
         return (
           <button
             key={i}
             type="button"
             className={`dot ${state}`}
             role="radio"
            aria-checked={i === value}
             onClick={() => handlePick(i)}
             onKeyDown={(e) => {
              if (e.key === "ArrowRight") handlePick(Math.min(value + 1, options.length - 1));
              if (e.key === "ArrowLeft")  handlePick(Math.max(value - 1, 0));
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
  const [busy, setBusy] = useState(false);
  const studentId = Number(localStorage.getItem("auth.student_id")) || null;
  const [hydrated, setHydrated] = useState(false);

  const [answerLevels, setAnswerLevels] = useState({});

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

  useEffect(() => {
    if (hydrated) return;
    if (!Array.isArray(data) || data.length === 0) return;

    const init = {};
    for (const q of data) {
      const answers = Array.isArray(q?.answers) ? q.answers : [];
      for (const a of answers) {
        const opts = Array.isArray(a?.options) ? a.options : [];
        if (!opts.length) continue;

        // caută opțiunea salvată în DB
        const idx = opts.findIndex(o => o?.selected === true);

        // dacă nu există selecție în DB → 0
        const useIdx = idx >= 0 ? idx : 0;
        const useLbl = opts[useIdx]?.label ?? "";

        init[a.id] = { index: useIdx, label: useLbl };
      }
    }

    // setează doar dacă nu aveai deja selecții (ca să nu calci peste alegeri noi)
    setAnswerLevels(prev => (Object.keys(prev).length ? prev : init))
    setHydrated(true);
  }, [data, hydrated]);


  const totals = useMemo(() => {
    let cur = 0,
      max = 0;
    for (const q of data ?? []) {
      const answers = Array.isArray(q?.answers) ? q.answers : [];
      for (const a of answers) {
        max += Number(a?.max_points ?? 0);
        const opts = Array.isArray(a?.options) ? a.options : [];
        if (opts.length > 0) {
        const keyId = String(a.id);
        const backendIdx = opts.findIndex(o => o?.selected === true || o?.selected === "true");
        const idx = answerLevels[keyId]?.index ?? (backendIdx >= 0 ? backendIdx : 0);
          cur += pointsOfOption(opts[idx]);
        }
      }
    }
    return { cur, max };
  }, [data, answerLevels]);

  // ——— construiește rezultatele pentru consolă
const buildResults = useCallback(() => {
  const rows = [];
  let total = 0;
  let maxTotal = 0;

  (data ?? []).forEach((q, qi) => {
    const answers = Array.isArray(q?.answers) ? q.answers : [];
    answers.forEach((a, ai) => {
      const opts = Array.isArray(a?.options) ? a.options : [];
      const maxPoints = Number(a?.max_points ?? 0);
      maxTotal += maxPoints;
      if (opts.length === 0) return;

      // 🔑 cheie stabilă pentru state-ul controlat
      const keyId = String(a.id);

      // 🗄️ indicele inițial din backend (selected)
      const backendIdx = opts.findIndex(
        (o) => o?.selected === true || o?.selected === "true" || o?.selected === 1
      );

      // ✅ regulă unică: state → backend → 0
      const selIdx =
        answerLevels[keyId]?.index ?? (backendIdx >= 0 ? backendIdx : 0);

      const selOpt = opts[selIdx];
      const selPts = pointsOfOption(selOpt);
      total += selPts;

      rows.push({
        questionIndex: qi + 1,
        answerIndex: ai + 1,
        questionId: q?.id ?? null,
        answerId: a?.id ?? null,
        task: a?.task ?? "",
        selectedIndex: selIdx,
        selectedLabel: selOpt?.label ?? "",
        points: selPts,
        max_points: maxPoints,
        evaluation_answer_option_id: selOpt?.answer_option_id ?? null,
      });
    });
  });

  return { rows, total, maxTotal };
}, [data, answerLevels]);


  // ——— Trimite la server (OK)
  const handleSubmit = useCallback(async () => {
    if (busy) return;
    const { rows, total, maxTotal } = buildResults();
    if (!rows.length) {
      console.log("Nicio evaluare selectată.");
      onClose?.();
      return;
    }

    // validare minimă: trebuie să avem option_id pentru fiecare rând
    const invalid = rows.find((r) => !r.evaluation_answer_option_id);
    if (invalid) {
      console.warn(
        "Unele opțiuni nu au id (evaluation_answer_option_id).",
        "Asigură-te că fiecare option are `id` din DB."
      );
      console.table(rows);
      onClose?.();
      return;
    }

    console.table(rows);

    // pregătim payload pt backend
    const items = rows.map((r) => ({
      points: Number.isFinite(r.points) ? r.points : 0,
      student_id: studentId,
      evaluation_answer_option_id: r.evaluation_answer_option_id,
      content_student: {
        questionId: r.questionId,
        answerId: r.answerId,
        selectedIndex: r.selectedIndex,
        selectedLabel: r.selectedLabel,
        task: r.task,
        // aici poți adăuga extra note/observații introduse de student
      },
      status: 0,
    }));

    try {
      setBusy(true);
      await bootCsrf().catch(() => {});
      const { data: resp } = await api.post(
        "/api/student-evaluation-answers/bulk",
        { items }
      );
      console.table(rows);
      console.log("TOTAL:", total, "/", maxTotal);
    } catch (err) {
      console.error("Eroare la salvare răspunsuri:", err);
    } finally {
      setBusy(false);
      onClose?.();
    }
  }, [buildResults, studentId, onClose, busy]);

  // Doar închide (X/Escape/click în afară), fără POST
  const handleDismiss = useCallback(() => {
    if (busy) return; // opțional: blochează în timpul submitului
    onClose?.();
  }, [busy, onClose]);

  // Escape pentru închidere
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && handleDismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDismiss]);

  // Click în afara ferestrei => închide (fără overlay interactiv)
  useEffect(() => {
    const onDown = (e) => {
      const box = boxRef.current;
      if (!box) return;
      if (!box.contains(e.target)) handleDismiss();
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
    };
  }, [handleDismiss]);

  console.log(data);

useEffect(() => {
  if (hydrated) {
    return;
  }
  if (!Array.isArray(data) || data.length === 0) {
    return;
  }

  const init = {};
  for (const q of data) {
    const answers = Array.isArray(q?.answers) ? q.answers : [];
    for (const a of answers) {
      const opts = Array.isArray(a?.options) ? a.options : [];
      if (!opts.length) continue;

      // ⚠️ dacă 'selected' vine uneori ca string "true", acoperă și cazul ăla:
      const idx = opts.findIndex(o => o?.selected === true || o?.selected === "true");
      const useIdx = idx >= 0 ? idx : 0;
      const useLbl = opts[useIdx]?.label ?? "";
      init[String(a.id)] = { index: useIdx, label: useLbl };
    }
  }

  setAnswerLevels(prev => {
    const next = Object.keys(prev).length ? prev : init;
    return next;
  });
  setHydrated(true);
}, [data, hydrated]);

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
          <div>
            {/* OK = trimite + închide */}
            <button
              type="button"
              className="eval-ok"
              onClick={handleSubmit}
              disabled={busy}
              title="Salvează evaluarea"
              aria-label="OK"
            >
              {busy ? "..." : "OK"}
            </button>

            <button
              type="button"
              className="eval-close"
              aria-label="Închide"
              onClick={handleDismiss}
              disabled={busy}
            >
              ✕
            </button>
          </div>
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
                    const keyId = String(a.id);
                    const backendIdx = opts.findIndex(o => o?.selected === true || o?.selected === "true");
                    const fallbackIdx = backendIdx >= 0 ? backendIdx : 0;
                    const activeIdx = answerLevels[keyId]?.index ?? fallbackIdx;
                    const activeLbl =
                      answerLevels[keyId]?.label ??
                      (opts[activeIdx]?.label ?? opts[0]?.label ?? "");

                    return (
                      <tr key={`${q.id}-${a.id}`}>
                        <td className="col-no">{qi + 1}</td>
                        <td className="col-task">{a.task}</td>
                        <td className="col-steps">
                          {opts.length > 0 && (
                            <StepDots
                              key={`dots-${a.id}-${activeIdx}-${opts.length}`}
                              options={opts}
                              value={activeIdx}
                              onChange={(i, opt) =>
                                setAnswerLevels((prev) => {
                                  const newLabel = opt?.label ?? "";
                                  const prevEntry = prev[keyId];
                                  if (prevEntry?.index === i && prevEntry?.label === newLabel) return prev;
                                  return { ...prev, [keyId]: { index: i, label: newLabel } };
                                })
                              }
                            />
                          )}
                        </td>
                        <td className="col-label">
                          {opts.length > 0 && (
                            <span className="opt-active-label">
                              {activeLbl}
                            </span>
                          )}
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
