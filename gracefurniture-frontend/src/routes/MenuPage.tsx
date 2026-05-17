import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { MenuHeader } from "@/components/MenuHeader";
import { CategoryNav } from "@/components/CategoryNav";
import { SearchBar } from "@/components/SearchBar";
import { MenuItemCard } from "@/components/MenuItemCard";
import { useMenu } from "@/hooks/useMenu";
import type { Product, ProductStyle } from "@/types/menu";

type StyleFilter = "All" | ProductStyle;
const STYLE_FILTERS: StyleFilter[] = [
  "All",
  "Modern",
  "Mid-century",
  "Brutalist",
  "Japandi",
  "Industrial",
];

export default function MenuPage() {
  const { categories, items, loading } = useMenu();
  const [activeCat, setActiveCat] = useState<string>("sofas");
  const [filter, setFilter] = useState<StyleFilter>("All");
  const [search, setSearch] = useState("");

  // Featured hero — the single bestseller that's also AR-ready.
  // Falls back to the first AR-ready piece if no bestseller exists.
  const featured = useMemo<Product | null>(() => {
    if (!items.length) return null;
    return (
      items.find((p) => p.isBestseller && p.modelUrl) ??
      items.find((p) => p.modelUrl) ??
      items[0] ??
      null
    );
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (item.categoryId !== activeCat) return false;
      if (filter !== "All" && item.style !== filter) return false;
      if (q) {
        const hay = `${item.name} ${item.materials.join(" ")} ${item.style} ${item.tagline}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, activeCat, filter, search]);

  const activeCategoryName =
    categories.find((c) => c.id === activeCat)?.name ?? "";

  return (
    <main className="max-w-2xl mx-auto px-6 pb-28">
      <MenuHeader />

      {/* ─── Featured hero ───────────────────────────────────── */}
      {featured && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="mb-12"
        >
          <Link
            to={`/item/${featured.id}`}
            className="block relative overflow-hidden rounded-3xl group"
          >
            <div
              className="aspect-[5/4] sm:aspect-[16/10]"
              style={{ background: "var(--color-walnut-2)" }}
            >
              <img
                src={featured.imageUrl}
                alt={featured.name}
                className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              {/* Editorial gradient overlay */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 30%, rgba(21,17,12,0.85) 100%)",
                }}
              />
            </div>

            {/* Caption */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p
                className="eyebrow mb-3"
                style={{ color: "var(--color-brass)" }}
              >
                Featured · Live preview in AR
              </p>
              <h2
                className="headline text-[clamp(1.8rem,5vw,2.6rem)] mb-2"
                style={{ color: "var(--color-cream)" }}
              >
                {featured.name}
              </h2>
              <p
                className="text-sm mb-5 max-w-md"
                style={{ color: "var(--color-cream-dim)" }}
              >
                {featured.tagline}
              </p>
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px]"
                style={{
                  background: "var(--color-copper)",
                  color: "var(--color-walnut)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3 h-3"
                >
                  <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" />
                  <path d="M3 7l9 5 9-5" />
                  <path d="M12 12v10" />
                </svg>
                See it in your room
              </span>
            </div>
          </Link>
        </motion.section>
      )}

      {/* ─── Categories ─────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="eyebrow">Browse</p>
          <p
            className="eyebrow text-[10px]"
            style={{ color: "var(--color-brass)" }}
          >
            {items.filter((p) => p.modelUrl).length} pieces ready for AR
          </p>
        </div>
        <CategoryNav
          categories={categories}
          active={activeCat}
          onChange={setActiveCat}
        />
      </div>

      {/* ─── Search ─────────────────────────────────────────── */}
      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* ─── Section header + style filters ────────────────── */}
      <div className="flex items-end justify-between mb-5 gap-4">
        <div>
          <p
            className="eyebrow mb-1"
            style={{ color: "var(--color-cream-faint)" }}
          >
            Collection
          </p>
          <h2
            className="font-display text-[32px] sm:text-[40px]"
            style={{ fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            {activeCategoryName}
          </h2>
        </div>
        <p
          className="eyebrow text-[10px] mb-2"
          style={{ color: "var(--color-cream-faint)" }}
        >
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <div
        className="flex gap-2 mb-6 overflow-x-auto -mx-6 px-6 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {STYLE_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="chip whitespace-nowrap"
            data-active={filter === s}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ─── Product grid ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.ul
          key={activeCat + filter + search}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 gap-x-4 gap-y-8"
        >
          {loading ? (
            <li className="col-span-2 py-12 text-center eyebrow">Loading…</li>
          ) : filtered.length === 0 ? (
            <li
              className="col-span-2 py-12 text-center font-display italic text-sm"
              style={{ color: "var(--color-cream-faint)" }}
            >
              No pieces match. Try another category or style.
            </li>
          ) : (
            filtered.map((item, i) => (
              <MenuItemCard key={item.id} item={item} index={i} />
            ))
          )}
        </motion.ul>
      </AnimatePresence>

      {/* ─── Footer note ────────────────────────────────────── */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-xs"
        style={{
          background: "var(--color-walnut-2)",
          border: "1px solid var(--color-line)",
          fontFamily: "var(--font-sans)",
          color: "var(--color-cream-dim)",
        }}
      >
        <span aria-hidden>✦</span>
        Free shipping over $1,500
      </div>
    </main>
  );
}
