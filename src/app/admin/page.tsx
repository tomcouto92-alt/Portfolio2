"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, signOut } from "@/lib/supabase";
import HeroTab from "./_tabs/HeroTab";
import AboutTab from "./_tabs/AboutTab";
import StyleTab from "./_tabs/StyleTab";
import BrandsTab from "./_tabs/BrandsTab";
import ServicesTab from "./_tabs/ServicesTab";
import LinksTab from "./_tabs/LinksTab";
import MessagesTab from "./_tabs/MessagesTab";
import ProjectsTab from "./_tabs/ProjectsTab";
import CaseStudyTab from "./_tabs/CaseStudyTab";

// ── Types ──────────────────────────────────────────────────────────────────

type AdminTab =
  | "projects"
  | "case-study"
  | "hero"
  | "about"
  | "style"
  | "brands"
  | "services"
  | "links"
  | "messages";

const TABS: AdminTab[] = [
  "projects",
  "case-study",
  "hero",
  "about",
  "style",
  "brands",
  "services",
  "links",
  "messages",
];

const TAB_LABELS: Record<AdminTab, string> = {
  projects: "Proyectos",
  "case-study": "Case Study",
  hero: "Hero",
  about: "About Me",
  style: "Estilo",
  brands: "Marcas",
  services: "Servicios",
  links: "Links",
  messages: "Mensajes",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("projects");
  const [authReady, setAuthReady] = useState(false);

  // ── Auth guard ───────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/");
      } else {
        setAuthReady(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await signOut();
    router.push("/");
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
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/40 border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
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
      <div
        className="border-b border-white/5 px-4 sm:px-6 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="max-w-5xl mx-auto flex gap-0.5 sm:gap-1 min-w-max md:min-w-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 sm:px-5 py-3 text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-white text-white"
                  : "border-transparent text-[#B8B8B8] hover:text-white"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {tab === "projects" && <ProjectsTab />}
        {tab === "case-study" && <CaseStudyTab />}
        {tab === "hero" && <HeroTab />}
        {tab === "about" && <AboutTab />}
        {tab === "style" && <StyleTab />}
        {tab === "brands" && <BrandsTab />}
        {tab === "services" && <ServicesTab />}
        {tab === "links" && <LinksTab />}
        {tab === "messages" && <MessagesTab />}
      </main>
    </div>
  );
}
