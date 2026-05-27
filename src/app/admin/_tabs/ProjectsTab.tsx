"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  supabase,
  createProject,
  updateProject,
  deleteProject,
  type Project,
  type ProjectInput,
} from "@/lib/supabase";
import { Spinner, Label, SaveButton } from "./_shared";

// ── Types ──────────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  category: string;
  description: string;
  metric: string;
  sort_order: number;
  image_url: string;
  case_study_url: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  category: "",
  description: "",
  metric: "",
  sort_order: 0,
  image_url: "",
  case_study_url: "",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!showModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowModal(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order");
      if (error) {
        setLoadError(`Error Supabase: ${error.message} (code: ${error.code})`);
      } else {
        setProjects(data ?? []);
      }
    } catch (e) {
      setLoadError(`Error inesperado: ${String(e)}`);
    }
    setLoading(false);
  }

  // ── Modal handlers ─────────────────────────────────────────────────────

  function openAdd() {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setFormError("");
    setShowModal(true);
  }

  function openEdit(p: Project) {
    setEditingProject(p);
    setForm({
      title: p.title,
      category: p.category,
      description: p.description,
      metric: p.metric,
      sort_order: p.sort_order,
      case_study_url: p.case_study_url ?? "",
      image_url: p.image_url ?? "",
    });
    setImageFile(null);
    setImagePreview(p.image_url ?? "");
    setFormError("");
    setShowModal(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm((f) => ({ ...f, image_url: "" }));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setFormError("El título es obligatorio.");
      return;
    }
    setFormError("");
    setSaving(true);

    if (editingProject) {
      // EDICIÓN: subir imagen si hay archivo nuevo
      let imageUrl: string | null = form.image_url.trim() || null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${editingProject.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(path, imageFile, { upsert: true });
        if (uploadError) {
          setFormError(`Error al subir imagen: ${uploadError.message}`);
          setSaving(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("portfolio")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
      const payload: ProjectInput = {
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        metric: form.metric.trim(),
        sort_order: form.sort_order,
        image_url: imageUrl,
        case_study_url: form.case_study_url.trim() || null,
      };
      const { error } = await updateProject(editingProject.id, payload);
      if (error) {
        setFormError(`Error al guardar: ${error}`);
        setSaving(false);
        return;
      }
    } else {
      // CREACIÓN: primero crear sin imagen, luego subir con el ID real
      const payload: ProjectInput = {
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        metric: form.metric.trim(),
        sort_order: form.sort_order,
        image_url: form.image_url.trim() || null,
        case_study_url: form.case_study_url.trim() || null,
      };
      const { project: created, error } = await createProject(payload);
      if (error || !created) {
        setFormError(`Error al crear: ${error}`);
        setSaving(false);
        return;
      }

      // Si hay archivo, ahora subir con el ID real del proyecto
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${created.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(path, imageFile, { upsert: true });
        if (uploadError) {
          // Proyecto creado pero imagen falló – no es fatal, avisa
          setFormError(
            `Proyecto creado pero hubo un error al subir la imagen: ${uploadError.message}`
          );
          await load();
          setSaving(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("portfolio")
          .getPublicUrl(path);
        await updateProject(created.id, { image_url: urlData.publicUrl });
      }
    }

    await load();
    setShowModal(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setConfirmDeleteId(null);
    setDeletingId(id);
    setDeleteError("");
    const success = await deleteProject(id);
    if (!success) {
      setDeleteError(
        "No se pudo eliminar el proyecto. Revisá los permisos de Supabase."
      );
    } else {
      await load();
    }
    setDeletingId(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Title row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl tracking-tight">Proyectos</h1>
          <p className="text-[#B8B8B8] text-sm mt-1">
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-black rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-lg shadow-white/10"
        >
          + Nuevo proyecto
        </button>
      </div>

      {/* Errors */}
      {loadError && (
        <div className="mb-6 text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-2xl px-5 py-4">
          <div className="font-medium mb-1">No se pudo cargar los proyectos</div>
          <div className="font-mono text-xs opacity-80">{loadError}</div>
          <div className="mt-2 text-xs opacity-70">
            Asegurate de haber corrido el SQL de setup en Supabase → SQL Editor.
          </div>
        </div>
      )}

      {deleteError && (
        <div className="mb-6 text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-2xl px-5 py-4">
          <div className="font-medium mb-1">No se pudo eliminar el proyecto</div>
          <div className="font-mono text-xs opacity-80">{deleteError}</div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : projects.length === 0 && !loadError ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl">
          <p className="text-[#B8B8B8] mb-4">No hay proyectos todavía.</p>
          <button
            onClick={openAdd}
            className="px-6 py-3 bg-[#F5F3EF] text-black rounded-full text-sm hover:scale-[1.02] transition-transform"
          >
            + Agregar el primero
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="group border border-white/8 rounded-2xl p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex items-center gap-5"
            >
              {/* Thumb */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 relative">
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt={p.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                    —
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-[0.2em] text-[#B8B8B8] mb-0.5">
                  {p.category || "—"}
                </div>
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-sm text-[#B8B8B8] truncate mt-0.5">
                  {p.description}
                </div>
              </div>

              {/* Metric */}
              <div className="hidden sm:block text-right flex-shrink-0 w-28">
                <div className="text-xs text-[#B8B8B8] mb-0.5">Resultado</div>
                <div className="text-sm">{p.metric || "—"}</div>
              </div>

              {/* Order */}
              <div className="hidden md:block text-center flex-shrink-0 w-12">
                <div className="text-xs text-[#B8B8B8] mb-0.5">Orden</div>
                <div className="text-sm">{p.sort_order}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0 items-center">
                {confirmDeleteId === p.id ? (
                  <>
                    <span className="text-xs text-[#B8B8B8]">¿Eliminar?</span>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="px-3 py-1.5 bg-red-500/90 text-white rounded-full text-xs hover:bg-red-500 transition-colors disabled:opacity-40"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 border border-white/10 rounded-full text-xs hover:bg-white/5 transition-colors"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openEdit(p)}
                      className="px-4 py-2 border border-white/10 rounded-full text-xs hover:bg-white/5 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-4 py-2 border border-red-400/20 text-red-400 rounded-full text-xs hover:bg-red-400/10 transition-colors"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl tracking-tight">
                  {editingProject ? "Editar proyecto" : "Nuevo proyecto"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-[#B8B8B8] hover:text-white transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">
                {/* Imagen */}
                <div>
                  <Label text="Imagen" />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-white/25 transition-colors"
                    style={{ minHeight: 120 }}
                  >
                    {imagePreview &&
                    (imagePreview.startsWith("blob:") ||
                      imagePreview.startsWith("http://") ||
                      imagePreview.startsWith("https://")) ? (
                      <div className="relative h-40">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="480px"
                          unoptimized={imagePreview.startsWith("blob:")}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-sm text-white">
                          Cambiar imagen
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-[#B8B8B8] text-sm gap-2">
                        <span className="text-3xl leading-none">↑</span>
                        <span>Hacé click para subir imagen</span>
                        <span className="text-xs text-[#B8B8B8]/50">
                          JPG, PNG, WEBP
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <input
                    type="text"
                    placeholder="O pegá una URL de imagen"
                    value={imageFile ? "" : form.image_url}
                    onChange={(e) => {
                      setImageFile(null);
                      setImagePreview(e.target.value);
                      setForm((f) => ({ ...f, image_url: e.target.value }));
                    }}
                    className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
                  />
                </div>

                {/* Título */}
                <FormField
                  label="Título *"
                  value={form.title}
                  placeholder="Ej: Paid Social Systems"
                  onChange={(v) => setForm((f) => ({ ...f, title: v }))}
                />

                {/* Categoría */}
                <FormField
                  label="Categoría"
                  value={form.category}
                  placeholder="Ej: Performance Creative"
                  onChange={(v) => setForm((f) => ({ ...f, category: v }))}
                />

                {/* Descripción */}
                <div>
                  <Label text="Descripción" />
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Descripción del proyecto..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors resize-none placeholder:text-[#B8B8B8]/40"
                  />
                </div>

                {/* Resultado + Orden */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Resultado"
                    value={form.metric}
                    placeholder="+38% ROAS"
                    onChange={(v) => setForm((f) => ({ ...f, metric: v }))}
                  />
                  <div>
                    <Label text="Orden" />
                    <input
                      type="number"
                      value={form.sort_order}
                      min={0}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          sort_order: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>

                {/* Case Study URL */}
                <FormField
                  label='URL "View Case Study"'
                  value={form.case_study_url}
                  placeholder="https://behance.net/proyecto o link externo"
                  onChange={(v) => setForm((f) => ({ ...f, case_study_url: v }))}
                />

                {/* Error */}
                {formError && (
                  <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3">
                    {formError}
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-white/10 rounded-full text-sm hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <SaveButton
                  onClick={handleSave}
                  saving={saving}
                  saved={false}
                  label={editingProject ? "Guardar cambios" : "Crear proyecto"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label text={label} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
      />
    </div>
  );
}
