import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { io, Socket } from "socket.io-client";
import { api } from "@/lib/api";

interface Props {
  itemId: string;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = [
  { state: "UPLOADING", label: "Uploading video…" },
  { state: "QUEUED", label: "Queued for processing" },
  { state: "PROCESSING", label: "Processing" },
  { state: "COMPLETED", label: "3D model ready!" },
];

export function UploadModal({ itemId, onClose, onComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [phase, setPhase] = useState<"select" | "uploading" | "processing" | "done" | "error">("select");
  const [jobState, setJobState] = useState<{ state: string; progress_pct: number; message: string } | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const doneRef = useRef(false);

  const startUpload = useCallback(async () => {
    if (!file) return;
    setPhase("uploading");

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadPct((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 300);

    // After "upload" completes, confirm job
    setTimeout(async () => {
      clearInterval(interval);
      setUploadPct(100);
      try {
        const res = await api.post("/jobs/confirm", { itemId });
        setJobId(res.data.jobId);
        setPhase("processing");
      } catch {
        setPhase("error");
      }
    }, 2500);
  }, [file, itemId]);

  useEffect(() => {
    if (!jobId) return;

    const socketBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/?api$/, "")
      : "";
    const socket = io(`${socketBase}/jobs`, {
      query: { jobId },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("job-update", (data: { state: string; progress_pct: number; message: string }) => {
      setJobState(data);
      if (data.state === "COMPLETED" && !doneRef.current) {
        doneRef.current = true;
        setPhase("done");
        setTimeout(onComplete, 1200);
      }
      if (data.state === "FAILED") {
        setPhase("error");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md rounded-3xl border hairline p-6"
        style={{ background: "var(--color-ink-2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl mb-1" style={{ fontWeight: 400 }}>
          Generate 3D Model
        </h2>
        <p className="eyebrow text-[10px] mb-6">
          Simulate video-to-3D processing pipeline
        </p>

        {phase === "select" && (
          <div className="space-y-4">
            <label
              className="block w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors"
              style={{ borderColor: "var(--color-line)" }}
            >
              <input
                type="file"
                accept="video/mp4,video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <span className="text-3xl mb-2 block">🎬</span>
              <span className="eyebrow text-[10px]">
                {file ? file.name : "Tap to select a .mp4 video"}
              </span>
            </label>
            <button
              onClick={startUpload}
              disabled={!file}
              className="w-full btn-acid py-3 rounded-full text-sm disabled:opacity-30"
            >
              Start Upload
            </button>
          </div>
        )}

        {(phase === "uploading" || phase === "processing" || phase === "done") && (
          <div className="space-y-5">
            {/* Upload bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="eyebrow text-[10px]">
                  {phase === "uploading" ? "Uploading" : "Upload complete"}
                </span>
                <span className="eyebrow text-[10px]" style={{ color: "var(--color-bone-dim)" }}>
                  {Math.round(uploadPct)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-line)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--color-acid)" }}
                  animate={{ width: `${uploadPct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Pipeline steps */}
            <div className="space-y-3">
              {STEPS.map((step, idx) => {
                const active =
                  (phase === "uploading" && step.state === "UPLOADING") ||
                  (phase === "processing" &&
                    ((step.state === "QUEUED" && (!jobState || ["QUEUED", "PROCESSING", "COMPLETED"].includes(jobState.state))) ||
                      (step.state === "PROCESSING" && jobState && ["PROCESSING", "COMPLETED"].includes(jobState.state)) ||
                      (step.state === "COMPLETED" && jobState?.state === "COMPLETED"))) ||
                  (phase === "done" && true);

                const completed =
                  (phase === "processing" &&
                    ((step.state === "UPLOADING") ||
                      (step.state === "QUEUED" && jobState && ["PROCESSING", "COMPLETED"].includes(jobState.state)) ||
                      (step.state === "PROCESSING" && jobState?.state === "COMPLETED"))) ||
                  (phase === "done" && true);

                return (
                  <div key={step.state} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        background: completed
                          ? "var(--color-acid)"
                          : active
                            ? "var(--color-amber)"
                            : "var(--color-line)",
                        color: completed || active ? "var(--color-ink)" : "var(--color-bone-faint)",
                      }}
                    >
                      {completed ? "✓" : idx + 1}
                    </div>
                    <span
                      className="text-sm"
                      style={{
                        color: active || completed ? "var(--color-bone)" : "var(--color-bone-faint)",
                      }}
                    >
                      {step.label}
                    </span>
                    {active && step.state === "PROCESSING" && jobState && (
                      <span className="eyebrow text-[9px] ml-auto" style={{ color: "var(--color-amber)" }}>
                        {jobState.message}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {phase === "done" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm py-2"
                style={{ color: "var(--color-acid)" }}
              >
                3D model generated successfully!
              </motion.p>
            )}
          </div>
        )}

        {phase === "error" && (
          <div className="text-center py-4">
            <p className="text-sm mb-2" style={{ color: "var(--color-blood)" }}>
              Something went wrong.
            </p>
            <button onClick={onClose} className="btn-acid px-6 py-2 rounded-full text-sm">
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
