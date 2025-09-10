// src/pages/Topic.jsx
import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../routes/api";
import YouTubeLite from "./YouTubeLite";
import VideoBreakpoints from './VideoBreakpoints';
import PresentationLite from "./PresentationLite";
import Presentation from "./Presentation";
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
            include_presentations: 1,   
            include_breakpoints: 1,
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

  const toAbsoluteStorageUrl = (p) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    if (p.startsWith("/")) return apiBase + p;
    return apiBase + "/storage/" + p;
  };

  console.log(row)

  const cards = [
  {
    id: 1,
    front: "Which SQL statement returns the number of customers in each city?",
    back:
      "SELECT city, COUNT(*) AS customers\\nFROM Customers\\nGROUP BY city;",
  },
  {
    id: 2,
    front: "What does GROUP BY do?",
    back:
      "It aggregates rows by the listed column(s) so you can apply functions\nlike COUNT(), SUM(), AVG(), etc. to each group.",
  },
  {
    id: 3,
    front: "How to limit to the first 10 rows in SQL Server?",
    back: "SELECT TOP (10) * FROM SomeTable;",
  },
  ];

  return (
    <div className="page topic-page" style={{ padding: 16, maxWidth: 900, margin: "0 auto 72px" }}>
      <header className="topic-head" style={{ marginBottom: 16 }}>
        <button onClick={() => navigate(-1)} className="btn-back" style={{ marginBottom: 8 }}>
          &larr; Înapoi
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={coverSrc}
            alt={row?.name ?? 'Copertă topic'}
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
      {/* {(row?.presentations ?? []).length > 0 && (
        <section className="presentations">
          <h2>Prezentări</h2>
          <div className="presentations-grid">
            {row.presentations.map((p) => (
              <figure key={p.id} className="presentation-card">
                <PresentationLite
                  src={p.path}
                  title={p.name}
                  poster={toAbsoluteStorageUrl(p.thumbnail_url)}   
                  autoloadOnView={false} 
                />
                {p?.content_text && (
                  <figcaption className="presentation-notes">
                    {p.content_text}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )} */}
      <Flashcards cards={cards} />
    </div>
  );
}
