import { useEffect, useRef, useState } from "react";

function useInView(ref, rootMargin = "200px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setInView(true)),
      { rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/** Lite embed pentru prezentări (Google Slides sau alte embed-uri) */
export default function PresentationLite({
  src,
  title = "Presentation",
  poster,            // URL preview (ideal să-l salvezi în DB)
  autoloadOnView = false, // dacă vrei să încarce singur când intră în viewport
  aspect = "16 / 9",
}) {
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (autoloadOnView && inView) setActive(true);
  }, [autoloadOnView, inView]);

  // Heuristic opțional pentru Google Slides -> thumbnail
  const computedPoster =
    poster || guessSlidesPoster(src) || "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==";

  return (
    <div
      ref={wrapRef}
      className="pres"
      style={{ aspectRatio: aspect, position: "relative", borderRadius: 12, overflow: "hidden", background: "#f3f4f6" }}
    >
      {active ? (
        <iframe
          src={src}
          title={title}
          allowFullScreen
          loading="eager"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button
          type="button"
          className="pres-poster"
          onClick={() => setActive(true)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            border: 0, padding: 0, cursor: "pointer", background: "transparent"
          }}
        >
          <img
            src={computedPoster}
            alt={title}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <span
            className="pres-play"
            style={{
              position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
              padding: "10px 16px", borderRadius: 999, fontWeight: 700,
              background: "rgba(0,0,0,.55)", color: "#fff"
            }}
          >
            View
          </span>
        </button>
      )}
    </div>
  );
}

// Încearcă să deriveze thumbnail pentru Google Slides „/presentation/d/<ID>/...”
function guessSlidesPoster(embedUrl) {
  try {
    const u = new URL(embedUrl);
    const m = u.pathname.match(/\/presentation\/d\/([\w-]+)/);
    if (m && m[1]) {
      // thumbnail de Drive pentru fișierul de tip Slides
      return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1280`;
    }
  } catch {}
  return null;
}