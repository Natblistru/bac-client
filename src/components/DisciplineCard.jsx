import { useState } from "react";

export default function DisciplineCard({ title, color = "#2b6cb0", onEvaluari, onTeme, icon = "🎓" }) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <article
      className={`disc-card ${open ? "open" : ""}`}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={toggle}
      onKeyDown={onKey}
      aria-expanded={open}
    >
      <div className="disc-head">
        <span className="disc-icon" aria-hidden="true" style={{ backgroundColor: color }}>
          {icon}
        </span>
        <h3 className="disc-title">{title}</h3>
      </div>

      <div className="disc-actions" onClick={(e) => e.stopPropagation()}>
        <button className="pill" onClick={onEvaluari}>Evaluări</button>
        <button className="pill alt" onClick={onTeme}>Teme</button>
      </div>
    </article>
  );
}