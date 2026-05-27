"use client";

import { useEffect, useState } from "react";
import { getSetting, setSetting, type StyleSettings } from "@/lib/supabase";

// ── Fuentes disponibles ───────────────────────────────────────────────────

const HEADING_FONTS = [
  { name: "Inter",               preview: "Designing for modern brands." },
  { name: "Playfair Display",    preview: "Designing for modern brands." },
  { name: "DM Serif Display",    preview: "Designing for modern brands." },
  { name: "Cormorant Garamond",  preview: "Designing for modern brands." },
  { name: "Space Grotesk",       preview: "Designing for modern brands." },
  { name: "Bebas Neue",          preview: "DESIGNING FOR MODERN BRANDS" },
  { name: "Outfit",              preview: "Designing for modern brands." },
  { name: "Raleway",             preview: "Designing for modern brands." },
];

const BODY_FONTS = [
  "Inter",
  "DM Sans",
  "Outfit",
  "Space Grotesk",
  "Raleway",
];

const DEFAULT_STYLE: StyleSettings = {
  fontHeading: "Inter",
  fontBody:    "Inter",
  colorBg:     "#0A0A0A",
  colorText:   "#F5F3EF",
  colorMuted:  "#B8B8B8",
  colorLight:  "#F5F3EF",
};

// ── Colores configurables ─────────────────────────────────────────────────

const COLOR_FIELDS: { key: keyof StyleSettings; label: string; hint: string }[] = [
  { key: "colorBg",    label: "Fondo principal",        hint: "Fondo de las secciones oscuras" },
  { key: "colorText",  label: "Texto principal",         hint: "Títulos y cuerpo principal" },
  { key: "colorMuted", label: "Texto secundario",        hint: "Labels, subtítulos, descripciones" },
  { key: "colorLight", label: "Sección clara / Botones", hint: "About section + CTAs" },
];

// ── Componente ────────────────────────────────────────────────────────────

export default function StyleTab() {
  const [style, setStyle] = useState<StyleSettings>(DEFAULT_STYLE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Cargar fuentes de Google Fonts para preview
  useEffect(() => {
    const allFonts = [...new Set([...HEADING_FONTS.map((f) => f.name), ...BODY_FONTS])];
    const params = allFonts
      .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;700`)
      .join("&");
    const id = "style-tab-preview-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
      document.head.appendChild(link);
    }
  }, []);

  // Cargar settings guardados
  useEffect(() => {
    getSetting("style").then((data) => {
      if (data) setStyle({ ...DEFAULT_STYLE, ...data });
      setLoading(false);
    });
  }, []);

  function update<K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) {
    setStyle((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const ok = await setSetting("style", style);
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
    <div className="max-w-3xl space-y-12">
      <div>
        <h2 className="text-2xl tracking-tight">Estilo del portfolio</h2>
        <p className="text-[#B8B8B8] text-sm mt-1">
          Tipografía y colores del sitio. Los cambios se aplican al guardar.
        </p>
      </div>

      {/* ── Tipografía ── */}
      <div>
        <SectionTitle text="Tipografía" />

        {/* Heading font */}
        <div className="mb-8">
          <Label text="Fuente de títulos" />
          <div className="grid grid-cols-2 gap-3">
            {HEADING_FONTS.map((f) => (
              <button
                key={f.name}
                onClick={() => update("fontHeading", f.name)}
                className={`text-left border rounded-2xl p-4 transition-all ${
                  style.fontHeading === f.name
                    ? "border-white bg-white/5"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <div
                  className="text-xl leading-tight mb-1"
                  style={{ fontFamily: `'${f.name}', sans-serif` }}
                >
                  {f.preview}
                </div>
                <div className="text-xs text-[#B8B8B8]">{f.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Body font */}
        <div>
          <Label text="Fuente de texto / cuerpo" />
          <div className="grid grid-cols-3 gap-3">
            {BODY_FONTS.map((f) => (
              <button
                key={f}
                onClick={() => update("fontBody", f)}
                className={`text-left border rounded-2xl p-4 transition-all ${
                  style.fontBody === f
                    ? "border-white bg-white/5"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <div
                  className="text-base mb-1"
                  style={{ fontFamily: `'${f}', sans-serif` }}
                >
                  Aa Bb Cc
                </div>
                <div className="text-xs text-[#B8B8B8]">{f}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Colores ── */}
      <div>
        <SectionTitle text="Colores" />
        <div className="space-y-4">
          {COLOR_FIELDS.map(({ key, label, hint }) => (
            <div
              key={key}
              className="flex items-center justify-between border border-white/10 rounded-2xl p-5 bg-white/[0.02]"
            >
              <div>
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-[#B8B8B8] mt-0.5">{hint}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#B8B8B8] uppercase tracking-wider">
                  {(style[key] as string).toUpperCase()}
                </span>
                <label className="cursor-pointer relative">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white/20 overflow-hidden"
                    style={{ backgroundColor: style[key] as string }}
                  />
                  <input
                    type="color"
                    value={style[key] as string}
                    onChange={(e) => update(key, e.target.value as StyleSettings[typeof key])}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div
          className="mt-6 rounded-2xl p-6 border border-white/10 overflow-hidden"
          style={{ backgroundColor: style.colorBg }}
        >
          <div className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: style.colorMuted }}>
            Preview
          </div>
          <h3
            className="text-3xl mb-2 leading-tight"
            style={{ fontFamily: `'${style.fontHeading}', sans-serif`, color: style.colorText }}
          >
            Designing high-performing creative.
          </h3>
          <p
            className="text-sm mb-4"
            style={{ fontFamily: `'${style.fontBody}', sans-serif`, color: style.colorMuted }}
          >
            Premium social-first design systems blending performance and editorial aesthetics.
          </p>
          <button
            className="px-5 py-2.5 rounded-full text-sm text-black"
            style={{ backgroundColor: style.colorLight }}
          >
            View Work
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-8 py-3 bg-[#F5F3EF] text-black rounded-full text-sm font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
      >
        {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar estilo"}
      </button>
    </div>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <div className="text-xs uppercase tracking-[0.3em] text-[#B8B8B8] mb-5 pb-3 border-b border-white/5">
      {text}
    </div>
  );
}

function Label({ text }: { text: string }) {
  return <div className="text-xs uppercase tracking-[0.2em] text-[#B8B8B8] mb-3">{text}</div>;
}
