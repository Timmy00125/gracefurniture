# Frontend — Engineering Task Board (React + Vite)

> **Dependency:** Complete `TASKS_BACKEND.md` first. The frontend depends on the NestJS API
> contract, the pre-signed URL endpoint, the WebSocket progress events, and the consumer
> menu endpoint before meaningful UI work can be done end-to-end.

---

## 1. Project Initialisation & Architecture

- [ ] **Bootstrap with Vite + React + TypeScript**
  - `npm create vite@latest` — choose `react-ts` template
  - Configure path aliases: `@/components`, `@/lib`, `@/hooks`, `@/stores`
  - Set up ESLint + Prettier with TypeScript-aware rules

- [ ] **Configure Tailwind CSS with custom design tokens**
  - Add brand colors, font families, and breakpoints to `tailwind.config.ts`
  - Install `tailwindcss-animate` for motion utility classes

- [ ] **Set up React Router with two distinct route zones**
  - `/admin/*` — protected, requires JWT. Wrap in a `RequireAuth` layout
  - `/menu/:restaurantId` — fully public, no auth
  - Use `lazy()` + `Suspense` for code splitting between zones so the consumer bundle stays small

- [ ] **Install and configure `@tanstack/react-query`**
  - Set up `QueryClient` with `staleTime: 30_000`
  - Wrap the app root in `QueryClientProvider`
  - Install `@tanstack/react-query-devtools` for dev-mode inspection

- [ ] **Install `zustand` for upload pipeline UI state**
  - Create `useUploadStore` with: `file`, `uploadProgress`, `jobStatus`, `errorMessage`
  - This is local UI state — keep it in Zustand, not React Query

---

## 2. Authentication & Admin Layout

- [ ] **Build the Login page for restaurant owners**
  - `POST /api/auth/login` on form submit
  - On success, store the JWT in memory (a React context or Zustand store)
  - Do not store the token in `localStorage` — it is vulnerable to XSS

- [ ] **Build `RequireAuth` wrapper with automatic redirect on 401**
  - Set up a global axios interceptor that catches 401 responses
  - On 401: clear the token and redirect to `/login`
  - This handles token expiry without adding auth checks to every component

- [ ] **Build the Admin Dashboard shell**
  - Responsive two-column layout: sidebar (220px fixed) + scrollable content area
  - On mobile: sidebar becomes a bottom sheet or hamburger drawer
  - Use Radix UI primitives for accessible navigation, dialogs, and dropdowns

---

## 3. Video Upload Pipeline — Critical Admin Path

> Never read a 500MB video into browser memory. Stream it directly to S3 using a PUT request
> against the pre-signed URL. Loading the file into a `FileReader` or `ArrayBuffer` will crash
> low-memory mobile devices.

- [ ] **Build the Menu Item management UI: list view + add/edit modal**
  - Data table with sorting and filtering using TanStack Table
  - Add/edit modal fields: name, description, static image upload, video upload
  - Show current job status inline in the table row (badge: Queued / Processing / Completed / Failed)

- [ ] **Implement the pre-signed URL upload flow** ⚠️ *Critical*
  - Step 1: User selects a `.mp4` file via a file input
  - Step 2: Call `POST /api/storage/presigned-url` to get the S3 upload URL and object key
  - Step 3: `axios.put(presignedUrl, file, { onUploadProgress })` — upload directly to S3
  - Step 4: On 100% upload, call `POST /api/jobs/confirm` with the object key to trigger the worker queue

- [ ] **Build a progress bar driven by `onUploadProgress`**
  - Track bytes uploaded vs total file size
  - Display percentage and estimated time remaining (derived from bytes/second)
  - Disable the cancel/close button while upload is in progress to prevent orphaned S3 objects

- [ ] **Connect to the NestJS WebSocket for live job status updates**
  - Use `socket.io-client`, subscribe to room `job:{job_id}` after upload confirmation
  - On each message, update `useUploadStore.jobStatus`
  - Drive the UI state machine: `UPLOADING → QUEUED → PROCESSING → COMPLETED`
  - Show a step indicator or progress stepper that reflects each state transition

---

## 4. Consumer Menu & 3D Rendering

- [ ] **Build the public menu list view (mobile-first)**
  - Card grid of menu items fetched from `GET /api/menu/:restaurantId` via React Query
  - `staleTime: 30_000` — data is semi-static, avoid unnecessary refetches
  - Tap a card to navigate to the `DishDetail` view

- [ ] **Install `@google/model-viewer` as a CDN script tag**
  - Add to `index.html`: `<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>`
  - Declare the custom element type in a `model-viewer.d.ts` ambient declaration file
  - This abstracts Three.js complexity and handles mobile AR (WebXR) out of the box

- [ ] **Build the `DishDetail` component with `<model-viewer>` configuration**
  - Pass `modelUrl` to the `src` attribute
  - Enable `auto-rotate` and `camera-controls`
  - Set `environment-image="neutral"` so lighting uses the baked photogrammetry data, not a skybox
  - Set `reveal="auto"` for a smooth fade-in once the `.glb` has loaded

- [ ] **Implement fallback UI while the `.glb` is downloading**
  - Show the static `imageUrl` (high-quality dish photo) until `model-viewer` fires the `load` event
  - On very slow connections, the `.glb` can take 5–10 seconds — a blank viewport is unacceptable
  - Add a small spinner or shimmer overlay on top of the static image while loading

- [ ] **Explicitly destroy the WebGL context when leaving the viewport** ⚠️ *Critical*
  - Use React's `useEffect` cleanup or an `IntersectionObserver` to unmount `<model-viewer>` when
    the user navigates away
  - Browsers cap concurrent WebGL contexts at 8–16. Browsing multiple 3D items without cleanup
    will silently drop contexts and cause black viewports

---

## 5. UI/UX Polish & Edge Cases

- [ ] **Add Framer Motion for page transitions**
  - Animate between the menu list and `DishDetail` with a slide + fade
  - Use `AnimatePresence` for unmount animations
  - Keep transition duration ≤300ms on mobile — anything slower feels sluggish on touch devices

- [ ] **Build the `FAILED` state UI in the Admin Dashboard**
  - Display the `errorMessage` string from the database in plain language
    (e.g. "Video too blurry — too many frames were discarded")
  - Include a "Re-upload video" button that reopens the upload flow for the same `MenuItem`
  - Do not make the user delete and recreate the menu item to retry

- [ ] **Audit mobile WebGL performance across multiple 3D items**
  - Profile with Chrome DevTools on a mid-range Android device (target: Pixel 6a class)
  - Confirm the active WebGL context count stays at 1 as the user browses
  - Check for memory growth across 5+ 3D item views without page reload
