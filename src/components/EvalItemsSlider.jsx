import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/auth";
import api, { bootCsrf } from "../routes/api";
import DraggableModal from "./DraggableModal";
import EvalAnswersModal from "./EvalAnswersModal";
import "./EvalItemsSlider.css";

export default function EvalItemsSlider({ items }) {
  const trackRef = useRef(null);
  const [list, setList] = useState(items); // copie locală editabilă
  const currentItemIndexRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [srcModal, setSrcModal] = useState({ open: false, html: "" });
  const [evalModal, setEvalModal] = useState({
    open: false,
    data: [],
    title: "",
    itemIndex: null,
  });

  const { me, requireAuth } = useAuth();
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const openSource = (html) => {
    setSrcModal({ open: true, html: html || "" });
  };
  const closeSource = () => setSrcModal({ open: false, html: "" });

  const [answers, setAnswers] = useState({});

  const studentId = Number(localStorage.getItem("auth.student_id")) || null;

  useEffect(() => { setList(items); }, [items]);

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
  }, [list]);

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

      // console.log(px);

      if (el.style.height !== px) {
        el.style.height = px;
      }

      // console.log(el.style.height);
      // console.log(el);

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
  }, [list]);

  const nudge = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // const w = Math.max(260, el.clientWidth * 0.9);
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  // if (!items?.length) return null;
  if (!list?.length) return null;

  const backendTextForQuestion = (maybeQ) => {
    // acceptă ori question, ori array de answers
    const answersArray = Array.isArray(maybeQ)
      ? maybeQ
      : (maybeQ?.answers ?? maybeQ?.evaluation_answers ?? []);

    if (!Array.isArray(answersArray) || answersArray.length === 0) return "";

    // 1) preferă textul salvat de student (dacă vine din backend)
    const withStudent = answersArray.find(a => a?.student_answer?.html && String(a.student_answer.html).trim().length);
    if (withStudent) return String(withStudent.student_answer.html).trim();

    return "";
  };


  const buildTextRowsForItem = (item, answers, studentId) => {
    const rows = [];
    const qArr = item?.questions || item?.evaluation_questions || [];
    for (const q of qArr) {
      const aArr = q?.answers || q?.evaluation_answers || [];
      for (const a of aArr) {
        // valoarea din input/textarea e salvată în answers[q.id]
        const raw = (answers?.[q.id] ?? "").toString().trim();
        if (!raw) continue;

        rows.push({
          student_id: studentId,
          evaluation_answer_id: a.id,
          content: { html: raw },   // 🔴 IMPORTANT: cheie "html"
          status: 0,
        });
      }
    }
    return rows;
  };




  // Normalizează un item de tip "slider" la forma cerută de EvalAnswersModal
  function normalizeForEvalModal(item) {
    const qs = (item?.evaluation_questions || item?.questions || []).map(
      (q) => {
        const rawAnswers = q?.evaluation_answers || q?.answers || [];

        const answers = rawAnswers.map((a) => {
          const rawOpts = a?.evaluation_answer_options || a?.options || [];

          const options = rawOpts.map((o) => {
            // surse posibile pentru label/points (în JSON pot fi direct pe opțiune
            // sau în "evaluation_option")
            const label = o?.label ?? o?.evaluation_option?.label ?? "";
            const points =
              typeof o?.points === "number"
                ? o.points
                : Number(o?.evaluation_option?.points ?? 0);

            // ✳️ PROPAGĂ scorul studentului și "selected" dacă vin din backend
            const student_points =
              o?.student_points === null || o?.student_points === undefined
                ? null
                : Number(o.student_points);

            const selected = Boolean(o?.selected);

            return {
              // chei compatibile cu StepDots/EvalAnswersModal
              answer_option_id: o?.answer_option_id ?? o?.id, // id din evaluation_answer_options
              option_id: o?.option_id ?? o?.evaluation_option_id, // id din evaluation_options
              label,
              points,

              // ✳️ noile câmpuri păstrate:
              student_points,
              selected,
            };
          });

          return {
            id: a.id,
            task: a.task,
            content: a.content,
            max_points: a.max_points,
            options,
          };
        });

        return {
          id: q.id,
          order_number: q.order_number,
          subtopic_id: q.subtopic_id ?? item.subtopic_id,
          subtopic_name: q.subtopic_name ?? item.subtopic_name,
          topic_id: q.topic_id ?? item.topic_id,
          topic_name: q.topic_name ?? item.topic_name,
          task: q.task,
          hint: q.hint,
          placeholder: q.placeholder,
          content_settings: q.content_settings,
          type: q.type,
          answers,
        };
      }
    );

    return qs;
  }

  const openAnswersModal = async (item, itemIndex) => {
    if (!requireAuth()) {
      showToast("Trebuie să fii autentificat pentru a începe evaluarea.");
      return;
    }

    const qs = normalizeForEvalModal(item);
    currentItemIndexRef.current = itemIndex;
    setEvalModal({
      open: true,
      data: qs,
      title: "Începe evaluarea",
      itemIndex,
    });

    // 2) salvează textele introduse până acum (în fundal)
    const rows = buildTextRowsForItem(item, answers, studentId);
    if (rows.length) {
      try {
        await bootCsrf().catch(() => {});
        await api.post("/api/student-answers/bulk", { items: rows });
      } catch (err) {
        console.warn("Eroare la salvarea răspunsurilor text:", err);
      }
    }
  };

  const showToast = (msg, ms = 2600) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  const closeAnswersModal = () =>
    setEvalModal({ open: false, data: [], title: "" });

  const canStart = !!me?.id;

