"use client";

import React, { type ReactNode, useEffect, useId, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface VerticalMarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
}

function VerticalMarquee({
  children,
  pauseOnHover = true,
  reverse = false,
  className,
  speed = 24,
}: VerticalMarqueeProps) {
  return (
    <div
      className={cn("group flex flex-col overflow-hidden", className)}
      style={{ "--mz-dur": `${speed}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          "mz-marquee-track flex shrink-0 flex-col",
          reverse && "mz-marquee-rev",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "mz-marquee-track flex shrink-0 flex-col",
          reverse && "mz-marquee-rev",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Official Mad EZ Media Direction A "Clean splat" EZ Badge Lockup (Kit v3).
 * Mounted on a crisp Ink (#120E24) medallion so all four brand inks
 * (#FF2D8A, #1FB6FF, #FFC93C, #9B6BFF) pop cleanly against the Safety Yellow door.
 */
function MadEzLogoLockup() {
  const uid = useId().replace(/:/g, "");
  const qId = `mz-q-${uid}`;
  const gapId = `mz-gap-${uid}`;
  const knockId = `mz-k-${uid}`;
  const ezId = `mz-ez-${uid}`;

  return (
    <div className="mz-lockup inline-flex items-center gap-3.5 sm:gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-[#120E24] p-1.5 shadow-[0_8px_20px_-8px_rgba(18,14,36,0.45)] sm:h-16 sm:w-16">
        <svg
          className="mz-lockup-icon h-full w-full"
          viewBox="0 0 128 128"
          role="img"
          aria-label="Mad EZ Media four-ink pinwheel EZ mark"
        >
          <defs>
            <g id={qId}>
              <g transform="translate(1.6 -1.6)">
                <path d="M64 64V30A34 34 0 0 1 98 64Z" />
                <g transform="rotate(45 64 64)">
                  <path d="M57 44L62 18.5Q64 14 66 18.5L71 44Z" />
                  <circle cx="64" cy="7.5" r="5.5" />
                </g>
                <g transform="rotate(20 64 64)">
                  <path d="M59.5 40L62.7 22.5Q64 19 65.3 22.5L68.5 40Z" />
                  <circle cx="64" cy="12.5" r="3" />
                </g>
                <circle cx="64" cy="17" r="4.5" transform="rotate(72 64 64)" />
              </g>
            </g>

            <g id={ezId}>
              <path d="M-20 -14H-3V-8H-14V-3H-5V3H-14V8H-3V14H-20Z" />
              <path d="M2 -14H20V-8.5L9.5 8H20V14H2V8.5L12.5 -8H2Z" />
            </g>

            <mask id={gapId} maskUnits="userSpaceOnUse" x="0" y="0" width="128" height="128">
              <rect width="128" height="128" fill="#ffffff" />
              <rect
                x="-30.5"
                y="-23.5"
                width="61"
                height="47"
                rx="13"
                transform="translate(90 91) rotate(-8)"
                fill="#000000"
              />
            </mask>

            <mask id={knockId} maskUnits="userSpaceOnUse" x="-40" y="-40" width="80" height="80">
              <rect x="-40" y="-40" width="80" height="80" fill="#ffffff" />
              <use href={`#${ezId}`} transform="scale(.92)" fill="#000000" />
            </mask>
          </defs>

          <g mask={`url(#${gapId})`}>
            <g transform="translate(2 2) scale(.84) translate(64 64) scale(1.08) translate(-64 -64)">
              <use href={`#${qId}`} fill="#FF2D8A" />
              <use href={`#${qId}`} transform="rotate(90 64 64)" fill="#1FB6FF" />
              <use href={`#${qId}`} transform="rotate(180 64 64)" fill="#FFC93C" />
              <use href={`#${qId}`} transform="rotate(270 64 64)" fill="#9B6BFF" />
            </g>
          </g>
          <g transform="translate(90 91) rotate(-8)">
            <rect
              x="-26"
              y="-19"
              width="52"
              height="38"
              rx="9"
              mask={`url(#${knockId})`}
              fill="#FFFFFF"
            />
          </g>
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className="text-[1.65rem] font-black uppercase leading-[0.88] tracking-[-0.005em] text-[#120E24] sm:text-[1.9rem]"
          style={{ fontFamily: "var(--ms-font-body)" }}
        >
          MAD EZ
        </span>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span
            className="text-[0.7rem] font-bold uppercase leading-none tracking-[0.44em] text-[#120E24]"
            style={{ fontFamily: "var(--ms-font-mono)" }}
          >
            MEDIA
          </span>
          <span
            className="grid h-[6px] w-16 grid-cols-4 overflow-hidden rounded-[2px] border border-[#120E24]/30"
            aria-hidden="true"
          >
            <span className="bg-[#FF2D8A]" />
            <span className="bg-[#1FB6FF]" />
            <span className="bg-[#FFC93C]" />
            <span className="bg-[#9B6BFF]" />
          </span>
        </div>
      </div>
    </div>
  );
}

const TRADE_LANES = [
  "24/7 AI Receptionist",
  "Emergency Triage",
  "Plumbing & HVAC",
  "Electricians",
  "Missed-Call Recovery",
  "Direct Dispatch",
];

const STATUS_PILLS = [
  { label: "Inbound", bg: "#1FB6FF", fg: "#120E24" },
  { label: "Emergency", bg: "#FF2D8A", fg: "#120E24" },
  { label: "Job Locked", bg: "#120E24", fg: "#FFC93C" },
] as const;

const MARQUEE_CSS = `
@keyframes mz-marquee-vertical {
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
}
.mz-marquee-track {
  animation: mz-marquee-vertical var(--mz-dur, 24s) linear infinite;
}
.mz-marquee-rev {
  animation-direction: reverse;
}
.mz-lockup-icon {
  transition: transform 0.7s cubic-bezier(.16, 1, .3, 1);
}
.mz-card:hover .mz-lockup-icon {
  transform: rotate(90deg);
}
@media (prefers-reduced-motion: reduce) {
  .mz-marquee-track { animation: none !important; }
  .mz-lockup-icon { transition: none !important; }
  .mz-card:hover .mz-lockup-icon { transform: none !important; }
}
`;

/**
 * Kit v3 Framed Doorway Card to Mad EZ Media.
 * Bounded Safety Yellow (#FFC93C) architectural door floating on page ground
 * with neutral breathing room above the Pushpin Tear Footer, official Direction A
 * EZ Badge + wordmark lockup, canonical status chips, and an embedded Ink (#120E24)
 * vertical dispatch marquee. Zero Ember (#FF6A2B) inside per Kit v3 Color Rule #4.
 */
export default function CTAWithVerticalMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = marqueeRef.current;
    if (!container) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let rafId = 0;
    const updateOpacity = () => {
      const items = container.querySelectorAll<HTMLElement>(".mz-marquee-item");
      const rect = container.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const half = Math.max(1, rect.height / 2);

      items.forEach((item) => {
        const r = item.getBoundingClientRect();
        const dist = Math.abs(centerY - (r.top + r.height / 2));
        const norm = Math.min(dist / half, 1);
        item.style.opacity = String(1 - norm * 0.78);
        item.style.color = norm < 0.28 ? "#FFC93C" : "#FFFFFF";
      });
      rafId = window.requestAnimationFrame(updateOpacity);
    };

    rafId = window.requestAnimationFrame(updateOpacity);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <section
      aria-labelledby="madez-door-heading"
      className="relative w-full overflow-x-clip border-t border-[var(--ms-border)] bg-[var(--ms-ground)] px-4 py-16 sm:px-6 md:px-10 lg:py-24"
    >
      <style dangerouslySetInnerHTML={{ __html: MARQUEE_CSS }} />

      <div className="mx-auto w-full max-w-[1360px]">
        <div className="mz-card relative overflow-hidden rounded-[20px] border-2 border-[#120E24] bg-[#FFC93C] text-[#120E24] shadow-[0_24px_60px_-28px_rgba(18,14,36,0.45)]">
          {/* Four-ink Kit v3 Mad EZ entry bar */}
          <div
            className="grid h-2 w-full grid-cols-4 border-b border-[#120E24]/20"
            aria-hidden="true"
          >
            <span className="bg-[#FF2D8A]" />
            <span className="bg-[#1FB6FF]" />
            <span className="bg-[#FFC93C]" />
            <span className="bg-[#9B6BFF]" />
          </div>

          <div className="px-6 py-11 sm:px-10 md:px-14 lg:py-16">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
              {/* Left Content */}
              <div className="space-y-6 lg:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <MadEzLogoLockup />

                  <div className="flex flex-wrap items-center gap-2" aria-label="Mad EZ dispatch states">
                    {STATUS_PILLS.map((pill) => (
                      <span
                        key={pill.label}
                        className="inline-flex items-center rounded-[6px] border border-[#120E24]/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                        style={{ backgroundColor: pill.bg, color: pill.fg }}
                      >
                        {pill.label}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="block font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#120E24]/80">
                  Run a trade or local service business?
                </span>

                <h2
                  id="madez-door-heading"
                  className="m-0 text-[clamp(2.2rem,4.7vw,3.75rem)] font-black leading-[1.01] tracking-tight text-[#120E24]"
                  style={{ fontFamily: "var(--ms-font-head)" }}
                >
                  Never miss an emergency call for{" "}
                  <em
                    className="italic underline decoration-[#120E24] decoration-[3px] underline-offset-4"
                    style={{ color: "#120E24" }}
                  >
                    Charlotte trades.
                  </em>
                </h2>

                <p className="m-0 max-w-xl text-base font-semibold leading-relaxed text-[#120E24]/85 md:text-lg">
                  24/7 AI receptionists, emergency triage, missed-call recovery, and direct dispatch systems built by Mad EZ Media for plumbers, HVAC teams, and electricians.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="https://madezmedia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("madez_door_click", { cta: "visit_madezmedia" })
                    }
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-[var(--ms-r-button)] bg-[#120E24] px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.1em] text-white no-underline shadow-[4px_4px_0_0_rgba(18,14,36,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    Visit madezmedia.com
                    <ArrowUpRight className="size-4 text-[#FFC93C]" aria-hidden="true" />
                  </a>

                  <a
                    href="#book-call"
                    onClick={() =>
                      trackEvent("madez_door_click", { cta: "trade_walkthrough" })
                    }
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-[var(--ms-r-button)] border-2 border-[#120E24] bg-transparent px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.1em] text-[#120E24] no-underline transition-colors hover:bg-[#120E24] hover:text-white"
                  >
                    Walk through Mad EZ Voice
                  </a>
                </div>
              </div>

              {/* Right Dark Ink Live Dispatch Marquee Panel */}
              <div
                ref={marqueeRef}
                className="relative flex h-[280px] items-center justify-center rounded-[16px] border-2 border-[#120E24] bg-[#120E24] px-6 text-white shadow-[0_16px_36px_-18px_rgba(18,14,36,0.55)] sm:h-[320px] lg:col-span-5 lg:h-[360px]"
              >
                <div className="relative h-full w-full overflow-hidden">
                  <VerticalMarquee speed={22} className="h-full justify-center">
                    {TRADE_LANES.map((item, idx) => (
                      <div
                        key={idx}
                        className="mz-marquee-item py-2.5 text-center text-2xl font-black tracking-tight text-white transition-colors duration-150 sm:text-3xl lg:text-left lg:text-[2.1rem]"
                        style={{ fontFamily: "var(--ms-font-head)" }}
                      >
                        {item}
                      </div>
                    ))}
                  </VerticalMarquee>

                  {/* Smooth top & bottom fades matching #120E24 Ink */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20"
                    style={{
                      background:
                        "linear-gradient(to bottom, #120E24 0%, rgba(18,14,36,0) 100%)",
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20"
                    style={{
                      background:
                        "linear-gradient(to top, #120E24 0%, rgba(18,14,36,0) 100%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
