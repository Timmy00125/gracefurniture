import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useMenu } from "@/hooks/useMenu";
import { useGeminiInsights } from "@/hooks/useGeminiInsights";
import { ARViewer } from "@/components/ARViewer";
import { AIInsights } from "@/components/AIInsights";

export default function ItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, loading } = useMenu();
  const item = items.find((i) => i.id === id) ?? null;
  const [showAR, setShowAR] = useState(false);

  const { note, loading: noteLoading } = useGeminiInsights(item);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center eyebrow">
        Loading…
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="font-display text-3xl">Piece not found</h2>
        <Link to="/" className="eyebrow underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  const hasModel = Boolean(item.modelUrl);
  const dims = item.dimensions;

  return (
    <main className="max-w-xl mx-auto px-6 pb-32 min-h-dvh">
      {/* ─── Top bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-10 h-10 rounded-full flex items-center justify-center border hairline"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <p className="eyebrow">Grace Furniture</p>
        <button
          aria-label="Save to wishlist"
          className="w-10 h-10 rounded-full flex items-center justify-center border hairline"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* ─── Hero: image OR AR viewer ─────────────────────── */}
      <div
        className="relative aspect-square rounded-3xl overflow-hidden mb-8"
        style={{ background: "var(--color-walnut-2)" }}
      >
        <AnimatePresence mode="wait">
          {showAR && hasModel ? (
            <motion.div
              key="ar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <ARViewer item={item} />
              <button
                onClick={() => setShowAR(false)}
                className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[10px] eyebrow"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(8px)",
                  color: "var(--color-cream)",
                }}
              >
                ← Photo
              </button>
            </motion.div>
          ) : (
            <motion.img
              key="img"
              src={item.imageUrl}
              alt={item.name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Style tag overlay */}
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px]"
          style={{
            background: "rgba(21,17,12,0.7)",
            backdropFilter: "blur(8px)",
            color: "var(--color-brass)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {item.style}
        </span>
      </div>

      {/* ─── Title block ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <h1
          className="font-display mb-2"
          style={{
            fontSize: "clamp(2rem, 6.5vw, 2.8rem)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {item.name}
          {item.isBestseller && (
            <span
              className="inline-block ml-2 align-middle text-[10px] px-2 py-0.5 rounded"
              style={{
                background: "var(--color-cream)",
                color: "var(--color-walnut)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                verticalAlign: "middle",
              }}
            >
              Bestseller
            </span>
          )}
        </h1>
        <p
          className="font-display italic text-sm mb-4"
          style={{
            color: "var(--color-brass)",
            fontWeight: 300,
          }}
        >
          {item.tagline}
        </p>
        <div className="flex items-baseline gap-3">
          <span
            className="font-display"
            style={{
              fontSize: "1.8rem",
              color: "var(--color-copper)",
              fontWeight: 400,
            }}
          >
            ${item.price.toLocaleString()}
          </span>
          {item.stock !== undefined && item.stock > 0 && item.stock <= 3 && (
            <span
              className="eyebrow text-[10px]"
              style={{ color: "var(--color-clay)" }}
            >
              · Only {item.stock} left
            </span>
          )}
        </div>
      </motion.div>

      {/* ─── Dimensions card ─────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="rounded-2xl border hairline p-5 mb-6"
        style={{ background: "var(--color-walnut-2)" }}
      >
        <p className="eyebrow mb-3">Dimensions</p>
        <div className="grid grid-cols-3 gap-4">
          <Dim label="Width" value={dims.width} />
          <Dim label="Depth" value={dims.depth} />
          <Dim label="Height" value={dims.height} />
        </div>
        <p
          className="text-[10px] mt-3 tracking-[0.1em]"
          style={{ color: "var(--color-cream-faint)" }}
        >
          AR view is to-scale — what you see is what arrives.
        </p>
      </motion.section>

      {/* ─── Materials chips ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        className="mb-8"
      >
        <p className="eyebrow mb-3">Materials</p>
        <ul className="flex flex-wrap gap-2">
          {item.materials.map((m) => (
            <li
              key={m}
              className="px-3 py-1.5 rounded-full border text-[11px] tracking-[0.16em] uppercase"
              style={{
                borderColor: "var(--color-copper)",
                color: "var(--color-copper)",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
              }}
            >
              {m}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* ─── Primary CTAs ────────────────────────────────── */}
      {item.isComingSoon ? (
        <button
          type="button"
          disabled
          className="btn-ghost w-full py-4 rounded-full text-sm mb-3 opacity-70 cursor-not-allowed"
        >
          Coming Soon · Notify Me
        </button>
      ) : (
        <button
          type="button"
          className="btn-copper w-full py-4 rounded-full text-sm mb-3"
        >
          Add to Cart
        </button>
      )}

      {/* AR CTA — only renders when there's a model */}
      {hasModel && (
        <button
          type="button"
          onClick={() => setShowAR(true)}
          className="w-full py-3 text-sm flex items-center justify-center gap-2 rounded-full"
          style={{
            color: "var(--color-copper)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
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
      )}

      {hasModel && (
        <p
          className="text-center eyebrow text-[10px] mt-2 mb-10"
          style={{ color: "var(--color-cream-faint)" }}
        >
          Tap to live preview ⌃
        </p>
      )}

      {/* ─── Stylist AI note ─────────────────────────────── */}
      <section
        className="rounded-3xl border hairline p-6 mb-6"
        style={{ background: "var(--color-walnut-2)" }}
      >
        <AIInsights note={note} loading={noteLoading} />
      </section>

      {/* ─── Description ─────────────────────────────────── */}
      <section>
        <p className="eyebrow mb-3">About this piece</p>
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--color-cream-dim)" }}
        >
          {item.description}
        </p>
      </section>
    </main>
  );
}

function Dim({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p
        className="text-[9px] tracking-[0.22em] uppercase mb-1"
        style={{ color: "var(--color-cream-faint)" }}
      >
        {label}
      </p>
      <p
        className="font-display text-[20px]"
        style={{
          color: "var(--color-cream)",
          fontWeight: 400,
        }}
      >
        {value}
        <span
          className="text-[10px] ml-1"
          style={{ color: "var(--color-cream-dim)" }}
        >
          cm
        </span>
      </p>
    </div>
  );
}
