"use client";

import { useEffect, useState } from "react";
import { getProjects, updateProject, type Project, type CaseStudyData } from "@/lib/supabase";
import { Spinner, Label, SaveButton } from "./_shared";

// ── Types ──────────────────────────────────────────────────────────────────

type ResultItem = { value: string; label: string; context: string };

type FormState = {
  subtitle: string;
  client: string;
  industry: string;
  timeline: string;
  role: string;
  type: CaseStudyData["type"] | "";
  challenge: string;
  strategy_research: string;
  strategy_creative_direction: string;
  strategy_system_design: string;
  strategy_optimization: string;
  results: ResultItem[];
  deep_creative_decisions: string;
  deep_performance_insights: string;
  deep_system_thinking: string;
  testimonial_quote: string;
  testimonial_name: string;
  testimonial_position: string;
  testimonial_company: string;
  gallery: string[];
  process_images: string[];
};

const EMPTY_FORM: FormState = {
  subtitle: "",
  client: "",
  industry: "",
  timeline: "",
  role: "",
  type: "",
  challenge: "",
  strategy_research: "",
  strategy_creative_direction: "",
  strategy_system_design: "",
  strategy_optimization: "",
  results: [],
  deep_creative_decisions: "",
  deep_performance_insights: "",
  deep_system_thinking: "",
  testimonial_quote: "",
  testimonial_name: "",
  testimonial_position: "",
  testimonial_company: "",
  gallery: [],
  process_images: [],
};

