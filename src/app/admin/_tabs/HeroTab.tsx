"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase, getSetting, setSetting } from "@/lib/supabase";

const SLOTS = 4;

function isValidUrl(s: string) {
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:");
}

export default function HeroTab() {
  const [images, setImages] = useState<string[]>(Array(SLOTS).fill(""));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    getSetting("hero_images").then((data) => {
      if (data && data.length > 0) {
        const padded = [...data, ...Array(SLOTS).fill("")].slice(0, SLOTS);
        setImages(padded);
      }
      setLoading(false);
    });
  }, []);

  async function handleFileChange(index: number, file: File) {
    const ext = file.name.split(".").pop();
    const path = `settings/hero-${index}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(`Error slot ${index + 1}: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    const updated = [...images];
    updated[index] = data.publicUrl;
    setImages(updated);
  }

  function handleUrl(index: number, val: string) {
    const updated = [...images];
    updated[index] = val;
    setImages(updated);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const filtered = images.filter((u) => u.trim() !== "");
    const ok = await setSetting("hero_images", filtered);
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
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl tracking-tight">Hero — Imágenes del inicio</h2>
        <p className="text-[#B8B8B8] text-sm mt-1">
          Las 4 fotos que aparecen en la grilla del hero. Podés subir archivos o pegar URLs.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-8">
        {images.map((url, i) => (
          <div key={i} className="space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-[#B8B8B8]">
              Imagen {i + 1}
            </div>

            {/* Preview / upload zone */}
            <div
              onClick={() => fileRefs.current[i]?.click()}
              className="relative border-2 border-dashed border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-white/25 transition-colors"
              style={{ minHeight: 140 }}
            >
              {url && isValidUrl(url) ? (
                <div className="relative h-36">
                  <Image
                    src={url}
                    alt={`Hero ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="300px"
                    unoptimized={url.startsWith("blob:")}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white">
                    Cambiar
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-36 text-[#B8B8B8] text-sm gap-1">
                  <span className="text-2xl leading-none">↑</span>
                  <span className="text-xs">Subir imagen</span>
                </div>
              )}
            </div>

            <input
              ref={(el) => { fileRefs.current[i] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(i, f);
              }}
            />

            <input
              type="text"
              placeholder="O pegá una URL"
              value={url.startsWith("blob:") ? "" : url}
              onChange={(e) => handleUrl(i, e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
            />
          </div>
        ))}
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
        ) : saved ? "✓ Guardado" : "Guardar imágenes"}
      </button>
    </div>
  );
}
