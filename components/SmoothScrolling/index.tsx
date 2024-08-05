// components/Scroll.tsx
import { useEffect, ReactNode } from "react";
import Lenis from "@studio-freight/lenis";

interface ScrollProps {
  children: ReactNode;
}

const SmoothScrolling: React.FC<ScrollProps> = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      },
      touchMultiplier: 2,
    });

    function scroll(time: number) {
      lenis.raf(time);
      requestAnimationFrame(scroll);
    }

    requestAnimationFrame(scroll);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrolling;
