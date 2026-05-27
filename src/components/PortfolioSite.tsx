"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getProjects, getSetting, sendContactMessage, type Project, type AboutData, type StyleSettings, type SiteLinks } from "@/lib/supabase";

// Proyectos estáticos de fallback (se usan si Supabase no está configurado aún)
const FALLBACK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Paid Social Systems",
    category: "Performance Creative",
    description:
      "High-converting paid social campaigns blending premium art direction with direct-response performance.",
    metric: "+38% ROAS",
    image_url:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1400&q=80",
    sort_order: 1,
    case_study_url: null,
    created_at: "",
  },
  {
    id: "2",
    title: "Creator Commerce",
    category: "UGC / TikTok",
    description:
      "Social-first creative systems designed for creator-led brands and TikTok Shop ecosystems.",
    metric: "12M+ Views",
    image_url:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1400&q=80",
    sort_order: 2,
    case_study_url: null,
    created_at: "",
  },
  {
    id: "3",
    title: "Brand Identity",
    category: "Branding",
    description:
      "Editorial identity systems balancing clarity, luxury, and conversion-focused storytelling.",
    metric: "Global Launch",
    image_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=80",
    sort_order: 3,
    case_study_url: null,
    created_at: "",
  },
  {
    id: "4",
    title: "Pitch Deck Design",
    category: "Presentation",
    description:
      "Investor-grade storytelling decks for creator economy startups and modern agencies.",
    metric: "$5M Raised",
    image_url:
      "https://images.unsplash.com/photo-1590845947698-8924d7409b56?auto=format&fit=crop&w=1400&q=80",
    sort_order: 4,
    case_study_url: null,
    created_at: "",
  },
];

const SERVICES = [
  "Creative Direction",
  "Paid Social Design",
  "UGC Creative Systems",
  "Motion Design",
  "Branding",
  "Pitch Deck Design",
];

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

const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1590845947698-8924d7409b56?auto=format&fit=crop&w=1000&q=80",
];

const DEFAULT_ABOUT: AboutData = {
  title: "Creative direction built for the attention economy.",
  description:
    "Senior designer specializing in premium social-first creative, performance marketing systems, motion design, and creator-commerce storytelling. Blending editorial aesthetics with conversion-driven execution.",
  image_url:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
  experience: [
    { company: "Influencer Marketing Agency", role: "Senior Designer" },
    { company: "Creative Direction", role: "Social-First Campaigns" },
    { company: "Focus", role: "Performance + Branding" },
  ],
};

const DEFAULT_STYLE: StyleSettings = {
  fontHeading: "Inter",
  fontBody:    "Inter",
  colorBg:     "#0A0A0A",
  colorText:   "#F5F3EF",
  colorMuted:  "#B8B8B8",
  colorLight:  "#F5F3EF",
};

