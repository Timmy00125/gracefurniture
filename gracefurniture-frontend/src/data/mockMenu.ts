import type { Category, Product } from "@/types/menu";

export const CATEGORIES: Category[] = [
  { id: "sofas", name: "Sofas", order: 1, icon: "sofas" },
  { id: "chairs", name: "Chairs", order: 2, icon: "chairs" },
];

const AR_ITEMS: Product[] = [
  {
    id: "mara-modular-sofa",
    categoryId: "sofas",
    name: "Mara Modular Sofa",
    price: 4800,
    tagline: "Three-seat. Aniline leather. Solid oak base.",
    description:
      "A low, generous seat in aniline-tanned saddle leather over a solid white-oak plinth. Designed in our Lagos studio, made-to-order over twelve weeks. Patinates beautifully with use.",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&auto=format&fit=crop&q=80",
    ],
    modelUrl: "/models/Couch.glb",
    dimensions: { width: 240, depth: 96, height: 72 },
    materials: ["Aniline Leather", "Solid Oak", "Down Fill"],
    style: "Modern",
    isBestseller: true,
    stock: 4,
  },
  {
    id: "halden-linen-three",
    categoryId: "sofas",
    name: "Halden 3-Seater",
    price: 2400,
    tagline: "Belgian linen. Ash frame. Goose-down cushions.",
    description:
      "The everyday answer to a long Sunday. Loose covers in pre-washed Belgian linen, removable for cleaning. Built on a kiln-dried ash frame with eight-way hand-tied springs.",
    imageUrl:
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1200&auto=format&fit=crop&q=80",
    modelUrl: "/models/me couch.glb",
    dimensions: { width: 220, depth: 92, height: 86 },
    materials: ["Belgian Linen", "Kiln-Dried Ash", "Goose Down"],
    style: "Japandi",
    stock: 7,
  },
  {
    id: "brutal-travertine-bench",
    categoryId: "sofas",
    name: "Brutal Travertine Bench",
    price: 1950,
    tagline: "Hand-carved Italian travertine. Single block.",
    description:
      "Cut from a single block of Roman travertine and finished by hand in Tivoli. Weighs 180 kg — please consult our delivery team. Pairs with the Mara series.",
    imageUrl:
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1200&auto=format&fit=crop&q=80",
    modelUrl: "/models/Floral Chesterfield Couch.glb",
    dimensions: { width: 180, depth: 38, height: 42 },
    materials: ["Italian Travertine"],
    style: "Brutalist",
    isComingSoon: true,
  },
  {
    id: "solas-lounge-chair",
    categoryId: "chairs",
    name: "Solas Lounge Chair",
    price: 1290,
    tagline: "Walnut shell. Saddle leather sling.",
    description:
      "A study in restraint — a steam-bent walnut shell cradling a single piece of saddle-stitched leather. Inspired by the mid-century Scandinavian masters, made for slow afternoons.",
    imageUrl:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200&auto=format&fit=crop&q=80",
    modelUrl: "/models/Green Egg Chair.glb",
    dimensions: { width: 78, depth: 84, height: 80 },
    materials: ["American Walnut", "Saddle Leather"],
    style: "Mid-century",
    isBestseller: true,
    stock: 12,
  },
  {
    id: "tama-boucle-armchair",
    categoryId: "chairs",
    name: "Tama Bouclé Armchair",
    price: 890,
    tagline: "Cloud-soft bouclé. Curved oak feet.",
    description:
      "A round-armed sculpt upholstered in heavyweight bouclé. The feet are a single curved piece of solid oak — no visible hardware. Built to be the chair you fall into.",
    imageUrl:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&auto=format&fit=crop&q=80",
    modelUrl: "/models/Green and Red Plaid Loveseat with Wooden Feet.glb",
    dimensions: { width: 88, depth: 84, height: 76 },
    materials: ["Heavyweight Bouclé", "Solid Oak"],
    style: "Modern",
    stock: 9,
  },
  {
    id: "ono-dining-pair",
    categoryId: "chairs",
    name: "Ono Dining Chairs (Pair)",
    price: 620,
    tagline: "Bent ply. Linen seat pad. Set of two.",
    description:
      "Sold as a pair. Vapor-bent ash ply forms the entire seat and back in a continuous curve. Slip-on linen seat pads in your choice of natural, charcoal, or terracotta.",
    imageUrl:
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&auto=format&fit=crop&q=80",
    modelUrl: "/models/90%E2%80%99s%20Ethan%20Allen%20Plaid%20Couch.glb",
    dimensions: { width: 46, depth: 52, height: 82 },
    materials: ["Bent Ash Ply", "Linen"],
    style: "Japandi",
    stock: 22,
  },
];

export const CATALOG: Product[] = AR_ITEMS;
