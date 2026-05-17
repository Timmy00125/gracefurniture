# Grace Furniture

A high-end furniture store with **web-based augmented reality** — scan,
browse, and see any piece **in your own room** at real-world scale before
you buy. No app install required.

> **Frontend stack** · React 19 · Vite 6 · TypeScript · Tailwind CSS 4 ·
> Motion (Framer Motion) · Firebase (Firestore + Auth) ·
> `@google/model-viewer` 4 (WebXR + Quick Look) · Gemini 1.5 Flash

> Built on the same AR architecture as my earlier Golden Oak AR Menu —
> the pipeline transfers cleanly from food to furniture.

---

## What you get

- **Editorial storefront** — warm walnut palette with a burnished copper
  accent, Fraunces display serif with italic personality, Outfit utility
  sans. Restoration Hardware × Cassina × B&B Italia coded.
- **Featured AR hero on the catalog page** — sells the experience above
  the fold, not buried inside product detail.
- **16 pieces across 7 categories** — Sofas, Chairs, Tables, Desks, Beds,
  Storage, Lighting. Real prices, materials, dimensions, styles.
- **Web AR, no app install** — `<model-viewer>` activates WebXR on
  Android, Quick Look on iOS, falls back to interactive 3D on desktop.
- **Real-world scale** — `ar-scale="fixed"` and `ar-placement="floor"`
  ensure a 240 cm sofa is exactly 240 cm in your living room.
- **AI styling notes** — Gemini 1.5 Flash, prompted as a Grace Furniture
  in-house stylist, writes two-line editorial copy per piece.
- **Firestore-backed data with mock fallback** — runs out of the box
  without a Firebase project; switches to live data the moment you fill
  in `.env`.
- **Bestseller, stock-low, and "AR ready" badges** — animated, surface
  the right info without crowding.

---

## Quick start

```bash
cd gracefurniture-frontend
npm install
npm run dev
# → http://localhost:5173
```

That's it. The app boots immediately with mock data and a sample model
from Google's model-viewer CDN, so AR works end-to-end on a real phone
the moment you load it.

To wire up Gemini and Firebase:

```bash
cp .env.example .env
# fill in the keys
```

---

## Frontend project structure

```
gracefurniture-frontend/src/
├── App.tsx                 ← Router + page transitions
├── main.tsx                ← React 19 entry
├── index.css               ← Tailwind v4 @theme + design tokens
│
├── routes/
│   ├── MenuPage.tsx        ← Catalog (featured hero + grid)
│   ├── ItemPage.tsx        ← Product detail (image ⇄ AR)
│   └── AdminPage.tsx       ← Inherited admin dashboard
│
├── components/
│   ├── MenuHeader.tsx      ← GRACE FURNITURE editorial hero
│   ├── CategoryNav.tsx     ← 7-category architectural icons
│   ├── SearchBar.tsx
│   ├── MenuItemCard.tsx    ← 2-col grid card w/ AR badge
│   ├── ARViewer.tsx        ← <model-viewer> wrapper
│   └── AIInsights.tsx      ← Stylist note + skeletons
│
├── hooks/
│   ├── useMenu.ts          ← API → mock auto-fallback
│   └── useGeminiInsights.ts
│
├── lib/
│   ├── api.ts              ← Axios client
│   ├── firebase.ts         ← Lazy-initialized Firebase
│   └── gemini.ts           ← Gemini 1.5 Flash service
│
├── data/
│   └── mockMenu.ts         ← 16 furniture pieces, Firestore shape
│
└── types/
    └── menu.ts             ← Product + Category + StylingNote
```

> File names kept stable from the original menu codebase (`MenuPage`,
> `MenuItemCard`, `mockMenu`, `useMenu`, `MenuItem`) so the admin code
> and any inbound integrations keep working. Conceptually they now
> render furniture; `MenuItem` is type-aliased to `Product`.

---

## Wiring up real 3D models

The mock catalog points every AR-ready item at `Astronaut.glb` from
model-viewer's public CDN — that proves the AR pipeline works on day
one. To ship real furniture models:

1. **Author at real-world scale.** 1 unit = 1 metre. A 240 cm sofa
   must be exactly 2.4 units long in Blender / Reality Composer.
2. **Export both `.glb` and `.usdz`.** GLB serves Android + WebXR
   + desktop. USDZ serves iOS Quick Look (Apple's required format).
3. **Run Draco compression on the GLB** — typical 3–10× size drop.
   `gltf-pipeline -i model.glb -o model.glb -d` works well.
4. **Upload to Firebase Storage** (or any CDN), then set `modelUrl`
   and `usdzUrl` on the product. The `AR` badge and "Place in your
   room" button appear automatically.

The `ar-scale="fixed"` setting in `ARViewer.tsx` is non-negotiable
for furniture — it prevents users from accidentally resizing the
model, which would defeat the purpose of "see the actual size".

---

## Wiring up Gemini (stylist AI)

1. Get a key at <https://aistudio.google.com/app/apikey>.
2. Set `VITE_GEMINI_API_KEY` in `.env`.
3. `useGeminiInsights` now returns real stylist copy; until then it
   falls back to each piece's own description text.

> ⚠️ For production, proxy Gemini through a Cloud Function. The
> current setup ships the key in the client bundle — fine for
> prototypes and private demos, not for live storefronts.

---

## Deploying

```bash
cd gracefurniture-frontend
npm run build
```

Deploy `dist/` to **Vercel**, **Cloud Run**, or **Firebase Hosting**.
Make sure response headers don't block WebXR (Vercel + Cloud Run
defaults are fine).

For Firebase Hosting:

```bash
firebase init hosting
firebase deploy --only hosting
```

---

## The backend & processing worker

The original menu project shipped with a NestJS backend and a Python
processing worker that turned customer-uploaded videos into 3D models.
Those folders are preserved in this repo (`/backend`, `/processing_worker`)
and still work for the admin upload flow if you spin them up — but the
customer-facing catalog runs perfectly without them, on mock + Firebase
data.

---

## License

Private.
