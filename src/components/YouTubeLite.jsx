// YouTubeLite.jsx
import { useState } from "react";
import "./Topic.css"

const getYouTubeId = (src) => {
  try {
    const u = new URL(src);
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    return m ? m[1] : null;
  } catch { return null; }
};

export default function YouTubeLite({ src, title }) {
  const [play, setPlay] = useState(false);
  const vid = getYouTubeId(src);
  const thumb = vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : null;

  return (
    <div
      className="yt-lite"
      role="button"
      tabIndex={0}
      onClick={() => setPlay(true)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPlay(true)}
    >
      {!play ? (
        <>
          {thumb && <img src={thumb} alt="" loading="lazy" decoding="async" />}
          <div className="yt-play" aria-label={`Redă ${title}`} />
        </>
      ) : (
        <iframe
          src={`${src}${src.includes("?") ? "&" : "?"}autoplay=1`}
          title={`YouTube – ${title}`}
          allow="picture-in-picture; fullscreen; autoplay"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
}
