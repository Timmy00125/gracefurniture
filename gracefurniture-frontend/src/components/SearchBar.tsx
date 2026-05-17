interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <label className="relative block">
      <span className="sr-only">Search pieces</span>
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ color: "var(--color-cream-faint)" }}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search pieces, materials, rooms…"
        className="w-full bg-transparent border rounded-full pl-11 pr-5 py-3 text-sm outline-none transition-colors"
        style={{
          borderColor: "var(--color-line)",
          color: "var(--color-cream)",
          fontFamily: "var(--font-sans)",
        }}
      />
    </label>
  );
}
