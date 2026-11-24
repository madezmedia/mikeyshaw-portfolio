"use client";

import type React from "react";
import { useState } from "react";
import { ArrowUpRight, Calendar } from "lucide-react";

export interface LetsWorkTogetherProps {
  availabilityText?: string;
  headlineTop?: string;
  headlineBottom?: string;
  subcopy?: string;
  email?: string;
  calUrl?: string;
  scrollTargetId?: string;
  callSubtext?: string;
  className?: string;
}

export function LetsWorkTogether({
  availabilityText = "Open for Fractional CTO & AI Builds",
  headlineTop = "Let's work",
  headlineBottom = "together",
  subcopy = "Bring one real operational bottleneck or multi-agent roadmap. I will tell you straight what to build and what to skip.",
  email = "michael@madezmedia.com",
  calUrl = "https://cal.com/mad-ez-media/ai-automation-discovery",
  scrollTargetId = "book-call",
  callSubtext = "15 or 30 min discovery · Tue to Thu ET",
  className = "",
}: LetsWorkTogetherProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsClicked(true);

    window.setTimeout(() => {
      setShowSuccess(true);
    }, 420);
  };

  const handleBookCall = () => {
    if (scrollTargetId && typeof document !== "undefined") {
      const target = document.getElementById(scrollTargetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.open(calUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`flex items-center justify-center px-4 py-12 sm:py-16 md:py-20 ${className}`}
    >
      <div className="relative flex w-full max-w-3xl flex-col items-center gap-8 sm:gap-10">
        {/* Revealed CTA state */}
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: showSuccess ? 1 : 0,
            transform: showSuccess
              ? "translateY(0) scale(1)"
              : "translateY(20px) scale(0.95)",
            pointerEvents: showSuccess ? "auto" : "none",
          }}
          aria-hidden={!showSuccess}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              className="text-xs font-bold tracking-[0.26em] uppercase text-[var(--ms-accent-text)] transition-all duration-500"
              style={{
                fontFamily: "var(--ms-font-mono)",
                transform: showSuccess ? "translateY(0)" : "translateY(10px)",
                opacity: showSuccess ? 1 : 0,
                transitionDelay: "100ms",
              }}
            >
              Ready when you are
            </span>
            <h3
              className="text-3xl font-black tracking-tight text-[var(--ms-text)] transition-all duration-500 sm:text-5xl"
              style={{
                fontFamily: "var(--ms-font-head)",
                transform: showSuccess ? "translateY(0)" : "translateY(10px)",
                opacity: showSuccess ? 1 : 0,
                transitionDelay: "180ms",
              }}
            >
              Pick your <em className="italic text-[var(--ms-accent-text)]">window.</em>
            </h3>
          </div>

          <button
            type="button"
            onClick={handleBookCall}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            tabIndex={showSuccess ? 0 : -1}
            className="group relative flex min-h-[48px] items-center gap-3 sm:gap-4 transition-all duration-500 cursor-pointer bg-transparent border-0"
            style={{
              transform: showSuccess
                ? isButtonHovered
                  ? "translateY(-2px) scale(1.02)"
                  : "translateY(0) scale(1)"
                : "translateY(15px) scale(1)",
              opacity: showSuccess ? 1 : 0,
              transitionDelay: "150ms",
            }}
          >
            <span
              className="hidden sm:block h-px w-10 bg-[var(--ms-border)] transition-all duration-500"
              style={{
                transform: isButtonHovered ? "scaleX(0)" : "scaleX(1)",
                opacity: isButtonHovered ? 0 : 0.8,
              }}
            />

            <span
              className="relative flex min-h-[48px] items-center gap-3 overflow-hidden rounded-full border-2 px-6 py-3 transition-all duration-300 sm:px-8 sm:py-3.5"
              style={{
                borderColor: isButtonHovered
                  ? "var(--ms-ember)"
                  : "var(--ms-text)",
                backgroundColor: isButtonHovered
                  ? "var(--ms-ember)"
                  : "var(--ms-btn-bg)",
                color: isButtonHovered ? "var(--ms-ink)" : "var(--ms-btn-fg)",
              }}
            >
              <Calendar className="size-4 sm:size-5" strokeWidth={2} />
              <span className="text-sm font-bold uppercase tracking-[0.08em] sm:text-base">
                Jump to open slots
              </span>
              <ArrowUpRight
                className="size-4 transition-transform duration-300 sm:size-5"
                strokeWidth={2}
                style={{
                  transform: isButtonHovered
                    ? "translate(3px, -3px) scale(1.08)"
                    : "translate(0, 0) scale(1)",
                }}
              />
            </span>

            <span
              className="hidden sm:block h-px w-10 bg-[var(--ms-border)] transition-all duration-500"
              style={{
                transform: isButtonHovered ? "scaleX(0)" : "scaleX(1)",
                opacity: isButtonHovered ? 0 : 0.8,
              }}
            />
          </button>

          <div
            className="flex flex-wrap items-center justify-center gap-4 text-xs tracking-[0.16em] uppercase text-[var(--ms-muted)] transition-all duration-500"
            style={{
              fontFamily: "var(--ms-font-mono)",
              transform: showSuccess ? "translateY(0)" : "translateY(10px)",
              opacity: showSuccess ? 1 : 0,
              transitionDelay: "360ms",
            }}
          >
            <span>{callSubtext}</span>
            <a
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={showSuccess ? 0 : -1}
              className="font-bold text-[var(--ms-text)] underline decoration-[var(--ms-ember)] decoration-2 underline-offset-4 hover:text-[var(--ms-accent-text)]"
            >
              Open Cal.com →
            </a>
          </div>
        </div>

        {/* Initial availability badge */}
        <div
          className="flex items-center gap-3 transition-all duration-500"
          style={{
            opacity: isClicked ? 0 : 1,
            transform: isClicked ? "translateY(-16px)" : "translateY(0)",
            pointerEvents: isClicked ? "none" : "auto",
          }}
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ms-ember)] opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[var(--ms-ember)]" />
          </span>
          <span
            className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--ms-muted)]"
            style={{ fontFamily: "var(--ms-font-mono)" }}
          >
            {availabilityText}
          </span>
        </div>

        {/* Interactive headline trigger */}
        <button
          type="button"
          className="group relative cursor-pointer border-0 bg-transparent p-2 text-center focus-visible:outline-[3px] focus-visible:outline-[var(--ms-focus)] rounded-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          tabIndex={isClicked ? -1 : 0}
          aria-label="Let's work together, reveal booking options"
          style={{
            pointerEvents: isClicked ? "none" : "auto",
          }}
        >
          <div className="flex flex-col items-center gap-5">
            <h2
              className="relative m-0 text-center text-4xl font-black tracking-tight text-[var(--ms-text)] sm:text-6xl md:text-7xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] leading-[1.02]"
              style={{
                fontFamily: "var(--ms-font-head)",
                opacity: isClicked ? 0 : 1,
                transform: isClicked
                  ? "translateY(-36px) scale(0.95)"
                  : "translateY(0) scale(1)",
              }}
            >
              <span className="block overflow-hidden">
                <span
                  className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform:
                      isHovered && !isClicked
                        ? "translateY(-6%)"
                        : "translateY(0)",
                  }}
                >
                  {headlineTop}
                </span>
              </span>
              <span className="block overflow-hidden">
                <span
                  className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-75"
                  style={{
                    transform:
                      isHovered && !isClicked
                        ? "translateY(-6%)"
                        : "translateY(0)",
                  }}
                >
                  <em className="italic text-[var(--ms-accent-text)]">
                    {headlineBottom}
                  </em>
                </span>
              </span>
            </h2>

            <div className="relative mt-2 flex size-14 items-center justify-center sm:size-16">
              <div
                className="pointer-events-none absolute inset-0 rounded-full border-2 transition-all ease-out"
                style={{
                  borderColor:
                    isClicked || isHovered
                      ? "var(--ms-ember)"
                      : "var(--ms-border)",
                  backgroundColor: isClicked
                    ? "transparent"
                    : isHovered
                      ? "var(--ms-ember)"
                      : "transparent",
                  transform: isClicked
                    ? "scale(2.6)"
                    : isHovered
                      ? "scale(1.1)"
                      : "scale(1)",
                  opacity: isClicked ? 0 : 1,
                  transitionDuration: isClicked ? "650ms" : "450ms",
                }}
              />
              <ArrowUpRight
                className="size-6 transition-all ease-[cubic-bezier(0.16,1,0.3,1)] sm:size-7"
                style={{
                  transform: isClicked
                    ? "translate(80px, -80px) scale(0.5)"
                    : isHovered
                      ? "translate(2px, -2px)"
                      : "translate(0, 0)",
                  opacity: isClicked ? 0 : 1,
                  color:
                    isHovered && !isClicked
                      ? "var(--ms-ink)"
                      : "var(--ms-text)",
                  transitionDuration: isClicked ? "550ms" : "450ms",
                }}
              />
            </div>
          </div>

          {/* Flanking hairline rules (hidden on tiny screens to avoid overflow) */}
          <span
            aria-hidden="true"
            className="hidden sm:block absolute -left-14 top-1/2 -translate-y-1/2"
          >
            <span
              className="block h-px w-10 bg-[var(--ms-border)] transition-all duration-500"
              style={{
                transform: isClicked
                  ? "scaleX(0) translateX(-16px)"
                  : isHovered
                    ? "scaleX(1.4)"
                    : "scaleX(1)",
                opacity: isClicked ? 0 : isHovered ? 1 : 0.65,
              }}
            />
          </span>
          <span
            aria-hidden="true"
            className="hidden sm:block absolute -right-14 top-1/2 -translate-y-1/2"
          >
            <span
              className="block h-px w-10 bg-[var(--ms-border)] transition-all duration-500"
              style={{
                transform: isClicked
                  ? "scaleX(0) translateX(16px)"
                  : isHovered
                    ? "scaleX(1.4)"
                    : "scaleX(1)",
                opacity: isClicked ? 0 : isHovered ? 1 : 0.65,
              }}
            />
          </span>
        </button>

        {/* Subcopy & direct email */}
        <div
          className="flex flex-col items-center gap-3 text-center transition-all duration-500 delay-75"
          style={{
            opacity: isClicked ? 0 : 1,
            transform: isClicked ? "translateY(16px)" : "translateY(0)",
            pointerEvents: isClicked ? "none" : "auto",
          }}
        >
          <p className="m-0 max-w-md text-sm sm:text-base leading-relaxed text-[var(--ms-muted)]">
            {subcopy}
          </p>
          <a
            href={`mailto:${email}`}
            className="inline-flex min-h-[44px] items-center text-xs font-bold tracking-[0.18em] uppercase text-[var(--ms-text)] underline decoration-[var(--ms-ember)] decoration-2 underline-offset-4 hover:text-[var(--ms-accent-text)]"
            style={{ fontFamily: "var(--ms-font-mono)" }}
          >
            {email}
          </a>
        </div>
      </div>
    </div>
  );
}

export default LetsWorkTogether;
