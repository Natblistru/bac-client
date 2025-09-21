import { useEffect } from "react";
import "../App.css"

export default function Dialog({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dlg-overlay" onClick={onClose}>
      <div
        className="dlg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 id="dlg-title">{title}</h3>}
        <div className="dlg-body">{children}</div>
        <div className="dlg-actions">
          <button type="button" onClick={onClose}>
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}
