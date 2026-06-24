"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/supabase";

interface Props {
  project: Project;
  prevProject: Project | null;
  nextProject: Project | null;
}

export default function CaseStudyPage({ project, prevProject, nextProject }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const cs = project.case_study_data;

  // Scroll listener for nav border
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection observer for fade-up animations
  useEffect(() => {
    const els = document.querySelectorAll(".fade-up");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const hasStrategy =
    cs?.strategy &&
    Object.values(cs.strategy).some((v) => v && v.trim() !== "");

  const hasResults =
    (cs?.results && cs.results.length > 0) || !!project.metric;

  const hasDeepDive =
    cs?.deep_dive &&
    Object.values(cs.deep_dive).some((v) => v && v.trim() !== "");

  const hasGallery = cs?.gallery && cs.gallery.length > 0;
  const hasProcessImages = cs?.process_images && cs.process_images.length > 0;
  const hasTestimonial = !!cs?.testimonial?.quote;

  const strategyItems = [
    { num: "01", title: "Research", key: "research" as const },
    { num: "02", title: "Creative Direction", key: "creative_direction" as const },
    { num: "03", title: "System Design", key: "system_design" as const },
    { num: "04", title: "Optimization", key: "optimization" as const },
  ];

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ backgroundColor: "#0A0A0A", color: "#F5F3EF" }}
    >
      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10"
            : "bg-transparent border-b border-white/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <Link
            href="/#work"
            className="text-[#B8B8B8] text-sm hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Work
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <span className="uppercase tracking-[0.25em] text-[#B8B8B8] text-xs">
              {project.category}
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[#F5F3EF]">{project.title}</span>
          </div>
          <div className="w-28 hidden md:block" />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="grid lg:grid-cols-2 gap-16 items-center min-h-screen px-6 lg:px-16 pt-32 pb-24 max-w-7xl mx-auto">
        {/* Left */}
        <div>
          <div className="fade-up uppercase tracking-[0.3em] text-[#B8B8B8] text-xs mb-6">
            {project.category}
          </div>
          <h1
            className="fade-up fade-up-delay-1 font-medium tracking-[-0.03em] leading-[0.9] mb-6"
            style={{ fontSize: "clamp(42px, 5.5vw, 80px)" }}
          >
            {project.title}
          </h1>
          <p className="fade-up fade-up-delay-2 text-lg text-[#B8B8B8] max-w-md mb-10 leading-relaxed">
            {cs?.subtitle || project.description}
          </p>

          {/* Metadata grid */}
          {(cs?.client || cs?.industry || cs?.timeline || cs?.role) && (
            <div className="fade-up fade-up-delay-3 grid grid-cols-2 gap-x-8 gap-y-6">
              {cs?.client && (
                <div>
                  <div className="uppercase tracking-[0.25em] text-[#B8B8B8] text-xs mb-1">
                    Client
                  </div>
                  <div className="text-sm">{cs.client}</div>
                </div>
              )}
              {cs?.industry && (
                <div>
                  <div className="uppercase tracking-[0.25em] text-[#B8B8B8] text-xs mb-1">
                    Industry
                  </div>
                  <div className="text-sm">{cs.industry}</div>
                </div>
              )}
              {cs?.timeline && (
                <div>
                  <div className="uppercase tracking-[0.25em] text-[#B8B8B8] text-xs mb-1">
                    Timeline
                  </div>
                  <div className="text-sm">{cs.timeline}</div>
                </div>
              )}
              {cs?.role && (
                <div>
                  <div className="uppercase tracking-[0.25em] text-[#B8B8B8] text-xs mb-1">
                    Role
                  </div>
                  <div className="text-sm">{cs.role}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — image */}
        <div className="fade-up fade-up-delay-2 relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10">
          {project.image_url ? (
            <Image
              src={project.image_url}
              alt={project.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02]" />
          )}
        </div>
      </section>

      {/* ── OVERVIEW — The challenge ── */}
      <section className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 py-32 px-6 lg:px-16 border-t border-white/5">
        {/* Left */}
        <div>
          <div
            className="fade-up font-medium text-white/5 leading-none select-none mb-4"
            style={{ fontSize: "clamp(80px, 10vw, 120px)" }}
          >
            01
          </div>
          <h2 className="fade-up fade-up-delay-1 text-5xl tracking-[-0.02em] leading-[1]">
            The challenge.
          </h2>
        </div>
        {/* Right */}
        <div className="fade-up fade-up-delay-2 flex items-center">
          <p className="text-lg text-[#B8B8B8] leading-relaxed">
            {cs?.challenge || project.description}
          </p>
        </div>
      </section>

      {/* ── STRATEGY ── */}
      {hasStrategy && (
        <section className="py-32 px-6 lg:px-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="fade-up text-5xl md:text-6xl tracking-[-0.02em] leading-[1] text-center mb-20">
              Strategy before design.
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {strategyItems.map((item) => {
                const content = cs?.strategy?.[item.key];
                if (!content) return null;
                return (
                  <div
                    key={item.key}
                    className="fade-up border border-white/10 rounded-[2rem] p-10 bg-white/[0.02]"
                  >
                    <div className="text-5xl font-medium text-white/10 mb-6">
                      {item.num}
                    </div>
                    <div className="text-lg tracking-tight mb-3">{item.title}</div>
                    <p className="text-[#B8B8B8] text-sm leading-relaxed">{content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── PROCESS IMAGES ── */}
      {hasProcessImages && (
        <section className="py-32 px-6 lg:px-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="fade-up text-4xl tracking-[-0.02em] mb-12">
              The creative process.
            </h2>
            <div className="flex flex-col gap-6">
              {cs!.process_images!.map((src, i) => (
                <div
                  key={src}
                  className="fade-up overflow-hidden rounded-[1.5rem] border border-white/10"
                >
                  <Image
                    src={src}
                    alt={`Process ${i + 1}`}
                    width={1400}
                    height={900}
                    className="w-full h-auto"
                    sizes="100vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RESULTS ── */}
      {hasResults && (
        <section className="py-32 px-6 lg:px-16 border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="fade-up uppercase tracking-[0.3em] text-[#B8B8B8] text-xs mb-16 text-center">
              Results
            </div>
            {cs?.results && cs.results.length > 0 ? (
              <div
                className={`grid gap-12 ${
                  cs.results.length === 1
                    ? "place-items-center"
                    : cs.results.length === 2
                    ? "md:grid-cols-2"
                    : cs.results.length === 3
                    ? "md:grid-cols-3"
                    : "md:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {cs.results.map((r) => (
                  <div key={r.value + r.label} className="fade-up text-center">
                    <div
                      className="font-medium tracking-[-0.03em] leading-none"
                      style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
                    >
                      {r.value}
                    </div>
                    <div className="uppercase tracking-[0.3em] text-[#B8B8B8] text-xs mt-2 mb-3">
                      {r.label}
                    </div>
                    {r.context && (
                      <p className="text-sm text-[#B8B8B8]/70 max-w-[200px] mx-auto">
                        {r.context}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div
                  className="font-medium tracking-[-0.03em] leading-none"
                  style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
                >
                  {project.metric}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── DEEP DIVE ── */}
      {hasDeepDive && (
        <section className="py-32 px-6 lg:px-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_2fr] gap-16">
              <div>
                <div
                  className="fade-up font-medium text-white/5 leading-none select-none mb-4"
                  style={{ fontSize: "clamp(60px, 8vw, 100px)" }}
                >
                  02
                </div>
              </div>
              <div className="space-y-20">
                {cs?.deep_dive?.creative_decisions && (
                  <div className="fade-up">
                    <div className="text-xs uppercase tracking-[0.3em] text-[#B8B8B8] mb-3">
                      02 / Creative Decisions
                    </div>
                    <h3 className="text-3xl tracking-tight mb-5">
                      Creative Decisions
                    </h3>
                    <p className="text-[#B8B8B8] leading-relaxed">
                      {cs.deep_dive.creative_decisions}
                    </p>
                  </div>
                )}
                {cs?.deep_dive?.performance_insights && (
                  <div className="fade-up">
                    <div className="text-xs uppercase tracking-[0.3em] text-[#B8B8B8] mb-3">
                      03 / Performance Insights
                    </div>
                    <h3 className="text-3xl tracking-tight mb-5">
                      Performance Insights
                    </h3>
                    <p className="text-[#B8B8B8] leading-relaxed">
                      {cs.deep_dive.performance_insights}
                    </p>
                  </div>
                )}
                {cs?.deep_dive?.system_thinking && (
                  <div className="fade-up">
                    <div className="text-xs uppercase tracking-[0.3em] text-[#B8B8B8] mb-3">
                      04 / System Thinking
                    </div>
                    <h3 className="text-3xl tracking-tight mb-5">
                      System Thinking
                    </h3>
                    <p className="text-[#B8B8B8] leading-relaxed">
                      {cs.deep_dive.system_thinking}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY ── */}
      {hasGallery && (
        <section className="py-32 px-6 lg:px-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="fade-up text-5xl tracking-[-0.02em] leading-[1] mb-12">
              The final system.
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cs!.gallery!.map((src) => (
                <div
                  key={src}
                  className="fade-up relative aspect-[4/3] rounded-[1.5rem] overflow-hidden border border-white/10"
                >
                  <Image
                    src={src}
                    alt="Gallery image"
                    fill
                    className="object-cover hover:scale-[1.02] transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIAL ── */}
      {hasTestimonial && (
        <section className="py-32 px-6 lg:px-16 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="fade-up font-medium text-white/10 leading-none select-none mb-0"
              style={{ fontSize: "clamp(80px, 10vw, 120px)" }}
            >
              &ldquo;
            </div>
            <blockquote className="fade-up fade-up-delay-1 text-2xl md:text-3xl tracking-tight leading-snug -mt-8 mb-10">
              {cs!.testimonial!.quote}
            </blockquote>
            <div className="fade-up fade-up-delay-2">
              <div className="text-[#F5F3EF] font-medium mb-1">
                — {cs!.testimonial!.name}
              </div>
              <div className="text-[#B8B8B8] text-sm">
                {cs!.testimonial!.position}, {cs!.testimonial!.company}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PROJECT NAVIGATION ── */}
      {(prevProject || nextProject) && (
        <section className="py-24 px-6 lg:px-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="fade-up uppercase tracking-[0.3em] text-[#B8B8B8] text-xs mb-12 text-center">
              Continue exploring
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {prevProject && (
                <Link
                  href={`/work/${prevProject.id}`}
                  className="group border border-white/10 rounded-[2rem] overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {prevProject.image_url ? (
                      <Image
                        src={prevProject.image_url}
                        alt={prevProject.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02]" />
                    )}
                  </div>
                  <div className="p-8 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-[#B8B8B8] mb-2">
                        ← Previous
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#B8B8B8] mb-1">
                        {prevProject.category}
                      </div>
                      <div className="text-xl tracking-tight">{prevProject.title}</div>
                    </div>
                  </div>
                </Link>
              )}
              {nextProject && (
                <Link
                  href={`/work/${nextProject.id}`}
                  className="group border border-white/10 rounded-[2rem] overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {nextProject.image_url ? (
                      <Image
                        src={nextProject.image_url}
                        alt={nextProject.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02]" />
                    )}
                  </div>
                  <div className="p-8 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-[#B8B8B8] mb-2">
                        Next →
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#B8B8B8] mb-1">
                        {nextProject.category}
                      </div>
                      <div className="text-xl tracking-tight">{nextProject.title}</div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ── */}
      <section className="py-32 px-6 lg:px-16 border-t border-white/5 text-center">
        <div className="max-w-4xl mx-auto">
          <h2
            className="fade-up font-medium tracking-[-0.03em] leading-[0.95] mb-12"
            style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
          >
            Let&apos;s build work people
            <br />
            actually remember.
          </h2>
          <div className="fade-up fade-up-delay-1 flex flex-wrap justify-center gap-4">
            <Link
              href="/#work"
              className="px-8 py-4 border border-white/10 rounded-full text-sm hover:bg-white/5 transition-colors"
            >
              ← View More Work
            </Link>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/#contact";
              }}
              className="px-8 py-4 bg-[#F5F3EF] text-black rounded-full text-sm font-medium hover:scale-[1.02] transition-transform"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
