import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category, Product } from "@/types/menu";
import { CATEGORIES, CATALOG } from "@/data/mockMenu";

// ─────────────────────────────────────────────────────────────
// Single source of truth for catalog data.
// — Tries the backend API at /api/catalog/:storeId first.
// — Falls back to mock data on any failure.
// The UI never has to know which path is live.
// ─────────────────────────────────────────────────────────────

interface CatalogState {
  categories: Category[];
  items: Product[];
  loading: boolean;
  error: string | null;
}

export function useMenu(storeId = "gracefurniture"): CatalogState {
  const [state, setState] = useState<CatalogState>({
    categories: [],
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get(`/catalog/${storeId}`);
        const cats: Category[] = res.data.categories || [];
        const items: Product[] = res.data.items || [];

        if (!cancelled) {
          setState({
            categories: cats.length ? cats : CATEGORIES,
            items: items.length ? items : CATALOG,
            loading: false,
            error: null,
          });
        }
      } catch {
        // API not wired up yet — silently fall back to mock data.
        if (!cancelled) {
          setState({
            categories: CATEGORIES,
            items: CATALOG,
            loading: false,
            error: null,
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return state;
}
