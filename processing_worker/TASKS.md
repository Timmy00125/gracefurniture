# Processing Worker — Engineering Task Board

> **Platform-agnostic design.** The worker is runtime-independent. A `WORKER_RUNTIME` env var
> switches behaviour between `local`, `docker`, `runpod`, `aws-batch`, and `gcp-run`.
> No code changes required to move between platforms.
>
> **Recommended starting point:** RunPod Serverless (~$0.20/hr A4000, pay-per-job, zero idle cost).

---

## 1. Environment & Infrastructure Setup

- [ ] **Abstract the runtime target behind an environment variable**
  - Define `WORKER_RUNTIME=local|docker|runpod|aws-batch|gcp-run`
  - Read this var at startup to switch S3 endpoints, queue type, and webhook base URL
  - No code changes should be required to move between platforms

- [ ] **Write a `Dockerfile` using `nvidia/cuda:12.1.0-runtime-ubuntu22.04` as the base image**
  - Install system dependencies: `ffmpeg`, `blender`, `wget`, `unzip`
  - Download and unpack pre-compiled AliceVision/Meshroom Linux binaries during build
  - Image must be fully self-contained — no runtime dependency on the host system

- [ ] **Write a `docker-compose.worker.yml` for local development**
  - Use `minio/minio` as a fake S3 and `redis:7-alpine` as a fake queue
  - Enables running the full pipeline on a laptop without any cloud credentials
  - Mount a local `./tmp` volume for inspecting intermediate job files

- [ ] **Write a RunPod serverless handler (`handler.py`) for GPU cloud deployment**
  - RunPod expects a `handler(event)` function as the entrypoint
  - Wrap the full pipeline inside this handler
  - Set `WORKER_RUNTIME=runpod` in the pod template environment
  - Lowest-cost on-demand GPU option (~$0.20/hr for an A4000, zero cost at idle)

- [ ] **Write an AWS Batch job definition JSON as a cloud fallback** *(optional)*
  - Define container overrides, vCPU count, memory, and GPU resource requirements
  - Can be triggered from NestJS via the AWS SDK
  - Implement only if AWS Batch is chosen as the runtime

