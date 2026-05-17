import { motion } from "motion/react";

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 5) return "Late Night";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

export function MenuHeader() {
  const greeting = timeOfDay();

  return (
    <header className="relative pt-6 pb-8">
      {/* Top utility bar */}
      <div
        className="flex items-center justify-between mb-10"
        style={{ color: "var(--color-cream-dim)" }}
      >
        <span className="eyebrow">Catalog</span>
        <div className="flex items-center gap-5">
          <button aria-label="Currency" className="text-sm font-medium">
            $
          </button>
          <button aria-label="Search" aria-hidden="false" className="text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <button aria-label="Language" className="eyebrow text-[10px]">
            EN
          </button>
          <button
            aria-label="Account"
            className="w-7 h-7 rounded-full border hairline flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* The headline */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center relative"
      >
        <p
          className="font-display italic text-sm mb-3"
          style={{
            color: "var(--color-brass)",
            fontWeight: 300,
            letterSpacing: "0.02em",
          }}
        >
          {greeting}, friend
        </p>
        <h1 className="headline">
          <span className="block text-[clamp(2.5rem,9vw,5.5rem)]">GRACE</span>
          <span
            className="block text-[clamp(2.8rem,11vw,7rem)]"
            style={{ marginTop: "-0.18em" }}
          >
            <em className="it">furniture</em>
          </span>
        </h1>
        <p
          className="eyebrow mt-4 text-[10px]"
          style={{ color: "var(--color-cream-faint)" }}
        >
          Live with it — first
        </p>

        {/* Monogram mark — abstract chair silhouette */}
        <svg
          className="absolute -top-3 right-1 w-12 h-12 opacity-50"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          style={{ color: "var(--color-brass)" }}
          aria-hidden="true"
        >
          <path d="M14 14h36" />
          <path d="M14 14v18l36-2V14" />
          <path d="M18 30v18" />
          <path d="M46 28v20" />
          <path d="M14 48h36" />
        </svg>
      </motion.div>
    </header>
  );
}