// punctele dintr-o opțiune (acoperă atât .points direct, cât și evaluation_option.points)
const ptsOf = (opt) =>
  typeof opt?.points === "number"
    ? opt.points
    : Number(opt?.evaluation_option?.points ?? 0);

// calculează {cur, max, any} pentru un item (questions -> answers -> options)
const scoreOfItem = (item) => {
  let cur = 0;
  let max = 0;
  let any = false;

  const questions = item?.questions ?? item?.evaluation_questions ?? [];
  for (const q of questions) {
    const answers = q?.answers ?? q?.evaluation_answers ?? [];
    for (const a of answers) {
      max += Number(a?.max_points ?? 0);

      // 1) varianta "flat"
      const opts = Array.isArray(a?.options) ? a.options : [];
      let added = false;
      if (opts.length) {
        const sel = opts.find(
          (o) => o?.selected === true || o?.selected === "true" || o?.selected === 1
        );
        if (sel) {
          cur += Number(ptsOf(sel) ?? 0);
          any = true;
          added = true;
        }
      }

      // 2) fallback: evaluation_answer_options
      if (!added) {
        const eao = Array.isArray(a?.evaluation_answer_options)
          ? a.evaluation_answer_options
          : [];
        if (eao.length) {
          const sel2 = eao.find(
            (o) => o?.selected === true || o?.selected === "true" || o?.selected === 1
          );
          if (sel2) {
            cur += Number(ptsOf(sel2) ?? 0);
            any = true;
          }
        }
      }
    }
  }
  return { cur, max, any };
};



  return (
    <div className="subslider">
      <div className="subslider-track" ref={trackRef}>
        {list?.map((item, idx) => {

          // scor + flag "any"
          const { cur, max, any } = scoreOfItem(item);

          // fundal roz pal dacă există măcar o selecție
          const cardStyle = any ? { background: "rgba(255, 240, 244, 0.3)" } : null;

          return (
            <div className="subslide" key={item.id ?? idx}>
              <div className={`subslide-card ${any ? 'answered' : ''}`} style={cardStyle}>
                <button
                  type="button"
                  className="eval-start-icon"
                  title={
                    canStart
                      ? "Începe evaluarea"
                      : "Autentifică-te pentru a începe"
                  }
                  aria-disabled={!canStart}
                  style={{
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: any ? "#7c1e2b" : "#475569",
                    background: any ? "#ffd9e3" : "#e5e7eb",
                    border: "1px solid rgba(0,0,0,.06)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openAnswersModal(item, idx);
                  }}
                >
                  {cur}/{max}
                </button>

                {item?.task?.html ? (
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
                ) : (
                  item?.short_source_content?.html && (
                    <article
                      className="q-text topic-content reading"
                      dangerouslySetInnerHTML={{
                        __html: item.short_source_content?.html,
                      }}
                    />
                  )
                )}

                {item?.evaluation_questions?.map((q) => {
                  const t = String(q?.type || "").toLowerCase();
                  const inputId = `q-${q.id}`;
                  const rows = Number(q?.content_settings?.nr_rand ?? 4);
                  const max = rows * 75; // 75 caractere/rând
                  const val = answers?.[q.id] ?? backendTextForQuestion(q);

                  if (t === "virtual") return null;

                  return (
                    <div className="free-answer" key={q.id}>
                      {t === "input" ? (
                        <div className="field-row">
                          {q?.task?.html && (
                            <label
                              htmlFor={inputId}
                              className="q-task"
                              dangerouslySetInnerHTML={{
                                __html: q.task?.html || "",
                              }}
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
                              dangerouslySetInnerHTML={{
                                __html: q.task?.html || "",
                              }}
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

      <button
        type="button"
        className="subslider-nav prev"
        onClick={() => nudge(-1)}
        disabled={!canPrev}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        type="button"
        className="subslider-nav next"
        onClick={() => nudge(1)}
        disabled={!canNext}
        aria-label="Next"
      >
        ›
      </button>
      {evalModal.open && (
        <EvalAnswersModal
          data={evalModal.data}
          onClose={closeAnswersModal}
          title={evalModal.title}
          onSave={(payload) => {
            // payload = { rows: [...] }
            const rows = payload?.rows ?? [];
            // lookup rapid după answerId
            const rowByAnswerId = Object.fromEntries(
              rows.map(r => [String(r.answerId), r])
            );

            setList(prev => {
              const itemIndex = currentItemIndexRef.current;
              if (itemIndex == null) return prev;

              // clonă imutabilă; dacă ai Node 18+, poți folosi structuredClone
              const next = prev.map((it, i) => {
                if (i !== itemIndex) return it;

                const questions = it.evaluation_questions || it.questions || [];
                const newQuestions = questions.map(q => {
                  const answers = q.evaluation_answers || q.answers || [];
                  const newAnswers = answers.map(a => {
                    const row = rowByAnswerId[String(a.id)];
                    if (!row) return a;

                    const targetEaoId = row.evaluation_answer_option_id; // ID din evaluation_answer_options
                    const chosenPoints = row.points;

                    const updateOpts = (arr, idKey) =>
                      Array.isArray(arr)
                        ? arr.map(opt => {
                            const optId = opt[idKey]; // 'answer_option_id' sau 'id'
                            const isChosen = optId === targetEaoId;
                            return {
                              ...opt,
                              selected: isChosen,
                              // dacă vrei să vezi scorul curent și în UI
                              student_points: isChosen ? chosenPoints : null,
                            };
                          })
                        : arr;

                    return {
                      ...a,
                      // forma "flat" pentru UI
                      options: updateOpts(a.options, 'answer_option_id'),
                      // forma relațională (dacă o ai în item)
                      evaluation_answer_options: updateOpts(a.evaluation_answer_options, 'id'),
                    };
                  });

                  // păstrează aceeași cheie (evaluation_answers vs answers)
                  return q.evaluation_answers
                    ? { ...q, evaluation_answers: newAnswers }
                    : { ...q, answers: newAnswers };
                });

                return it.evaluation_questions
                  ? { ...it, evaluation_questions: newQuestions }
                  : { ...it, questions: newQuestions };
              });

              return next;
            });
          }}
        />

      )}
    </div>
  );
}
