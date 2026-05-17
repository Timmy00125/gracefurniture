import { useEffect, useState } from "react";
import { generateTastingNote } from "@/lib/gemini";
import type { MenuItem, TastingNote } from "@/types/menu";

// In-memory cache so revisiting an item doesn't burn a Gemini call.
const cache = new Map<string, TastingNote>();

interface State {
  note: TastingNote | null;
  loading: boolean;
}

export function useGeminiInsights(item: MenuItem | null): State {
  const [state, setState] = useState<State>({ note: null, loading: false });

  useEffect(() => {
    if (!item) {
      setState({ note: null, loading: false });
      return;
    }

    const cached = cache.get(item.id);
    if (cached) {
      setState({ note: cached, loading: false });
      return;
    }

    let cancelled = false;
    setState({ note: null, loading: true });

    generateTastingNote(item).then((note) => {
      if (cancelled) return;
      cache.set(item.id, note);
      setState({ note, loading: false });
    });

    return () => {
      cancelled = true;
    };
  }, [item]);

  return state;
}
