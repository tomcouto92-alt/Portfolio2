"use client";

import { useEffect, useState } from "react";
import { getSetting, setSetting } from "@/lib/supabase";

const DEFAULT_BRANDS = [
  "Allbirds",
  "Nutrisystem",
  "Jenny Craig",
  "Open Farm",
  "Skin Laundry",
  "Step One",
  "TikTok Shop",
  "Creator Brands",
];

export default function BrandsTab() {
  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newBrand, setNewBrand] = useState("");

  useEffect(() => {
    getSetting("brands").then((data) => {
      if (data && data.length > 0) setBrands(data);
      setLoading(false);
    });
  }, []);

  function update(index: number, value: string) {
    setBrands((prev) => prev.map((b, i) => (i === index ? value : b)));
  }

  function remove(index: number) {
    setBrands((prev) => prev.filter((_, i) => i !== index));
  }

  function add() {
    const trimmed = newBrand.trim();
    if (!trimmed) return;
    setBrands((prev) => [...prev, trimmed]);
    setNewBrand("");
  }

  async function handleSave() {
    const filtered = brands.filter((b) => b.trim() !== "");
    if (filtered.length === 0) {
      setError("Agregá al menos una marca.");
      return;
    }
    setSaving(true);
    setError("");
    const ok = await setSetting("brands", filtered);
    if (!ok) {
      setError("Error al guardar. Revisá los permisos de Supabase.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h2 className="text-2xl tracking-tight">Carrusel de marcas</h2>
        <p className="text-[var(--p-muted)] text-sm mt-1">
          Estos nombres aparecen en el ticker animado del portfolio. Arrastrá para reordenar.
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-2 mb-4">
        {brands.map((brand, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="text-[var(--p-muted)] text-xs w-5 text-right select-none">{i + 1}</div>
            <input
              type="text"
              value={brand}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors"
            />
            <button
              onClick={() => remove(i)}
              className="w-9 h-9 flex items-center justify-center border border-red-400/20 text-red-400 rounded-full hover:bg-red-400/10 transition-colors text-lg leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Agregar nueva */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Nueva marca..."
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[var(--p-muted)]/40"
        />
        <button
          onClick={add}
          disabled={!newBrand.trim()}
          className="px-5 py-3 border border-white/10 rounded-xl text-sm hover:bg-white/5 transition-colors disabled:opacity-30"
        >
          + Agregar
        </button>
      </div>

      {/* Preview */}
      <div className="mb-8 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] px-6 py-4">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--p-muted)] mb-3">Preview</div>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.25em] text-[var(--p-muted)]">
          {brands.filter(Boolean).map((b, i) => (
            <span key={i}>{b}</span>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className={`min-w-[180px] px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 ${
          saved
            ? "bg-emerald-500 text-white scale-[1.02]"
            : saving
            ? "bg-white/20 text-white/60 cursor-not-allowed"
            : "bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.99] shadow-lg shadow-white/10"
        }`}
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Guardando...
          </span>
        ) : saved ? "✓ Guardado" : "Guardar marcas"}
      </button>
    </div>
  );
}
