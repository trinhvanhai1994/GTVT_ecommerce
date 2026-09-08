import { useRef } from "react";
import { Link } from "react-router-dom";

export default function MagneticButton({ to, children, className = "btn btn-primary" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    ref.current.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
  };

  const reset = () => {
    ref.current.style.transform = "translate(0,0)";
  };

  return (
    <Link ref={ref} to={to} className={className} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </Link>
  );
}
