import { useState, useEffect } from "react";
import deluxLogo from "@/assets/delux-logo.png";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [showDot, setShowDot] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const dotTimer = setTimeout(() => setShowDot(true), 500);
    const fadeTimer = setTimeout(() => setFadeOut(true), 750);
    const completeTimer = setTimeout(onComplete, 900);
    return () => {
      clearTimeout(dotTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-150 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-1">
        <img
          src={deluxLogo}
          alt="Delux"
          className="h-14 animate-fade-in"
        />
        <span
          className={`text-4xl font-bold text-primary transition-all duration-300 ${
            showDot ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          .
        </span>
      </div>
    </div>
  );
}
