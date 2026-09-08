import { useEffect, useRef } from "react";

export default function EnergyCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w;
    let h;
    const particles = Array.from({ length: 48 }, () => spawn());
    let raf;

    function spawn() {
      return {
        x: Math.random(),
        y: Math.random(),
        v: 0.0015 + Math.random() * 0.004,
        s: 0.6 + Math.random() * 1.8,
        a: 0.15 + Math.random() * 0.45
      };
    }

    function resize() {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.v;
        if (p.x > 1.1) Object.assign(p, spawn(), { x: -0.05 });
        const x = p.x * w;
        const y = p.y * h + Math.sin(p.x * 12) * 18;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(196,77,255,${p.a})`;
        ctx.lineWidth = p.s;
        ctx.moveTo(x, y);
        ctx.lineTo(x - 40 * p.s, y);
        ctx.stroke();
      });
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="energy" ref={ref} />;
}
