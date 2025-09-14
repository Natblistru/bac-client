import { useState, useEffect, useRef } from "react";
import "./DraggableModal.css"

export default function DraggableModal({ title = "Sursa", html = "", onClose }) {
  const boxRef = useRef(null);
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const [drag, setDrag] = useState(null); // { offX, offY } sau null

  // închidere cu Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const nx = e.clientX - drag.offX;
      const ny = e.clientY - drag.offY;

      // opțional: limite simple în viewport
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
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        // click pe overlay => închide
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={boxRef}
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ left: pos.x, top: pos.y }}
      >
        <div
          className="modal-header"
          onMouseDown={startDrag}
          role="toolbar"
          aria-label="Bara modal"
        >
          <strong className="modal-title">{title}</strong>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Închide"
          >
            ✕
          </button>
        </div>

        <div
          className="modal-body"
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      </div>
    </div>
  );
}
