import { useRef } from "react";
import type { Product } from "@/types/menu";

interface Props {
  item: Product;
  onActivate?: () => void;
}

export function ARViewer({ item, onActivate }: Props) {
  const ref = useRef<HTMLElement>(null);

  if (!item.modelUrl) return null;

  function launchAR() {
    const el = ref.current as (HTMLElement & { activateAR?: () => void }) | null;
    if (el?.activateAR) {
      el.activateAR();
      onActivate?.();
    }
  }

  return (
    <div className="relative w-full h-full">
      <model-viewer
        ref={ref as never}
        src={item.modelUrl}
        ios-src={item.usdzUrl}
        alt={`3D model of ${item.name}`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        ar-placement="floor"
        camera-controls
        auto-rotate
        auto-rotate-delay={1500}
        rotation-per-second="20deg"
        shadow-intensity="1.4"
        shadow-softness="0.8"
        exposure="1"
        environment-image="neutral"
        loading="eager"
        reveal="auto"
        interaction-prompt="auto"
        style={{ width: "100%", height: "100%" }}
      />
      <button
        type="button"
        onClick={launchAR}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full"
        style={{
          background: "var(--color-copper)",
          color: "var(--color-walnut)",
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "0.7rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-3.5 h-3.5"
        >
          <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" />
          <path d="M3 7l9 5 9-5" />
          <path d="M12 12v10" />
        </svg>
        Place in your room
      </button>
    </div>
  );
}