- [ ] **Define all environment variables in a `.env.worker.example` file**
  - Must cover: `REDIS_URL`, `QUEUE_TYPE` (`bullmq|redis-raw`), `S3_ENDPOINT`, `S3_BUCKET`,
    `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `WEBHOOK_URL`, `WEBHOOK_SECRET`,
    `MAX_POLYGON_COUNT`, `WORKER_RUNTIME`

---

## 2. Queue Consumption — Platform-Agnostic Adapter

- [ ] **Write a `QueueAdapter` interface with a `consume(callback)` method**
  - Implement two concrete adapters:
    - `BullMQAdapter` — reads from the NestJS BullMQ queue via Redis
    - `RedisRawAdapter` — uses `BLPOP` directly, no BullMQ dependency
  - Worker selects the adapter at startup based on the `QUEUE_TYPE` env var

- [ ] **Implement the `JobManager` class with explicit state transitions**
  - States: `Claimed → Downloading → Extracting → Meshing → Optimizing → Uploading → Completed | Failed`
  - Each transition must write status back to Redis so NestJS can relay it to the frontend in real time

- [ ] **Wrap the entire pipeline in a `try/except` with typed error categories**
  - Catch and distinguish: `CudaOOMError`, `CorruptVideoError`, `SfMFailureError`, `S3DownloadError`
  - Each error type maps to a user-facing message that NestJS will display in the admin dashboard

- [ ] **Push granular progress events to Redis pub/sub on each state transition**
  - NestJS subscribes to these events and relays them via WebSocket to the browser
  - Payload format: `{ job_id, state, progress_pct, message }`

---

## 3. Data Ingestion & Pre-processing

- [ ] **Write the S3 download module using `boto3`**
  - Download the raw `.mp4` to a job-specific temp directory at `/tmp/{job_id}/`
  - Use transfer config with `multipart_threshold=8MB` for large files
  - Support both AWS S3 and Cloudflare R2 — same S3 API, different endpoint URL

- [ ] **Write the FFmpeg frame extraction function**
  - Extract frames at 2–3 FPS using `ffmpeg-python`
  - Output frames to `/tmp/{job_id}/frames/`
  - Reject videos shorter than 10 seconds or yielding fewer than 30 extractable frames

- [ ] **Implement Laplacian blur detection to filter bad frames** ⚠️ *Critical*
  - Use `cv2.Laplacian(frame, cv2.CV_64F).var()` to score each frame
  - Discard frames below a variance threshold (default: `80`)
  - If more than 60% of frames are blurry, abort the job with a `BlurryVideoError`
  - This is the single most important quality gate — bad frames produce a failed or broken mesh

---

## 4. Photogrammetry Pipeline (AliceVision CLI)

> Do not run the full default Meshroom pipeline. Skip high-density meshing steps that waste GPU
> time. Execute only the nodes listed below in order.

- [ ] **Build a subprocess runner helper that streams stdout/stderr to the logger**
  - All AliceVision binaries are invoked via `subprocess.run()`
  - Capture output and write to a per-job log file at `/tmp/{job_id}/pipeline.log`
  - Raise on any non-zero exit code

- [ ] **Execute `aliceVision_cameraInit`**
  - Extracts EXIF data from frames and builds the sensor database
  - Output: `cameraInit.sfm`

- [ ] **Execute `aliceVision_featureExtraction`**
  - Detects SIFT/AKAZE keypoints in every frame
  - Most GPU-intensive step — allow up to 30 min timeout

- [ ] **Execute `aliceVision_imageMatching` then `aliceVision_featureMatching`**
  - Links detected features across frames to establish correspondences
  - Output feeds directly into the SfM step

- [ ] **Execute `aliceVision_structureFromMotion` (SfM)** ⚠️ *Critical*
  - Reconstructs 3D camera positions from matched features
  - If SfM registers fewer than 10 cameras, abort with `SfMFailureError`
  - Surface a user-facing message: "Not enough frame overlap — re-record with slower movement"

- [ ] **Execute `aliceVision_prepareDenseScene` and `aliceVision_depthMapEstimation`**
  - Calculates dense geometry from the sparse SfM point cloud

- [ ] **Execute `aliceVision_meshing` and `aliceVision_texturing`**
  - Generates the raw `.obj` and texture atlas `.png`
  - Raw output will be 100MB+ — feeds directly into the Blender optimization step

---

## 5. 3D Optimization & Compression (Blender Headless)

> The raw `.obj` will be 100MB+ and will crash mobile browsers. Decimation and Draco compression
> are mandatory before upload.

- [ ] **Write `optimize.py` — a Blender Python script for headless mesh optimization**
  - Invoked via: `blender -b -P optimize.py -- --input raw.obj --output optimized.glb --max-faces 50000`
  - Use `argparse` to accept CLI arguments so the worker can pass job-specific values

- [ ] **Import the raw `.obj` and apply a Decimate modifier**
  - Target ≤50,000 faces (configurable via `MAX_POLYGON_COUNT` env var)
  - Use ratio-based decimation rather than absolute face count for robustness across mesh sizes

- [ ] **Bake high-res textures from original mesh onto the decimated low-poly mesh**
  - Bake diffuse and normal maps
  - Set UV margin to `0.02` to avoid texture bleeding artifacts
  - Output texture resolution: 2048×2048

- [ ] **Export as binary `.glb` with Draco compression enabled**
  - Enable Draco mesh compression at level 6 — reduces final file size by ~60–70%
  - Binary GLB is smaller than JSON GLTF
  - This is the final file served to consumer browsers

---

## 6. Export, Webhooks & Cleanup

- [ ] **Upload the final `.glb` to S3 with public-read ACL**
  - Key pattern: `models/{restaurant_id}/{item_id}/{job_id}.glb`
  - Set `CacheControl: max-age=31536000` — the file is immutable once uploaded

- [ ] **POST success payload to the NestJS webhook endpoint**
  - Payload: `{ job_id, glb_s3_url, status: "success" }`
  - Include `X-Worker-Secret` header for authentication
  - Implement exponential backoff with 3 retries if NestJS is temporarily unavailable

- [ ] **POST failure payload to the NestJS webhook on any pipeline error**
  - Payload: `{ job_id, status: "failed", error_message: "<typed error string>" }`
  - Always fire — even on partial failure — so the frontend can surface the retry prompt

- [ ] **Mandatory cleanup: delete `/tmp/{job_id}/` after webhook confirms receipt** ⚠️ *Critical*
  - Use `shutil.rmtree()` inside a `finally` block — cleanup must run even on pipeline failure
  - Directory contains: raw video, extracted frames, `.obj` files, and AliceVision cache
  - Skipping this will fill the disk in under 24 hours on a busy GPU instance