export default function PortfolioSite() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [heroImages, setHeroImages] = useState<string[]>(DEFAULT_HERO_IMAGES);
  const [about, setAbout] = useState<AboutData>(DEFAULT_ABOUT);
  const [siteStyle, setSiteStyle] = useState<StyleSettings>(DEFAULT_STYLE);
  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [siteLinks, setSiteLinks] = useState<SiteLinks>({
    cta_label:      "Get In Touch",
    cta_href:       "mailto:hello@tomascouto.com",
    behance_url:    "",
    behance_label:  "Behance",
    linkedin_url:   "",
    linkedin_label: "LinkedIn",
  });
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSending, setContactSending] = useState(false);
  const [contactDone, setContactDone] = useState(false);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    const supabaseReady =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://xxxxxxxxxxxx.supabase.co";

    async function loadAll() {
      if (supabaseReady) {
        const [projectData, heroData, aboutData, styleData, brandsData, linksData] = await Promise.all([
          getProjects(),
          getSetting("hero_images"),
          getSetting("about"),
          getSetting("style"),
          getSetting("brands"),
          getSetting("links"),
        ]);
        if (projectData.length > 0) setProjects(projectData);
        if (heroData && heroData.length > 0) setHeroImages(heroData);
        if (aboutData) setAbout(aboutData);
        if (styleData) setSiteStyle({ ...DEFAULT_STYLE, ...styleData });
        if (brandsData && brandsData.length > 0) setBrands(brandsData);
        if (linksData) setSiteLinks((prev) => ({ ...prev, ...linksData }));
      }
      setLoading(false);
    }
    loadAll();
  }, []);

  // Aplica fuentes y colores como CSS variables globales
  useEffect(() => {
    const { fontHeading, fontBody, colorBg, colorText, colorMuted, colorLight } = siteStyle;

    // Inyectar Google Fonts
    const id = "portfolio-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    const fonts = [...new Set([fontHeading, fontBody])];
    link.href = `https://fonts.googleapis.com/css2?${fonts
      .map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`)
      .join("&")}&display=swap`;

    // Inyectar CSS variables + overrides de tipografía
    const styleId = "portfolio-vars";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      :root {
        --p-bg:    ${colorBg};
        --p-text:  ${colorText};
        --p-muted: ${colorMuted};
        --p-light: ${colorLight};
      }
      .portfolio-root h1,
      .portfolio-root h2,
      .portfolio-root h3,
      .portfolio-root h4 {
        font-family: '${fontHeading}', sans-serif !important;
      }
      .portfolio-root {
        font-family: '${fontBody}', sans-serif !important;
      }
    `;
  }, [siteStyle]);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactError("Completá todos los campos.");
      return;
    }
    setContactSending(true);
    setContactError("");
    const { error } = await sendContactMessage(contactForm.name, contactForm.email, contactForm.message);
    if (error) {
      setContactError("No se pudo enviar. Intentá de nuevo.");
    } else {
      setContactDone(true);
      setContactForm({ name: "", email: "", message: "" });
    }
    setContactSending(false);
  }

  return (
    <div className="min-h-screen font-sans overflow-x-hidden portfolio-root" style={{ backgroundColor: "var(--p-bg)", color: "var(--p-text)" }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-sm tracking-[0.25em] uppercase text-[var(--p-muted)]">
            Tomas Couto
          </div>
          <div className="hidden md:flex gap-8 text-sm text-[var(--p-muted)]">
            <a href="#work" className="hover:text-white transition-colors">Work</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="uppercase tracking-[0.3em] text-[var(--p-muted)] text-xs mb-6">
              Senior Graphic Designer / Art Director
            </div>
            <h1 className="max-w-[11ch] text-[85px] leading-[0.95] font-medium tracking-tight mb-8">
              Designing high-performing creative for modern brands.
            </h1>
            <p className="text-lg md:text-xl text-[var(--p-muted)] max-w-xl leading-relaxed mb-10">
              Premium social-first design systems blending performance marketing,
              editorial aesthetics, motion, and creator-commerce storytelling.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#work"
                className="px-7 py-4 bg-[var(--p-light)] text-black rounded-full text-sm hover:scale-[1.02] transition-transform"
              >
                View Work
              </a>
              <a
                href="#contact"
                className="px-7 py-4 border border-white/10 rounded-full text-sm hover:bg-white/5 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="relative h-[600px] rounded-[2rem] overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
            <div className="absolute inset-0 grid grid-cols-2 gap-3 p-3">
              {heroImages.map((src: string, i: number) => (
                <div
                  key={i}
                  className="rounded-[1.5rem] overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10" />
                  <Image
                    src={src}
                    alt="Portfolio"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-white/5 py-6 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee text-[var(--p-muted)] text-sm uppercase tracking-[0.3em] flex gap-16 w-max">
          {brands.concat(brands).map((brand: string, i: number) => (
            <span key={i}>{brand}</span>
          ))}
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <div className="uppercase tracking-[0.3em] text-[var(--p-muted)] text-xs mb-5">
              Selected Work
            </div>
            <h2 className="text-5xl md:text-7xl max-w-4xl leading-[1] tracking-tight">
              Strategic creative systems built for performance and brand equity.
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid gap-28">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 aspect-[4/3]">
                    {project.image_url && (
                      <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                  </div>

                  <div>
                    <div className="text-sm uppercase tracking-[0.3em] text-[var(--p-muted)] mb-5">
                      {project.category}
                    </div>
                    <h3 className="text-4xl md:text-5xl leading-[1] mb-6 tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-[var(--p-muted)] text-lg leading-relaxed mb-8 max-w-lg">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-6 mb-10">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-[var(--p-muted)] mb-2">
                          Results
                        </div>
                        <div className="text-2xl">{project.metric}</div>
                      </div>
                    </div>
                    {project.case_study_url && (
                      <a
                        href={project.case_study_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border border-white/10 rounded-full px-6 py-3 text-sm hover:bg-white/5 transition-colors"
                      >
                        View Case Study
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-[var(--p-light)] text-black px-6 py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="uppercase tracking-[0.3em] text-gray-500 text-xs mb-5">
              About
            </div>
            <h2 className="text-5xl md:text-7xl leading-[1] tracking-tight mb-8">
              {about.title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-10 max-w-xl">
              {about.description}
            </p>
            <div className="space-y-8">
              {about.experience.map((e, i) => (
                <div key={i} className="border-t border-black/10 pt-5 flex justify-between text-sm">
                  <span>{e.company}</span>
                  <span className="text-gray-500">{e.role}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-200">
            <Image
              src={about.image_url}
              alt="Portrait"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <div className="uppercase tracking-[0.3em] text-[var(--p-muted)] text-xs mb-5">
              Services
            </div>
            <h2 className="text-5xl md:text-7xl tracking-tight leading-[1] max-w-4xl">
              Building creative systems for ambitious brands.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div
                key={service}
                className="border border-white/10 rounded-[2rem] p-10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="text-2xl leading-snug tracking-tight">{service}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-6 py-32 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="uppercase tracking-[0.3em] text-[var(--p-muted)] text-xs mb-6">
            Contact
          </div>
          <h2 className="text-5xl md:text-7xl tracking-tight leading-[0.95] mb-10">
            Let&apos;s build work people actually remember.
          </h2>
          <p className="text-[var(--p-muted)] text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Available for freelance projects, creative partnerships, social
            campaigns, and full creative systems.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => { setContactOpen(true); setContactDone(false); setContactError(""); }}
              className="px-8 py-4 rounded-full bg-[var(--p-light)] text-black text-sm hover:scale-[1.02] transition-transform"
            >
              {siteLinks.cta_label}
            </button>
            {siteLinks.behance_url && (
              <a
                href={siteLinks.behance_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors"
              >
                {siteLinks.behance_label}
              </a>
            )}
            {siteLinks.linkedin_url && (
              <a
                href={siteLinks.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors"
              >
                {siteLinks.linkedin_label}
              </a>
            )}
          </div>
        </div>
      </section>
      {/* CONTACT MODAL */}
      {contactOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={(e) => e.target === e.currentTarget && setContactOpen(false)}
        >
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl tracking-tight" style={{ color: "var(--p-text)" }}>Get in touch</h2>
                <button
                  onClick={() => setContactOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-[var(--p-muted)] hover:text-white transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {contactDone ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✓</div>
                  <p className="text-lg mb-2" style={{ color: "var(--p-text)" }}>Message sent!</p>
                  <p className="text-sm text-[var(--p-muted)] mb-6">I&apos;ll get back to you shortly.</p>
                  <button
                    onClick={() => setContactOpen(false)}
                    className="px-6 py-3 rounded-full text-sm"
                    style={{ backgroundColor: "var(--p-light)", color: "#000" }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-[var(--p-muted)] mb-2 block">Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[var(--p-muted)]/40"
                      style={{ color: "var(--p-text)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-[var(--p-muted)] mb-2 block">Email address</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="tu@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[var(--p-muted)]/40"
                      style={{ color: "var(--p-text)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-[var(--p-muted)] mb-2 block">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell me about your project..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors resize-none placeholder:text-[var(--p-muted)]/40"
                      style={{ color: "var(--p-text)" }}
                    />
                  </div>
                  {contactError && (
                    <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3">
                      Please fill in all fields.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={contactSending}
                    className="w-full py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
                    style={{ backgroundColor: "var(--p-light)", color: "#000" }}
                  >
                    {contactSending ? "Sending..." : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
