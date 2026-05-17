# Backend API — Engineering Task Board (NestJS)

> **Dependency:** Complete `TASKS_WORKER.md` first. The backend depends on the worker's
> webhook contract (`POST /api/webhooks/worker-complete`) and the Redis pub/sub progress
> event schema before the realtime features can be wired up.

---

## 1. Database & Prisma Setup

- [ ] **Bootstrap NestJS app and install PrismaModule**
  - `nest new api`, install `@prisma/client` and `prisma`
  - Add `DATABASE_URL` to `.env` pointing to local Docker Postgres
  - Register `PrismaModule` as a global module

- [ ] **Write `docker-compose.api.yml` for local Postgres and Redis**
  - Use `postgres:16-alpine` and `redis:7-alpine`
  - Expose ports `5432` and `6379`
  - Add a named volume for Postgres data persistence across restarts

- [ ] **Define Prisma models: `User`, `Restaurant`, `MenuItem`, `ProcessingJob`**
  - `MenuItem` fields: `name`, `description`, `imageUrl`, `modelUrl`, `status` (enum)
  - `ProcessingJob` fields: `jobId`, `itemId`, `s3VideoUrl`, `errorMessage`, `workerRuntime`
  - `workerRuntime` records which platform processed the job (runpod, aws-batch, etc.)

- [ ] **Create `JobStatus` enum with all pipeline states**
  - States: `PENDING`, `UPLOADING`, `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`
  - Store this in Postgres — not only in Redis. Redis is ephemeral; losing state means lost GPU spend

- [ ] **Run `prisma migrate dev --name init` and generate Prisma Client**
  - Commit the migration file to version control
  - Add a seed script at `prisma/seed.ts` to populate a test restaurant and menu items for dev

---

## 2. Authentication & Authorization

- [ ] **Implement JWT authentication using `@nestjs/jwt` and `@nestjs/passport`**
  - `POST /api/auth/login` returns `{ access_token }`
  - Use RS256 (asymmetric keys) not HS256 — future-proof for microservice token verification

- [ ] **Build `JwtAuthGuard` and apply it globally**
  - Apply via `APP_GUARD` provider so all routes are protected by default
  - Create a `@Public()` decorator to whitelist endpoints that don't need auth (e.g. consumer menu)
  - This prevents accidentally shipping an unguarded route

- [ ] **Build `RestaurantOwnerGuard` for ownership enforcement**
  - Check that `req.user.restaurantId === resource.restaurantId` on every mutating operation
  - Apply to all `MenuItem` create/update/delete routes
  - Centralise the check in the guard — do not repeat it in individual service methods

---

## 3. Storage Module (Pre-signed URLs)

> Never route video file buffers through Node's event loop. Force the client to upload directly
> to S3. Buffering a 500MB file through NestJS will stall the entire API.

- [ ] **Create `StorageService` wrapping `@aws-sdk/client-s3`**
  - Use an `S3_ENDPOINT` env var — this makes the service work with both AWS S3 and Cloudflare R2
    (same S3 API, different endpoint)
  - Inject `StorageService` as a NestJS provider so it can be used across modules

- [ ] **Build `POST /api/storage/presigned-url` endpoint**
  - Returns a short-lived (15 min) PUT URL for the client to upload directly to the bucket
  - Enforce: `ContentType=video/mp4`, `ContentLength≤500MB`
  - Return the S3 object key alongside the URL so the frontend can confirm the upload

---

## 4. Job Orchestration (BullMQ)

- [ ] **Install `@nestjs/bullmq` and configure `BullModule` with Redis**
  - Register a queue named `3d-reconstruction-queue`
  - Use a separate Redis DB index (`db: 1`) from session/cache Redis to keep concerns separate

- [ ] **Build `JobProducerService` with a `dispatchJob(itemId, s3VideoUrl)` method**
  - Create a `ProcessingJob` record in Postgres with `status=QUEUED`
  - Enqueue `{ job_id, item_id, s3_video_url }` to BullMQ
  - Write the target `WORKER_RUNTIME` into the queue payload so the job knows where it will run

- [ ] **Implement platform-agnostic dispatch: BullMQ vs direct HTTP (RunPod)** ⚠️ *Critical*
  - If `WORKER_DISPATCH=bullmq`, push to the Redis queue — worker polls it
  - If `WORKER_DISPATCH=runpod-http`, POST directly to the RunPod serverless endpoint URL
  - `JobProducerService` selects the strategy from env vars — no conditional logic in controllers

- [ ] **Subscribe to Redis pub/sub progress events from the worker**
  - NestJS listens to the `progress` channel
  - Parse `{ job_id, state, progress_pct, message }` and re-emit via WebSocket (Socket.io)
  - Update the `ProcessingJob.status` in Postgres on each received state transition

---

## 5. Webhook Listener & State Machine

> The GPU worker is an external microservice. Treat it like a third-party API.
> Never trust incoming webhooks without secret key validation.

- [ ] **Create `POST /api/webhooks/worker-complete` endpoint**
  - Accepts `{ job_id, status, glb_s3_url?, error_message? }`
  - This closes the loop from the GPU worker back to the database and the browser

- [ ] **Build `WorkerSecretGuard` to validate the `X-Worker-Secret` header**
  - Compare against `WORKER_SECRET` env var using `timingSafeEqual` to prevent timing attacks
  - Return `401` on mismatch — not `403`, to avoid revealing that the route exists to unauthenticated callers

- [ ] **On success: update `MenuItem` to `COMPLETED`, save `modelUrl`, delete raw video**
  - Use a Prisma transaction: update status and save `modelUrl` atomically
  - After the transaction, issue `s3.deleteObject()` to remove the raw `.mp4` and reclaim storage

- [ ] **On failure: update `MenuItem` to `FAILED`, persist error, notify frontend**
  - Persist the `errorMessage` string from the worker (e.g. `"SfM failed: too few matching frames"`)
  - Emit a WebSocket event to the admin dashboard so the UI updates immediately without polling

---

## 6. Consumer Menu API

- [ ] **Build `GET /api/menu/:restaurantId` — public, read-only**
  - Only return `MenuItem` records where `status=COMPLETED` and `modelUrl` is not null
  - Project only the fields the consumer needs: `id`, `name`, `description`, `imageUrl`, `modelUrl`
  - This endpoint is hit every time a customer scans a QR code — it must be fast

- [ ] **Cache this endpoint using `@nestjs/cache-manager` backed by Redis**
  - TTL: 60 seconds
  - Invalidate the cache for a `restaurantId` whenever any of its `MenuItem` records are updated
  - Without caching, a busy restaurant during lunch service will hammer Postgres on every QR scan
