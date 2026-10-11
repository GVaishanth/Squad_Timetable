// The beam of light that circles a .bifrost-box border.
// A pre-painted conic gradient is ROTATED with a CSS transform inside a ring
// mask, so the GPU compositor animates it without any per-frame repaint.
// Off-screen runners are hidden (shared IntersectionObserver) so they cost nothing.
import { useEffect, useRef } from 'react';

let observer = null;
function getObserver() {
  if (!observer && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle('idle', !e.isIntersecting);
      },
      { rootMargin: '150px' },
    );
  }
  return observer;
}

export default function BifrostRunner() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const io = getObserver();
    if (!el || !io) return undefined;
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return (
    <span ref={ref} className="bifrost-runner" aria-hidden="true">
      <i />
    </span>
  );
}
