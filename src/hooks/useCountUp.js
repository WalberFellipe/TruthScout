import { useEffect, useState } from "react";

export function useCountUp(target, duration = 1400, startWhen = true) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!startWhen) return;
    let raf;
    let start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, startWhen]);
  return v;
}
