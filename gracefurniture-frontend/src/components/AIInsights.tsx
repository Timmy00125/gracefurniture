import { motion } from "motion/react";
import type { StylingNote } from "@/types/menu";

interface Props {
  note: StylingNote | null;
  loading: boolean;
}

export function AIInsights({ note, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3" aria-live="polite" aria-busy="true">
        <Skeleton w="38%" h="0.65rem" />
        <Skeleton w="100%" h="0.95rem" />
        <Skeleton w="88%" h="0.95rem" />
        <Skeleton w="60%" h="0.95rem" />
      </div>
    );
  }

  if (!note) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <p className="eyebrow">Stylist · AI note</p>
      <p
        className="text-[17px] leading-[1.45]"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 300,
          color: "var(--color-cream)",
          letterSpacing: "-0.01em",
        }}
      >
        “{note.description}”
      </p>

      {note.roomFit && (
        <p className="text-xs" style={{ color: "var(--color-cream-dim)" }}>
          <span className="eyebrow mr-2">Room fit</span>
          {note.roomFit}
        </p>
      )}

      {note.highlights && note.highlights.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1">
          {note.highlights.map((h) => (
            <li key={h} className="chip">
              {h}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function Skeleton({ w, h }: { w: string; h: string }) {
  return (
    <div
      className="rounded animate-pulse"
      style={{
        width: w,
        height: h,
        background: "var(--color-walnut-3)",
      }}
    />
  );
}
