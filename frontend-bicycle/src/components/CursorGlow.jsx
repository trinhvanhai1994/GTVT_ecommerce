import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
    };

    const tick = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
    };

    let running = true;
    const loop = () => {
      if (!running) return;
      tick();
      requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove);
    requestAnimationFrame(loop);
    return () => {
      running = false;
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <div className="cursor-glow" ref={ref} />;
}
