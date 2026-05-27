"use client";

import { useEffect, useState } from "react";
import { getSetting, setSetting, type SiteLinks } from "@/lib/supabase";

const DEFAULT: SiteLinks = {
  cta_label:      "Get In Touch",
  cta_href:       "mailto:hello@tomascouto.com",
  behance_url:    "",
  behance_label:  "Behance",
  linkedin_url:   "",
  linkedin_label: "LinkedIn",
};

export default function LinksTab() {
  const [links, setLinks] = useState<SiteLinks>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSetting("links").then((data) => {
      if (data) setLinks({ ...DEFAULT, ...data });
      setLoading(false);
    });
  }, []);

  function update(key: keyof SiteLinks, value: string) {
    setLinks((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const ok = await setSetting("links", links);
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
        <h2 className="text-2xl tracking-tight">Links y botones</h2>
        <p className="text-[var(--p-muted)] text-sm mt-1">
          Textos y destinos de los botones de la sección de contacto.
        </p>
      </div>

      <div className="space-y-6 mb-8">

        {/* ── Botón principal ── */}
        <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.02] space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--p-muted)]">
            Botón principal (Get In Touch)
          </div>
          <div>
            <label className="text-xs text-[var(--p-muted)]/70 mb-1 block">Texto</label>
            <input
              type="text"
              value={links.cta_label}
              onChange={(e) => update("cta_label", e.target.value)}
              placeholder="Get In Touch"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--p-muted)]/70 mb-1 block">URL de destino</label>
            <input
              type="text"
              value={links.cta_href}
              onChange={(e) => update("cta_href", e.target.value)}
              placeholder="mailto:vos@email.com  o  https://calendly.com/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[var(--p-muted)]/40"
            />
            <p className="text-xs text-[var(--p-muted)]/50 mt-1.5">
              Usá <span className="font-mono">mailto:tucorreo@email.com</span> para abrir el cliente de email, o cualquier URL (Calendly, formulario, etc.)
            </p>
          </div>
        </div>

        {/* ── Botón 2 ── */}
        <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.02] space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--p-muted)]">
            Botón 2 (Behance / portfolio)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--p-muted)]/70 mb-1 block">Texto</label>
              <input
                type="text"
                value={links.behance_label}
                onChange={(e) => update("behance_label", e.target.value)}
                placeholder="Behance"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--p-muted)]/70 mb-1 block">URL</label>
              <input
                type="url"
                value={links.behance_url}
                onChange={(e) => update("behance_url", e.target.value)}
                placeholder="https://behance.net/usuario"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[var(--p-muted)]/40"
              />
            </div>
          </div>
          <p className="text-xs text-[var(--p-muted)]/50">Dejá la URL vacía para ocultar este botón.</p>
        </div>

        {/* ── Botón 3 ── */}
        <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.02] space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--p-muted)]">
            Botón 3 (LinkedIn / red social)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--p-muted)]/70 mb-1 block">Texto</label>
              <input
                type="text"
                value={links.linkedin_label}
                onChange={(e) => update("linkedin_label", e.target.value)}
                placeholder="LinkedIn"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--p-muted)]/70 mb-1 block">URL</label>
              <input
                type="url"
                value={links.linkedin_url}
                onChange={(e) => update("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/usuario"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[var(--p-muted)]/40"
              />
            </div>
          </div>
          <p className="text-xs text-[var(--p-muted)]/50">Dejá la URL vacía para ocultar este botón.</p>
        </div>

      </div>

      {/* Preview */}
      <div className="mb-8 border border-white/10 rounded-2xl p-6 bg-white/[0.02]">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--p-muted)] mb-4">Preview</div>
        <div className="flex flex-wrap gap-3">
          <div className="px-6 py-3 rounded-full bg-white text-black text-sm">
            {links.cta_label || "Get In Touch"}
          </div>
          {links.behance_url && (
            <div className="px-6 py-3 rounded-full border border-white/20 text-sm">
              {links.behance_label || "Behance"}
            </div>
          )}
          {links.linkedin_url && (
            <div className="px-6 py-3 rounded-full border border-white/20 text-sm">
              {links.linkedin_label || "LinkedIn"}
            </div>
          )}
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
        ) : saved ? "✓ Guardado" : "Guardar links"}
      </button>
    </div>
  );
}
