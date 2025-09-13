// src/pages/Topic.jsx
import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../routes/api";
import YouTubeLite from "./YouTubeLite";
import VideoBreakpoints from './VideoBreakpoints';
import EvalItemsSlider from "./EvalItemsSlider"
import Flashcards from "./Flashcards";
import "./Topic.css"

const toEmbedUrl = (u) => {
  try {
    const url = new URL(u);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    const id = url.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;
    return u;
  } catch {
    return u;
  }
};

export default function Topic() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // refs per video-card (figure). Căutăm iframe-ul randat de YouTubeLite.
  const wrapperRefs = useRef({});

  const handleBreakpointClick = (videoId, seconds) => {
    const wrapper = wrapperRefs.current[videoId];
    const iframe = wrapper?.querySelector("iframe");
    if (!iframe) return; // probabil încă nu a fost inițializat playerul

    // păstrăm baza pentru a nu concatena parametrii la infinit
    const base =
      iframe.dataset.baseSrc || toEmbedUrl(iframe.src || "");
    iframe.dataset.baseSrc = base;

    const sep = base.includes("?") ? "&" : "?";
    iframe.src =
      `${base}${sep}start=${seconds}&autoplay=1&enablejsapi=1`;

    const postPause = () => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "pauseVideo",
          args: [],
        }),
        "*"
      );
    };

    // după reîncărcarea src-ului, încercăm să punem pe pauză
    iframe.addEventListener("load", postPause, { once: true });
    setTimeout(postPause, 600);
  };

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        // ruta din Laravel: Route::get('/topics/{id}', TopicController@show)
        const { data } = await api.get(`/api/topics/${id}`, {
          signal: ctrl.signal,
          params: {
            include_videos: 1,          
            include_presentations: 0,   
            include_breakpoints: 1,
            include_flip_cards: 1,
            include_subtopics: 1,       
          },
        });
        if (alive) setRow(data);
      } catch (e) {
        if (alive) setErr("Nu s-a putut încărca topicul.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [id]);

  if (loading) return <div className="page"><div>Se încarcă…</div></div>;
  if (err) return (
    <div className="page">
      <button onClick={() => navigate(-1)}>&larr; Înapoi</button>
      <div style={{ color: "#b91c1c", marginTop: 12 }}>{err}</div>
    </div>
  );
  if (!row) return <div className="page">Nu s-a găsit topicul.</div>;

  // content poate fi null sau un JSON cu { html: "<p>...</p>" }
  const contentHtml =
    (row?.content && (row.content.html || row.content?.HTML || row.content?.Html)) || "";

  const apiBase = process.env.REACT_APP_API_URL || ""; // "http://localhost:8000"

  const coverSrc =
    (row?.cover_url?.startsWith('http')
      ? row.cover_url
      : apiBase + (row?.cover_url || ''))
    || (apiBase + '/storage/' + (row?.path || '')); // fallback

  console.log(row)

  const cards = (row?.flip_cards ?? row?.flipCards ?? []).map((fc, i) => {
    const front = fc.task;
    const back  = fc.answer;
    console.log('[flipcard]', i, { id: fc.id, fc, front, back });
    return { id: fc.id, front, back };
  });

  function Chevron() {
    return (
      <svg className="acc-chevron" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.12 9.29L12 13.17l3.88-3.88 1.41 1.41L12 16l-5.29-5.29z" fill="currentColor"/>
      </svg>
    );
  }

  return (
    <div className="page topic-page" style={{ padding: 16, maxWidth: 900, margin: "0 auto 72px" }}>
      <header className="topic-head" style={{ marginBottom: 16 }}>
        <button onClick={() => navigate(-1)} className="btn-back" style={{ marginBottom: 8 }}>
          &larr; Înapoi
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={coverSrc}
            alt={'Imagine topic'}
            width={72}
            height={72}
            style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover' }}
          />
          <h1 style={{ margin: 0 }}>{row.name ?? "Fără titlu"}</h1>
        </div>
      </header>

      {/* Dacă ai HTML în content.html */}
      {contentHtml ? (
          <article
            className="topic-content reading"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
      ) : (
        <p style={{ opacity: 0.7 }}>Nu există conținut pentru acest topic.</p>
      )}

      {(row?.videos ?? []).length > 0 && (
        <section className="videos">
          <h2>Videouri</h2>
          <div className="video-grid">
            {row.videos.map(v => (
              <figure
                key={v.id}
                className="video-card"
                ref={(el) => {
                  wrapperRefs.current[v.id] = el;
                }}
              >
                <YouTubeLite src={v.source} title={v.title} />
                <VideoBreakpoints
                  breakpoints={v.breakpoints || []}
                  onBreakpointClick={(s) =>
                    handleBreakpointClick(v.id, s)
                  }
                />
              </figure>
            ))}
          </div>
        </section>
      )}
      {cards.length > 0 && (
        <section className="flipcards">
          <h2>Flashcards</h2>
          <Flashcards cards={cards} />
        </section>
      )}

      {(row?.subtopics ?? []).length > 0 && (
        <section className="subtopics">
          <h2>Sarcini de evaluare</h2>

          <div className="accordion">
            {(row.subtopics ?? []).map((st) => (
              <details key={st.id} className="acc-item">
                <summary className="acc-summary">
                  <span className="acc-title">{st.name}</span>
                  <span className="acc-right">
                    {!!st.evaluation_items_count && (
                      <span className="acc-meta">
                        {st.evaluation_items_count} iteme
                      </span>
                    )}
                    <Chevron />
                  </span>
                </summary>

                <div className="acc-panel">
                  {(st.evaluation_items ?? []).length > 0 ? (
                    <EvalItemsSlider items={st.evaluation_items} />
                  ) : (
                    <p className="acc-empty">Nu sunt elemente pentru acest subtopic.</p>
                  )}

                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
