"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  supabase,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  signOut,
  type Project,
  type ProjectInput,
} from "@/lib/supabase";
import HeroTab from "./_tabs/HeroTab";
import AboutTab from "./_tabs/AboutTab";
import StyleTab from "./_tabs/StyleTab";
import BrandsTab from "./_tabs/BrandsTab";
import LinksTab from "./_tabs/LinksTab";
import MessagesTab from "./_tabs/MessagesTab";

// ── Tipos ──────────────────────────────────────────────────────────────────

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

// ── Componente principal ───────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"projects" | "hero" | "about" | "style" | "brands" | "links" | "messages">("projects");
  const [authReady, setAuthReady] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auth guard ───────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
      } else {
        setAuthReady(true);
        load();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const { data, error } = await supabase.from("projects").select("*").order("sort_order");
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

  // ── Handlers modal ───────────────────────────────────────────────────────

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

    let imageUrl: string | null = form.image_url.trim() || null;

    // Si hay archivo nuevo, subirlo primero
    if (imageFile) {
      const tempId = editingProject?.id ?? crypto.randomUUID();
      const ext = imageFile.name.split(".").pop();
      const path = `${tempId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        setFormError(`Error al subir imagen: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(path);
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

    if (editingProject) {
      const { error } = await updateProject(editingProject.id, payload);
      if (error) {
        setFormError(`Error al guardar: ${error}`);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await createProject(payload);
      if (error) {
        setFormError(`Error al crear: ${error}`);
        setSaving(false);
        return;
      }
    }

    await load();
    setShowModal(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    await deleteProject(id);
    await load();
    setDeletingId(null);
  }

  async function handleLogout() {
    await signOut();
    router.push("/admin/login");
  }

  // ── Render guard ─────────────────────────────────────────────────────────

  if (!authReady) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // ── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#0A0A0A] text-[#F5F3EF] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-[#B8B8B8] text-sm hover:text-white transition-colors"
          >
            ← Portfolio
          </a>
          <span className="text-white/20 select-none">|</span>
          <span className="text-sm uppercase tracking-[0.25em] text-[#B8B8B8]">
            Admin
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[#B8B8B8] hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/5 px-6">
        <div className="max-w-5xl mx-auto flex gap-1">
          {(["projects", "hero", "about", "style", "brands", "links", "messages"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-white text-white"
                  : "border-transparent text-[#B8B8B8] hover:text-white"
              }`}
            >
              {t === "projects" ? "Proyectos"
                : t === "hero" ? "Hero"
                : t === "about" ? "About Me"
                : t === "style" ? "Estilo"
                : t === "brands" ? "Marcas"
                : t === "links" ? "Links"
                : "Mensajes"}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* ── Hero Tab ── */}
        {tab === "hero" && <HeroTab />}

        {/* ── About Tab ── */}
        {tab === "about" && <AboutTab />}

        {/* ── Style Tab ── */}
        {tab === "style" && <StyleTab />}

        {/* ── Brands Tab ── */}
        {tab === "brands" && <BrandsTab />}

        {/* ── Links Tab ── */}
        {tab === "links" && <LinksTab />}

        {/* ── Messages Tab ── */}
        {tab === "messages" && <MessagesTab />}

        {/* ── Projects Tab ── */}
        {tab === "projects" && <>
        {/* Title row */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl tracking-tight">Proyectos</h1>
            <p className="text-[#B8B8B8] text-sm mt-1">
              {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="px-6 py-3 bg-[#F5F3EF] text-black rounded-full text-sm hover:scale-[1.02] transition-transform"
          >
            + Nuevo proyecto
          </button>
        </div>

        {/* List */}
        {loadError && (
          <div className="mb-6 text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-2xl px-5 py-4">
            <div className="font-medium mb-1">⚠ No se pudo cargar los proyectos</div>
            <div className="font-mono text-xs opacity-80">{loadError}</div>
            <div className="mt-2 text-xs opacity-70">
              Asegurate de haber corrido el SQL de setup en Supabase → SQL Editor.
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="px-4 py-2 border border-white/10 rounded-full text-xs hover:bg-white/5 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="px-4 py-2 border border-red-400/20 text-red-400 rounded-full text-xs hover:bg-red-400/10 transition-colors disabled:opacity-40"
                  >
                    {deletingId === p.id ? "..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>}
      </main>

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
                  {/* Preview / drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-white/25 transition-colors"
                    style={{ minHeight: 120 }}
                  >
                    {imagePreview && (imagePreview.startsWith("blob:") || imagePreview.startsWith("http://") || imagePreview.startsWith("https://")) ? (
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
                        <span className="text-xs text-[#B8B8B8]/50">JPG, PNG, WEBP</span>
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
                  {/* URL alternativa */}
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
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Descripción del proyecto..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors resize-none placeholder:text-[#B8B8B8]/40"
                  />
                </div>

                {/* Resultado + Orden */}
                <div className="grid grid-cols-2 gap-4">
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
                        setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))
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
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#F5F3EF] text-black rounded-full text-sm font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
                >
                  {saving ? "Guardando..." : editingProject ? "Guardar cambios" : "Crear proyecto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────

function Label({ text }: { text: string }) {
  return (
    <div className="text-xs uppercase tracking-[0.2em] text-[#B8B8B8] mb-2">{text}</div>
  );
}

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
