"use client";

import React, { ReactNode, useEffect, useRef } from "react";
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

const TRADE_LANES = [
  "24/7 AI Receptionist",
  "Emergency Triage",
  "Plumbing & HVAC",
  "Electricians",
  "Missed-Call Recovery",
  "Direct Dispatch",
];

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
@media (prefers-reduced-motion: reduce) {
  .mz-marquee-track { animation: none !important; }
}
`;

/**
 * Kit v3 Cross-Link Door to Mad EZ Media.
 * Safety Yellow (#FFC93C) ground + Ink (#120E24) text = 12.27:1 AAA contrast.
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
        item.style.opacity = String(1 - norm * 0.72);
      });
      rafId = window.requestAnimationFrame(updateOpacity);
    };

    rafId = window.requestAnimationFrame(updateOpacity);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <section
      aria-labelledby="madez-door-heading"
      className="relative w-full overflow-hidden border-t border-[#120E24] bg-[#FFC93C] px-6 py-16 text-[#120E24] md:px-[60px] lg:py-20"
    >
      <style dangerouslySetInnerHTML={{ __html: MARQUEE_CSS }} />

      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left Content */}
          <div className="space-y-6 lg:col-span-6">
            <span className="block font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#120E24]">
              Run a trade or local service business?
            </span>

            <h2
              id="madez-door-heading"
              className="m-0 text-[clamp(2.5rem,5.5vw,4.5rem)] font-black leading-[0.98] tracking-tight text-[#120E24]"
              style={{ fontFamily: "var(--ms-font-head)" }}
            >
              Mad EZ <em className="italic">Media.</em>
            </h2>

            <p className="m-0 max-w-xl text-base font-semibold leading-relaxed text-[#120E24]/85 md:text-lg">
              24/7 AI receptionists, emergency triage, missed-call recovery, and direct dispatch systems built for Charlotte plumbers, HVAC, and electricians.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://madezmedia.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("madez_door_click", { cta: "visit_madezmedia" })
                }
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[var(--ms-r-button)] bg-[#120E24] px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.1em] text-white no-underline transition-transform duration-200 hover:-translate-y-0.5"
              >
                Visit madezmedia.com
                <ArrowUpRight className="size-4 text-[#FF6A2B]" aria-hidden="true" />
              </a>

              <a
                href="#book-call"
                onClick={() =>
                  trackEvent("madez_door_click", { cta: "trade_walkthrough" })
                }
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[var(--ms-r-button)] border-2 border-[#120E24] bg-transparent px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.1em] text-[#120E24] no-underline transition-colors hover:bg-[#120E24] hover:text-white"
              >
                Book a trade walkthrough
              </a>
            </div>
          </div>

          {/* Right Vertical Marquee */}
          <div
            ref={marqueeRef}
            className="relative flex h-[320px] items-center justify-center sm:h-[380px] lg:col-span-6 lg:h-[420px]"
          >
            <div className="relative h-full w-full overflow-hidden">
              <VerticalMarquee speed={20} className="h-full">
                {TRADE_LANES.map((item, idx) => (
                  <div
                    key={idx}
                    className="mz-marquee-item py-5 text-3xl font-black leading-none tracking-tight text-[#120E24] sm:text-4xl lg:text-5xl"
                    style={{ fontFamily: "var(--ms-font-head)" }}
                  >
                    {item}
                  </div>
                ))}
              </VerticalMarquee>

              {/* Safety Yellow top/bottom vignettes */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-28 bg-gradient-to-b from-[#FFC93C] via-[#FFC93C]/70 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-28 bg-gradient-to-t from-[#FFC93C] via-[#FFC93C]/70 to-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
