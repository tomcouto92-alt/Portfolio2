"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase, getSetting, setSetting, type ExperienceEntry } from "@/lib/supabase";
import { Spinner, Label, SaveButton } from "./_shared";

const DEFAULT = {
  title: "Creative direction built for the attention economy.",
  description:
    "Senior designer specializing in premium social-first creative, performance marketing systems, motion design, and creator-commerce storytelling. Blending editorial aesthetics with conversion-driven execution.",
  image_url:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
  experience: [
    { company: "Influencer Marketing Agency", role: "Senior Designer" },
    { company: "Creative Direction", role: "Social-First Campaigns" },
    { company: "Focus", role: "Performance + Branding" },
  ] as ExperienceEntry[],
};

function isValidUrl(s: string) {
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:");
}

export default function AboutTab() {
  const [title, setTitle] = useState(DEFAULT.title);
  const [description, setDescription] = useState(DEFAULT.description);
  const [imageUrl, setImageUrl] = useState(DEFAULT.image_url);
  const [imagePreview, setImagePreview] = useState(DEFAULT.image_url);
  const [experience, setExperience] = useState<ExperienceEntry[]>(DEFAULT.experience);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string>("");

  useEffect(() => {
    getSetting("about").then((data) => {
      if (data) {
        setTitle(data.title ?? DEFAULT.title);
        setDescription(data.description ?? DEFAULT.description);
        setImageUrl(data.image_url ?? DEFAULT.image_url);
        setImagePreview(data.image_url ?? DEFAULT.image_url);
        setExperience(data.experience ?? DEFAULT.experience);
      }
      setLoading(false);
    });
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  function handleFileChange(file: File) {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    setImageFile(file);
    setImagePreview(blobUrl);
  }

  function updateExp(i: number, field: keyof ExperienceEntry, val: string) {
    setExperience((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  }

  function addExp() {
    setExperience((prev) => [...prev, { company: "", role: "" }]);
  }

  function removeExp(i: number) {
    setExperience((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    let finalImageUrl = imageUrl;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `settings/about-portrait-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        setError(`Error al subir foto: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      finalImageUrl = data.publicUrl;
    }

    const ok = await setSetting("about", {
      title,
      description,
      image_url: finalImageUrl,
      experience,
    });

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
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-7">
      <div>
        <h2 className="text-2xl tracking-tight">About Me</h2>
        <p className="text-[#B8B8B8] text-sm mt-1">
          El contenido de la sección "About" del portfolio.
        </p>
      </div>

      {/* Portrait */}
      <div>
        <Label text="Foto de perfil" />
        <div
          onClick={() => fileRef.current?.click()}
          className="relative border-2 border-dashed border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-white/25 transition-colors"
        >
          {imagePreview && isValidUrl(imagePreview) ? (
            <div className="relative h-52">
              <Image
                src={imagePreview}
                alt="Portrait"
                fill
                className="object-cover object-top"
                sizes="600px"
                unoptimized={imagePreview.startsWith("blob:")}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-sm text-white">
                Cambiar foto
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-[#B8B8B8] gap-1">
              <span className="text-3xl leading-none">↑</span>
              <span className="text-sm">Subir foto de perfil</span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }}
        />
        <input
          type="text"
          placeholder="O pegá una URL"
          value={imageFile ? "" : imageUrl}
          onChange={(e) => { setImageFile(null); setImageUrl(e.target.value); setImagePreview(e.target.value); }}
          className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
        />
      </div>

      {/* Title */}
      <div>
        <Label text="Título" />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <Label text="Descripción" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors resize-none"
        />
      </div>

      {/* Experience */}
      <div>
        <Label text="Experiencia / Filas" />
        <div className="space-y-2">
          {experience.map((e, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Empresa / Rol"
                  value={e.company}
                  onChange={(ev) => updateExp(i, "company", ev.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={e.role}
                  onChange={(ev) => updateExp(i, "role", ev.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
                />
              </div>
              <button
                onClick={() => removeExp(i)}
                className="w-9 h-9 mt-0.5 flex-shrink-0 flex items-center justify-center border border-red-400/20 text-red-400 rounded-full hover:bg-red-400/10 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addExp}
            className="text-sm text-[#B8B8B8] hover:text-white transition-colors flex items-center gap-2 mt-1"
          >
            <span className="text-lg leading-none">+</span> Agregar fila
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <SaveButton
        onClick={handleSave}
        saving={saving}
        saved={saved}
        label="Guardar about"
      />
    </div>
  );
}

