import { motion } from "motion/react";
import { Link } from "react-router-dom";
import type { Product } from "@/types/menu";

interface Props {
  item: Product;
  index: number;
}

export function MenuItemCard({ item, index }: Props) {
  const arReady = Boolean(item.modelUrl);

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.06 * index,
        ease: [0.22, 1, 0.36, 1],
        duration: 0.55,
      }}
      className="list-none"
    >
      <Link to={`/item/${item.id}`} className="group block">
        {/* Image plate — tall, magazine-style */}
        <div
          className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3"
          style={{ background: "var(--color-walnut-2)" }}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />

          {/* AR badge — top right */}
          {arReady && (
            <span className="badge-ar absolute top-3 right-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-2.5 h-2.5"
              >
                <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" />
                <path d="M3 7l9 5 9-5" />
                <path d="M12 12v10" />
              </svg>
              AR
            </span>
          )}

          {/* Coming-soon / bestseller ribbon — top left */}
          {item.isComingSoon ? (
            <span
              className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] tracking-[0.2em] uppercase font-semibold"
              style={{
                background: "var(--color-walnut)",
                color: "var(--color-brass)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Soon
            </span>
          ) : item.isBestseller ? (
            <span
              className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] tracking-[0.2em] uppercase font-semibold"
              style={{
                background: "var(--color-cream)",
                color: "var(--color-walnut)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Bestseller
            </span>
          ) : null}

          {/* Stock-low strip — bottom */}
          {item.stock !== undefined && item.stock > 0 && item.stock <= 3 && (
            <span
              className="absolute bottom-3 left-3 right-3 text-center text-[9px] tracking-[0.2em] uppercase py-1 rounded"
              style={{
                background: "rgba(21,17,12,0.65)",
                backdropFilter: "blur(8px)",
                color: "var(--color-clay)",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
              }}
            >
              Only {item.stock} left
            </span>
          )}
        </div>

        {/* Caption */}
        <div className="px-1">
          <h3
            className="text-[15px] mb-1"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            {item.name}
          </h3>
          <p
            className="text-[11px] tracking-[0.04em] mb-2 truncate"
            style={{ color: "var(--color-cream-dim)" }}
          >
            {item.materials.slice(0, 2).join(" · ")}
          </p>
          <div className="flex items-baseline justify-between">
            <p
              className="text-[15px]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-brass)",
                fontWeight: 400,
              }}
            >
              ${item.price.toLocaleString()}
            </p>
            <p
              className="text-[9px] tracking-[0.16em] uppercase"
              style={{ color: "var(--color-cream-faint)" }}
            >
              {item.style}
            </p>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