const TYPE_OPTIONS: { value: CaseStudyData["type"]; label: string }[] = [
  { value: "paid_social", label: "Paid Social" },
  { value: "branding", label: "Branding" },
  { value: "website", label: "Website" },
  { value: "email", label: "Email" },
  { value: "creative_direction", label: "Creative Direction" },
  { value: "tiktok", label: "TikTok" },
  { value: "launch", label: "Launch" },
  { value: "social_system", label: "Social System" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function projectToForm(p: Project): FormState {
  const cs = p.case_study_data;
  return {
    subtitle: cs?.subtitle ?? "",
    client: cs?.client ?? "",
    industry: cs?.industry ?? "",
    timeline: cs?.timeline ?? "",
    role: cs?.role ?? "",
    type: cs?.type ?? "",
    challenge: cs?.challenge ?? "",
    strategy_research: cs?.strategy?.research ?? "",
    strategy_creative_direction: cs?.strategy?.creative_direction ?? "",
    strategy_system_design: cs?.strategy?.system_design ?? "",
    strategy_optimization: cs?.strategy?.optimization ?? "",
    results: (cs?.results ?? []).map((r) => ({
      value: r.value,
      label: r.label,
      context: r.context ?? "",
    })),
    deep_creative_decisions: cs?.deep_dive?.creative_decisions ?? "",
    deep_performance_insights: cs?.deep_dive?.performance_insights ?? "",
    deep_system_thinking: cs?.deep_dive?.system_thinking ?? "",
    testimonial_quote: cs?.testimonial?.quote ?? "",
    testimonial_name: cs?.testimonial?.name ?? "",
    testimonial_position: cs?.testimonial?.position ?? "",
    testimonial_company: cs?.testimonial?.company ?? "",
    gallery: cs?.gallery ?? [],
    process_images: cs?.process_images ?? [],
  };
}

function formToData(f: FormState): CaseStudyData {
  const data: CaseStudyData = {};

  if (f.subtitle.trim()) data.subtitle = f.subtitle.trim();
  if (f.client.trim()) data.client = f.client.trim();
  if (f.industry.trim()) data.industry = f.industry.trim();
  if (f.timeline.trim()) data.timeline = f.timeline.trim();
  if (f.role.trim()) data.role = f.role.trim();
  if (f.type) data.type = f.type as CaseStudyData["type"];
  if (f.challenge.trim()) data.challenge = f.challenge.trim();

  const strat: CaseStudyData["strategy"] = {};
  if (f.strategy_research.trim()) strat.research = f.strategy_research.trim();
  if (f.strategy_creative_direction.trim()) strat.creative_direction = f.strategy_creative_direction.trim();
  if (f.strategy_system_design.trim()) strat.system_design = f.strategy_system_design.trim();
  if (f.strategy_optimization.trim()) strat.optimization = f.strategy_optimization.trim();
  if (Object.keys(strat).length > 0) data.strategy = strat;

  if (f.results.length > 0) {
    data.results = f.results
      .filter((r) => r.value.trim() && r.label.trim())
      .map((r) => ({
        value: r.value.trim(),
        label: r.label.trim(),
        ...(r.context.trim() ? { context: r.context.trim() } : {}),
      }));
  }

  const dive: CaseStudyData["deep_dive"] = {};
  if (f.deep_creative_decisions.trim()) dive.creative_decisions = f.deep_creative_decisions.trim();
  if (f.deep_performance_insights.trim()) dive.performance_insights = f.deep_performance_insights.trim();
  if (f.deep_system_thinking.trim()) dive.system_thinking = f.deep_system_thinking.trim();
  if (Object.keys(dive).length > 0) data.deep_dive = dive;

  if (f.testimonial_quote.trim()) {
    data.testimonial = {
      quote: f.testimonial_quote.trim(),
      name: f.testimonial_name.trim(),
      position: f.testimonial_position.trim(),
      company: f.testimonial_company.trim(),
    };
  }

  const gallery = f.gallery.filter((u) => u.trim());
  if (gallery.length > 0) data.gallery = gallery;

  const processImages = f.process_images.filter((u) => u.trim());
  if (processImages.length > 0) data.process_images = processImages;

  return data;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CaseStudyTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  function handleSelectProject(id: string) {
    setSelectedId(id);
    setSaved(false);
    setError("");
    if (!id) {
      setForm(EMPTY_FORM);
      return;
    }
    const p = projects.find((x) => x.id === id);
    if (p) setForm(projectToForm(p));
  }

  async function handleClear() {
    if (!selectedId) return;
    setSaving(true);
    setError("");
    const { error: err } = await updateProject(selectedId, { case_study_data: null });
    if (err) {
      setError(`Error al borrar: ${err}`);
    } else {
      setForm(EMPTY_FORM);
      const updated = await getProjects();
      setProjects(updated);
    }
    setSaving(false);
  }

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    setSaved(false);
    setError("");
    const caseStudyData = formToData(form);
    const { error: err } = await updateProject(selectedId, { case_study_data: caseStudyData });
    if (err) {
      setError(`Error al guardar: ${err}`);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Refresh local project list
      const updated = await getProjects();
      setProjects(updated);
    }
    setSaving(false);
  }

  function f(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setSaved(false);
    };
  }

  // Results helpers
  function addResult() {
    setForm((prev) => ({
      ...prev,
      results: [...prev.results, { value: "", label: "", context: "" }],
    }));
  }
  function removeResult(i: number) {
    setForm((prev) => ({
      ...prev,
      results: prev.results.filter((_, idx) => idx !== i),
    }));
  }
  function updateResult(i: number, field: keyof ResultItem, val: string) {
    setForm((prev) => ({
      ...prev,
      results: prev.results.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)),
    }));
    setSaved(false);
  }

  // URL list helpers (gallery / process_images)
  function addUrl(key: "gallery" | "process_images") {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  }
  function removeUrl(key: "gallery" | "process_images", i: number) {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) }));
  }
  function updateUrl(key: "gallery" | "process_images", i: number, val: string) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((u, idx) => (idx === i ? val : u)),
    }));
    setSaved(false);
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl tracking-tight mb-1">Case Studies</h1>
        <p className="text-[#B8B8B8] text-sm">
          Editá el contenido detallado de cada case study.
        </p>
      </div>

      {/* Project selector */}
      <div className="mb-10">
        <Label text="Seleccionar proyecto" />
        <select
          value={selectedId}
          onChange={(e) => handleSelectProject(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors text-[#F5F3EF]"
        >
          <option value="" className="bg-[#111]">
            — Elegí un proyecto —
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#111]">
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {!selectedId ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl text-[#B8B8B8] text-sm">
          Seleccioná un proyecto para editar su case study.
        </div>
      ) : (
        <div className="space-y-10">
          {/* ── Básico ── */}
          <Section title="Información básica">
            <Field label="Subtítulo" value={form.subtitle} onChange={f("subtitle")} placeholder="Breve descripción del proyecto" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Cliente" value={form.client} onChange={f("client")} placeholder="Nombre del cliente" />
              <Field label="Industria" value={form.industry} onChange={f("industry")} placeholder="Ej: Fashion, Tech" />
              <Field label="Timeline" value={form.timeline} onChange={f("timeline")} placeholder="Ej: 3 meses" />
              <Field label="Role" value={form.role} onChange={f("role")} placeholder="Ej: Creative Director" />
            </div>
            <div>
              <Label text="Tipo" />
              <select
                value={form.type}
                onChange={f("type")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors text-[#F5F3EF]"
              >
                <option value="" className="bg-[#111]">— Sin tipo —</option>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#111]">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </Section>

          {/* ── Challenge ── */}
          <Section title="The Challenge">
            <TextArea
              label="Challenge"
              value={form.challenge}
              onChange={f("challenge")}
              placeholder="Describí el problema o desafío que enfrentaba el cliente..."
              rows={5}
            />
          </Section>

          {/* ── Strategy ── */}
          <Section title="Strategy">
            <TextArea label="01 Research" value={form.strategy_research} onChange={f("strategy_research")} rows={3} />
            <TextArea label="02 Creative Direction" value={form.strategy_creative_direction} onChange={f("strategy_creative_direction")} rows={3} />
            <TextArea label="03 System Design" value={form.strategy_system_design} onChange={f("strategy_system_design")} rows={3} />
            <TextArea label="04 Optimization" value={form.strategy_optimization} onChange={f("strategy_optimization")} rows={3} />
          </Section>

          {/* ── Results ── */}
          <Section title="Results">
            <div className="space-y-4">
              {form.results.map((r, i) => (
                <div key={i} className="border border-white/8 rounded-2xl p-5 bg-white/[0.02] space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#B8B8B8] uppercase tracking-wider">Resultado {i + 1}</span>
                    <button
                      onClick={() => removeResult(i)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label text="Valor (ej: +15%)" />
                      <input
                        type="text"
                        value={r.value}
                        onChange={(e) => updateResult(i, "value", e.target.value)}
                        placeholder="+15%"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
                      />
                    </div>
                    <div>
                      <Label text="Label (ej: ROAS)" />
                      <input
                        type="text"
                        value={r.label}
                        onChange={(e) => updateResult(i, "label", e.target.value)}
                        placeholder="ROAS"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
                      />
                    </div>
                  </div>
                  <div>
                    <Label text="Contexto (opcional)" />
                    <input
                      type="text"
                      value={r.context}
                      onChange={(e) => updateResult(i, "context", e.target.value)}
                      placeholder="Ej: Comparado con el trimestre anterior"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addResult}
                className="w-full py-3 border border-dashed border-white/15 rounded-2xl text-sm text-[#B8B8B8] hover:border-white/30 hover:text-white transition-colors"
              >
                + Agregar resultado
              </button>
            </div>
          </Section>

          {/* ── Deep Dive ── */}
          <Section title="Deep Dive">
            <TextArea label="02 / Creative Decisions" value={form.deep_creative_decisions} onChange={f("deep_creative_decisions")} rows={4} />
            <TextArea label="03 / Performance Insights" value={form.deep_performance_insights} onChange={f("deep_performance_insights")} rows={4} />
            <TextArea label="04 / System Thinking" value={form.deep_system_thinking} onChange={f("deep_system_thinking")} rows={4} />
          </Section>

          {/* ── Testimonial ── */}
          <Section title="Testimonial">
            <TextArea label="Quote" value={form.testimonial_quote} onChange={f("testimonial_quote")} rows={3} placeholder='"Frase del cliente..."' />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Nombre" value={form.testimonial_name} onChange={f("testimonial_name")} placeholder="Jane Doe" />
              <Field label="Posición" value={form.testimonial_position} onChange={f("testimonial_position")} placeholder="CEO" />
              <Field label="Empresa" value={form.testimonial_company} onChange={f("testimonial_company")} placeholder="Empresa S.A." />
            </div>
          </Section>

          {/* ── Gallery ── */}
          <Section title="Gallery (URLs de imágenes)">
            <UrlList
              items={form.gallery}
              label="URL imagen"
              placeholder="https://..."
              onAdd={() => addUrl("gallery")}
              onRemove={(i) => removeUrl("gallery", i)}
              onChange={(i, v) => updateUrl("gallery", i, v)}
            />
          </Section>

          {/* ── Process Images ── */}
          <Section title="Process Images (URLs)">
            <UrlList
              items={form.process_images}
              label="URL imagen de proceso"
              placeholder="https://..."
              onAdd={() => addUrl("process_images")}
              onRemove={(i) => removeUrl("process_images", i)}
              onChange={(i, v) => updateUrl("process_images", i, v)}
            />
          </Section>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="pt-4 flex flex-wrap gap-3 items-center">
            <SaveButton
              onClick={handleSave}
              saving={saving}
              saved={saved}
              label="Guardar case study"
            />
            <button
              onClick={handleClear}
              disabled={saving}
              className="px-6 py-3.5 border border-red-400/20 text-red-400 rounded-full text-sm hover:bg-red-400/10 transition-colors disabled:opacity-40"
            >
              Borrar case study
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/8 rounded-2xl p-6 bg-white/[0.01] space-y-5">
      <h3 className="text-sm uppercase tracking-[0.2em] text-[#B8B8B8] border-b border-white/5 pb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label text={label} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <Label text={label} />
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors resize-none placeholder:text-[#B8B8B8]/40"
      />
    </div>
  );
}

function UrlList({
  items,
  label,
  placeholder,
  onAdd,
  onRemove,
  onChange,
}: {
  items: string[];
  label: string;
  placeholder: string;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, val: string) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((url, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className="flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder={placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/40"
            />
          </div>
          <button
            onClick={() => onRemove(i)}
            className="px-3 py-3 border border-red-400/20 text-red-400 rounded-xl text-xs hover:bg-red-400/10 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="w-full py-3 border border-dashed border-white/15 rounded-2xl text-sm text-[#B8B8B8] hover:border-white/30 hover:text-white transition-colors"
      >
        + Agregar {label}
      </button>
    </div>
  );
}
