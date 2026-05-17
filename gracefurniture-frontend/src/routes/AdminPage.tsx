import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/lib/api";
import type { MenuItem } from "@/types/menu";
import { UploadModal } from "@/components/UploadModal";

type AdminItem = MenuItem & {
  status: string;
  jobs?: { jobId: string; status: string; progressPct: number }[];
};

const CATEGORIES = [
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Main Courses" },
  { id: "burgers", name: "Burgers" },
  { id: "salads", name: "Salads" },
  { id: "drinks", name: "Drinks" },
  { id: "desserts", name: "Desserts" },
];

export default function AdminPage() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploadItemId, setUploadItemId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/items");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/admin/items/${id}`);
    fetchItems();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 pb-24 min-h-dvh">
      <div className="flex items-center justify-between pt-6 pb-8">
        <Link
          to="/"
          className="eyebrow underline"
          style={{ color: "var(--color-bone-dim)" }}
        >
          ← Back to Menu
        </Link>
        <h1 className="font-display text-xl" style={{ fontWeight: 400 }}>
          Admin Dashboard
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-acid px-4 py-2 rounded-full text-[10px]"
        >
          + Add Item
        </button>
      </div>

      {loading ? (
        <p className="eyebrow text-center py-12">Loading items…</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border hairline rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "var(--color-ink-2)" }}
            >
              <img
                src={item.imageUrl}
                alt=""
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-[11px]" style={{ color: "var(--color-bone-faint)" }}>
                  {CATEGORIES.find((c) => c.id === item.categoryId)?.name} · ${item.price.toFixed(2)}
                </p>
                {item.jobs && item.jobs[0] && item.jobs[0].progressPct > 0 && item.jobs[0].progressPct < 100 && (
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--color-line)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--color-acid)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.jobs[0].progressPct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!item.modelUrl && (
                  <button
                    onClick={() => setUploadItemId(item.id)}
                    className="px-3 py-1.5 rounded-full text-[10px] eyebrow border hairline"
                    style={{ color: "var(--color-acid)" }}
                  >
                    Upload Video
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border hairline text-[10px]"
                  style={{ color: "var(--color-blood)" }}
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <AddItemModal
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              fetchItems();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploadItemId && (
          <UploadModal
            itemId={uploadItemId}
            onClose={() => setUploadItemId(null)}
            onComplete={() => {
              setUploadItemId(null);
              fetchItems();
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "var(--color-bone-faint)",
    UPLOADING: "var(--color-amber)",
    QUEUED: "var(--color-amber)",
    PROCESSING: "var(--color-amber)",
    COMPLETED: "var(--color-acid)",
    FAILED: "var(--color-blood)",
  };
  return (
    <span
      className="text-[9px] tracking-[0.2em] uppercase font-semibold px-1.5 py-0.5 rounded"
      style={{
        background: `${colors[status] || colors.PENDING}22`,
        color: colors[status] || colors.PENDING,
      }}
    >
      {status}
    </span>
  );
}

function AddItemModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    calories: "",
    categoryId: "starters",
    imageUrl: "",
    ingredients: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/items", {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        calories: parseInt(form.calories),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl,
        ingredients: form.ingredients.split(",").map((s) => s.trim()),
      });
      onSaved();
    } catch (err) {
      console.error(err);
      alert("Failed to save item");
    } finally {
      setSaving(false);
    }
  }

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
        <h2 className="font-display text-xl mb-6" style={{ fontWeight: 400 }}>
          Add Menu Item
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none hairline"
              style={{ borderColor: "var(--color-line)", color: "var(--color-bone)" }}
            />
          </Field>
          <Field label="Description">
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none hairline"
              style={{ borderColor: "var(--color-line)", color: "var(--color-bone)" }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price">
              <input
                required
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none hairline"
                style={{ borderColor: "var(--color-line)", color: "var(--color-bone)" }}
              />
            </Field>
            <Field label="Calories">
              <input
                required
                type="number"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none hairline"
                style={{ borderColor: "var(--color-line)", color: "var(--color-bone)" }}
              />
            </Field>
          </div>
          <Field label="Category">
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none hairline"
              style={{ borderColor: "var(--color-line)", color: "var(--color-bone)" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} style={{ background: "var(--color-ink-2)" }}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Image URL">
            <input
              required
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none hairline"
              style={{ borderColor: "var(--color-line)", color: "var(--color-bone)" }}
            />
          </Field>
          <Field label="Ingredients (comma-separated)">
            <input
              required
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none hairline"
              style={{ borderColor: "var(--color-line)", color: "var(--color-bone)" }}
            />
          </Field>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full text-sm border hairline"
              style={{ color: "var(--color-bone-dim)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-acid py-3 rounded-full text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Item"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-[10px] block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
