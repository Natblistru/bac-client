import React, { useMemo, useEffect, useState } from "react";

export default function Flashcards({ cards }) {
  const [deck, setDeck] = useState(() => [...cards]);
  const [flipped, setFlipped] = useState(false);
  const [hover, setHover] = useState(null); // 'know' | 'dont' | null
  const [anim, setAnim] = useState(null); // 'left' | 'back' | null

  const [status, setStatus] = useState(() => ({})); // { [cardId]: 'known' | 'dont' }

  useEffect(() => {
    setDeck([...cards]);
    setStatus({});
    setFlipped(false);
    setHover(null);
    setAnim(null);
  }, [cards]);

  // helpers pentru HTML din backend
  const toHtml = (val) => {
    console.log(val)
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val.html === "string") return val.html;
    if (Array.isArray(val)) {
      return val
        .map((b) =>
          typeof b === "string"
            ? b
            : (b?.data?.text ?? b?.text ?? b?.content ?? "")
        )
        .filter(Boolean)
        .join("\n");
    }
    if (typeof val === "object") {
      return val.data?.text ?? val.text ?? "";
    }
    return String(val ?? "");
  };

  const topCard = deck[0];
  const total = cards.length;

  const { knownCount, dontCount, uniqueAnswered } = useMemo(() => {
    let k = 0, d = 0;
    for (const v of Object.values(status)) {
      if (v === 'known') k++;
      else if (v === 'dont') d++;
    }
    return { knownCount: k, dontCount: d, uniqueAnswered: k + d };
  }, [status]);

  const progressPct = (knownCount / Math.max(total, 1)) * 100;


  function flip() {
    if (!topCard || anim) return;
    setFlipped((v) => !v);
  }

  function handleKnow() {
    if (!topCard || anim) return;
    setHover(null);
    setAnim("left"); // swipe left and fade out
  }

  function handleDont() {
    if (!topCard || anim) return;
    setHover(null);
    setAnim("back"); // send to back of the stack
  }

  function classify(id, kind) { // kind: 'known' | 'dont'
    const key = String(id); // normalizăm cheia
    setStatus(prev => (prev[key] === kind ? prev : { ...prev, [key]: kind }));
  }

  function onAnimationEnd() {
    if (!anim || !topCard) return;

    if (anim === "left") {
      classify(topCard.id, 'known');          // marchează known
      setDeck(prev => prev.slice(1));         // scoate din deck
    } else if (anim === "back") {
      classify(topCard.id, 'dont');           // marchează dont
      setDeck(prev => {                       // mută în spate
        if (prev.length <= 1) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }

    setAnim(null);
    setFlipped(false);
  }

  function handleRestart() {
    setDeck(() => [...cards]); // sau păstrează un ref cu lista inițială dacă vrei exact snapshot-ul inițial
    setStatus({});             // << reset etichetări (known/dont)
    setFlipped(false);
    setHover(null);
    setAnim(null);
}

  // simple stacked preview (top 3)
  const visibleStack = useMemo(() => deck.slice(0, 3), [deck]);

  return (
    <div className="fc-root">
      <style>{CSS}</style>

      <div className="fc-stage">
        {visibleStack.map((card, i) => {
          const isTop = i === 0;
          const depth = i; // 0..2
          const style = {
            zIndex: 100 - i,
            transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`,
            opacity: 1 - depth * 0.08,
          };
          const innerCls = [
            "fc-card",
            isTop && flipped ? "is-flipped" : "",
            isTop && hover === "know" ? "tilt-right" : "",
            isTop && hover === "dont" ? "tilt-left" : "",
            isTop && anim === "left" ? "animate-left" : "",
            isTop && anim === "back" ? "animate-back" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={card.id}
              className="fc-card-wrap"
              style={style}
              onAnimationEnd={isTop ? onAnimationEnd : undefined}
            >
              <div className={innerCls}>
                <div className="fc-face fc-front">
                  <div
                    className="fc-content"
                    dangerouslySetInnerHTML={{ __html: toHtml(card.front) }}
                  />

                  <button
                    aria-label="Flip card"
                    className="flip-btn"
                    onClick={isTop ? flip : undefined}
                  >
                    <FlipIcon />
                  </button>
                </div>

                <div className="fc-face fc-back">
                  <div className="fc-content-wrap">

                    <div
                      className="fc-question-mini"
                      dangerouslySetInnerHTML={{ __html: toHtml(card.front) }}
                    />

                    <div
                      className="fc-content answer-html"
                      dangerouslySetInnerHTML={{ __html: toHtml(card.back) }}
                    />
                  </div>

                  <button
                    aria-label="Flip card"
                    className="flip-btn"
                    onClick={isTop ? flip : undefined}
                  >
                    <FlipIcon />
                  </button>
                </div>

                {/* Hover labels */}
                {isTop && (
                  <div className="fc-hover-labels">
                    <span className="label-know">Eu știu</span>
                    <span className="label-dont">Eu nu știu</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {deck.length === 0 && (
          <div className="fc-empty">
            <h3>Felicitari! 🎉</h3>
            <p>
              Ai invațat inca <strong>{knownCount}</strong> noțiuni noi.
            </p>
            <button type="button" className="fc-restart" onClick={handleRestart}>
              Restart Flashcards
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="fc-controls">
        <button
          className="ctrl ctrl-bad"
          onMouseEnter={() => setHover("dont")}
          onMouseLeave={() => setHover(null)}
          onClick={handleDont}
          disabled={!topCard || !!anim}
        >
          ×
        </button>

        <button
          className="ctrl ctrl-good"
          onMouseEnter={() => setHover("know")}
          onMouseLeave={() => setHover(null)}
          onClick={handleKnow}
          disabled={!topCard || !!anim}
        >
          ✓
        </button>
      </div>

      {/* Bottom row: counters + centered progress bar */}
      <div className="fc-bottom">
        <div className="corner corner-left">
          <span className="corner-content">
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 1.29918L14.7008 0L8 6.70082L1.29918 0L0 1.29918L6.70082 8L0 14.7008L1.29918 16L8 9.3001L14.7008 16L16 14.7008L9.29918 8L16 1.29918Z"
                fill="#333333"
              ></path>
            </svg>{" "}
            {dontCount}
          </span>
        </div>
        <div className="fc-progress">
          <div className="progress-text">
            {knownCount}/{total}
          </div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="corner corner-right">
          <span className="corner-content">
            <svg
              width="13"
              height="11"
              viewBox="0 0 13 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.1945 10.989L0.5 7.29375L1.82525 5.96775L4.13075 8.27325L10.9692 0.75L12.356 2.0115L4.1945 10.989Z"
                fill="#333333"
              ></path>
            </svg>{" "}
            {knownCount}
          </span>
        </div>
      </div>
    </div>
  );
}

function FlipIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      role="img"
      aria-hidden="true"
    >
      <path
        d="M12 4v2a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8zm-1 1H6V4l-4 3 4 3V8h5V5z"
        fill="currentColor"
      />
    </svg>
  );
}

const CSS = `
/* ---- Layout ---- */
.fc-root {
  --card-w: clamp(260px, 60vw, 640px);
  --card-h: clamp(420px, 42vh, 420px);
  --radius: 16px;
  --shadow: 0 10px 28px rgba(0,0,0,.08);
  --shadow-strong: 0 16px 44px rgba(0,0,0,.16);
  position: relative;
  width: 100%;
  min-height: 560px;
  display: grid;
  grid-template-rows: auto auto auto 1fr;
  place-items: center;
  padding: 24px 16px 56px;
  background: linear-gradient(180deg,#f7f9fc,#eef3ff 60%,#e9efff);
}

.fc-stage {
  position: relative;
  width: var(--card-w);
  height: var(--card-h);
  perspective: 1200px;
}

.fc-card-wrap {
  position: absolute;
  inset: 0;
}

.fc-card {
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  background: #fff;
  box-shadow: var(--shadow);
  transform-style: preserve-3d;
  transition: transform .35s ease, box-shadow .25s ease;
}

.fc-card:hover { box-shadow: var(--shadow-strong); }

.fc-card.is-flipped { transform: rotateY(180deg); }

.fc-face {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  padding: 28px 22px 56px;
  -webkit-backface-visibility: hidden; backface-visibility: hidden;
  border-radius: var(--radius);
}

.fc-front { background:#fff; }
.fc-back  { background:#ffffff; transform: rotateY(180deg); }

.fc-content { max-width: 90%; text-align: center; }
.fc-content p { font-size: clamp(16px, 2.2vw, 24px); line-height: 1.35; }

.answer-pre {
  white-space: pre-wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  background: #0f172a; color: #e2e8f0;
  padding: 12px 14px; border-radius: 10px; font-size: 14px;
  text-align: left; box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
}

.flip-btn {
  position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%);
  border: none; border-radius: 999px; width: 44px; height: 44px;
  display: grid; place-items: center; cursor: pointer;
  background: #f1f5f9; color: #334155;
  box-shadow: 0 2px 10px rgba(0,0,0,.08);
}
.flip-btn:hover { background:#e2e8f0; }

/* Hover tilt indicators */
.fc-hover-labels { position: absolute; inset:0; pointer-events:none; z-index: 3;}
.label-know,
.label-dont {
  position:absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  font-weight: 700; letter-spacing: .5px; padding: 8px 14px; border-radius: 999px;
  color: white; opacity: 0; transition: opacity .2s ease;
}
.label-know { background:#16a34a; }
.label-dont { background:#2563eb; }

.tilt-right { transform: rotateY(var(--ry,0)) rotateZ(6deg); }
.tilt-left  { transform: rotateY(var(--ry,0)) rotateZ(-6deg); }

/* Show proper label while hovering buttons */
.fc-card:not(.is-flipped).tilt-right .fc-hover-labels .label-know { opacity: .95; }
.fc-card:not(.is-flipped).tilt-left  .fc-hover-labels .label-dont { opacity: .95; }

/* Leave deck animations */
@keyframes swipeLeft { to { transform: translateX(-130%) rotateZ(-12deg); opacity:0; } }
@keyframes sendBack  { to { transform: translateY(36px) scale(.92); opacity:.8; } }

.animate-left { animation: swipeLeft .42s ease forwards; }
.animate-back { animation: sendBack .42s ease forwards; }

/* Controls */
.fc-controls {
  display: grid; grid-auto-flow: column; gap: 16px; margin-top: 14px;
}
.ctrl {
  width: 56px; height: 48px; font-size: 24px; line-height: 1;
  border-radius: 12px; cursor: pointer; border: none; color: #0f172a;
  box-shadow: 0 6px 16px rgba(0,0,0,.08); transition: transform .15s ease, background .2s ease;
}
.ctrl:disabled { opacity:.4; cursor: default; }
.ctrl-bad { background: #e2e8f0; }
.ctrl-good { background: #dcfce7; }

.ctrl-bad:hover  { transform: translateY(-2px); }
.ctrl-good:hover { transform: translateY(-2px); }

/* Bottom row (counters at ends, progress centered) */
.fc-bottom {
  width: min(560px, 86vw);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}
 .fc-bottom .corner { font-weight: 700; font-size: 14px; opacity: .9; }

.fc-bottom .corner-left, .fc-bottom .corner-right {
  width: 64px;
  height: 32px;
  border-radius: 0.25rem;
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: 700;
  color: var(--text);
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fc-bottom .corner .corner-content {
  display: flex;
  align-items: center;
  gap: 8px;
}


.fc-progress { width: 100%; }
.progress-text { text-align: center; font-weight: 600; margin-bottom: 6px; }
.bar { height: 6px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; background: linear-gradient(90deg,#60a5fa,#22c55e); width: 0; }


/* Empty state */
.fc-empty { width: var(--card-w); text-align: center; margin-top: 24px; }
.fc-empty h3 { margin: 0 0 6px; }

/* Restart button */
.fc-restart {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 6px 16px rgba(0,0,0,.08);
  background: linear-gradient(90deg, #60a5fa, #22c55e);
  color: white;
}
.fc-restart:hover { transform: translateY(-1px); }

.fc-back .fc-content-wrap{
  width: 90%;
  max-height: calc(var(--card-h) - 120px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
}

/* întrebarea mică, sus */
.fc-question-mini{
  font-size: 14px;
  line-height: 1.35;
  color: #64748b;          /* gri discret */
}

/* răspunsul (deja aveai .answer-html; o întărim puțin) */
.fc-back .answer-html{
  width: 100%;
  text-align: left;
  font-size: 15px;
  line-height: 1.5;
}

`;
