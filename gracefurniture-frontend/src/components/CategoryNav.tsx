import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { Category, CategoryIcon } from "@/types/menu";

interface Props {
  categories: Category[];
  active: string;
  onChange: (id: string) => void;
}

// Tiny stroked icons — restrained, architectural
const ICONS: Record<CategoryIcon, ReactNode> = {
  sofas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 14v4M21 14v4" />
      <path d="M3 14c0-2 1-3 3-3h12c2 0 3 1 3 3" />
      <path d="M5 14v-3c0-1 1-2 2-2h10c1 0 2 1 2 2v3" />
      <path d="M3 17h18" />
    </svg>
  ),
  chairs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M7 4v8h10V4" />
      <path d="M5 12h14" />
      <path d="M7 12v8M17 12v8" />
      <path d="M5 16h14" />
    </svg>
  ),
  tables: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 8h18" />
      <path d="M5 8v12M19 8v12" />
      <path d="M3 12h18" />
    </svg>
  ),
  desks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 7h18" />
      <path d="M5 7v13M19 7v13" />
      <path d="M5 13h7v6H5z" />
    </svg>
  ),
  beds: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 18v-7c0-1 1-2 2-2h14c1 0 2 1 2 2v7" />
      <path d="M3 15h18" />
      <path d="M6 9v-3h6v3" />
    </svg>
  ),
  storage: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 4h16v16H4z" />
      <path d="M4 9h16M4 14h16" />
      <path d="M12 4v16" />
    </svg>
  ),
  lighting: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M9 4h6l-2 8h-2z" />
      <path d="M12 12v8" />
      <path d="M9 20h6" />
    </svg>
  ),
};

export function CategoryNav({ categories, active, onChange }: Props) {
  return (
    <nav
      aria-label="Catalog categories"
      className="overflow-x-auto -mx-6 px-6 pb-2"
      style={{ scrollbarWidth: "none" }}
    >
      <ul className="flex gap-3 min-w-max">
        {categories.map((cat, i) => {
          const isActive = cat.id === active;
          return (
            <motion.li
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => onChange(cat.id)}
                className="group flex flex-col items-center gap-2 focus:outline-none"
                aria-pressed={isActive}
              >
                <span
                  className="w-[68px] h-[68px] rounded-2xl border flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isActive ? "var(--color-copper)" : "var(--color-walnut-2)",
                    borderColor: isActive ? "var(--color-copper)" : "var(--color-line)",
                    color: isActive ? "var(--color-walnut)" : "var(--color-cream-dim)",
                    boxShadow: isActive
                      ? "0 8px 30px -8px rgba(217,120,66,0.45)"
                      : "none",
                  }}
                >
                  <span className="w-7 h-7 block">{ICONS[cat.icon]}</span>
                </span>
                <span
                  className="eyebrow text-[10px]"
                  style={{
                    color: isActive
                      ? "var(--color-cream)"
                      : "var(--color-cream-faint)",
                  }}
                >
                  {cat.name}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
