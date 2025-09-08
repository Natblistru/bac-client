// src/pages/Topic.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../routes/api";
import YouTubeLite from "./YouTubeLite";
import "./Topic.css"


export default function Topic() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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
            include_videos: 1,          // sau true, dar 1/0 e mai sigur
            include_presentations: 1,   // idem
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
            onError={(e) => { e.currentTarget.src = '/images/topic-fallback.png'; }}
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
              <figure key={v.id} className="video-card">
                <YouTubeLite src={v.source} title={v.title} />
                <figcaption className="video-title">{v.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
