import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./ResizableSplit.css";

export default function ResizableSplit({
  children,
  initial = 50,      // % din lățimea containerului pentru panoul stâng
  minLeft = 260,     // px minim stânga
  minRight = 320,    // px minim dreapta
  storageKey = "split-left%"
}) {
  const [leftChild, rightChild] = React.Children.toArray(children);
  const wrapRef = useRef(null);
  const percentRef = useRef(
    Number(localStorage.getItem(storageKey)) || initial
  );
  const [leftPx, setLeftPx] = useState(0);
  const draggingRef = useRef(false);

  // calculează px din procent, la mount + resize
  const recalcFromPercent = () => {
    const el = wrapRef.current;
    if (!el) return;
    const W = el.clientWidth;
    let px = Math.round((percentRef.current / 100) * W);
    px = clamp(px, minLeft, W - minRight);
    setLeftPx(px);
  };

  useLayoutEffect(() => {
    recalcFromPercent();
    const onResize = () => recalcFromPercent();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const startDrag = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("mouseleave", stopDrag);
  };

  const onMove = (e) => {
    if (!draggingRef.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const W = rect.width;
    const x = clamp(e.clientX - rect.left, minLeft, W - minRight);
    setLeftPx(x);
    percentRef.current = Math.round((x / W) * 100);
  };

  const stopDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    document.body.style.userSelect = "";
    localStorage.setItem(storageKey, String(percentRef.current));
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", stopDrag);
    window.removeEventListener("mouseleave", stopDrag);
  };

  const reset = () => {
    percentRef.current = initial;
    recalcFromPercent();
  };

  // suport tastatură (accesibil): săgeți +/-10px, Enter = reset
  const onKeyDown = (e) => {
    if (!wrapRef.current) return;
    const W = wrapRef.current.clientWidth;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const delta = e.key === "ArrowLeft" ? -10 : 10;
      const x = clamp(leftPx + delta, minLeft, W - minRight);
      setLeftPx(x);
      percentRef.current = Math.round((x / W) * 100);
      localStorage.setItem(storageKey, String(percentRef.current));
      e.preventDefault();
    } else if (e.key === "Enter") {
      reset();
      e.preventDefault();
    }
  };

  return (
    <div
      className="split"
      ref={wrapRef}
      style={{ gridTemplateColumns: `${leftPx}px 8px 1fr` }}
    >
      <section>{leftChild}</section>

      <div
        className="divider"
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={minLeft}
        aria-valuemax={100 - minRight}
        aria-valuenow={leftPx}
        tabIndex={0}
        onMouseDown={startDrag}
        onDoubleClick={reset}
        onKeyDown={onKeyDown}
        title="Trage pentru a redimensiona (dublu-click = reset)"
      >
        <span className="grip" />
      </div>

      <aside>{rightChild}</aside>
    </div>
  );
}
