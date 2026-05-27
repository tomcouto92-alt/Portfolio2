"use client";

import { useEffect, useState } from "react";
import { getSetting, setSetting } from "@/lib/supabase";
import { DEFAULT_SERVICES } from "@/lib/constants";

export default function ServicesTab() {
  const [services, setServices] = useState<string[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newService, setNewService] = useState("");

  useEffect(() => {
    getSetting("services").then((data) => {
      if (data && data.length > 0) setServices(data);
      setLoading(false);
    });
  }, []);

  function update(index: number, value: string) {
    setServices((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function remove(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setServices((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setServices((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function add() {
    const trimmed = newService.trim();
    if (!trimmed) return;
    setServices((prev) => [...prev, trimmed]);
    setNewService("");
  }

  async function handleSave() {
    const filtered = services.filter((s) => s.trim() !== "");
    if (filtered.length === 0) {
      setError("Agregá al menos un servicio.");
      return;
    }
    setSaving(true);
    setError("");
    const ok = await setSetting("services", filtered);
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
        <h2 className="text-2xl tracking-tight">Servicios</h2>
        <p className="text-[#B8B8B8] text-sm mt-1">
          Las tarjetas de servicios que aparecen en la sección Services del portfolio.
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-2 mb-4">
        {services.map((service, i) => (
          <div key={service} className="flex items-center gap-2">
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="w-6 h-5 flex items-center justify-center text-[#B8B8B8] hover:text-white disabled:opacity-20 transition-colors text-xs leading-none"
              >
                ▲
              </button>
              <button
                onClick={() => moveDown(i)}
                disabled={i === services.length - 1}
                className="w-6 h-5 flex items-center justify-center text-[#B8B8B8] hover:text-white disabled:opacity-20 transition-colors text-xs leading-none"
              >
                ▼
              </button>
            </div>

            <div className="text-[#B8B8B8] text-xs w-4 text-right select-none">{i + 1}</div>

            <input
              type="text"
              value={service}
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

      {/* Agregar nuevo */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Nuevo servicio..."
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
        />
        <button
          onClick={add}
          disabled={!newService.trim()}
          className="px-5 py-3 border border-white/10 rounded-xl text-sm hover:bg-white/5 transition-colors disabled:opacity-30"
        >
          + Agregar
        </button>
      </div>

      {/* Preview */}
      <div className="mb-8 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-[#B8B8B8] mb-4">Preview</div>
        <div className="grid grid-cols-2 gap-3">
          {services.filter(Boolean).map((s) => (
            <div
              key={s}
              className="border border-white/10 rounded-2xl px-4 py-4 bg-white/[0.02] text-sm leading-snug tracking-tight"
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3 mb-4">
          ⚠ {error}
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
        ) : saved ? "✓ Guardado" : "Guardar servicios"}
      </button>
    </div>
  );
}
