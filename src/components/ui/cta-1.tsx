"use client";

import React, { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

function HoverThumbnail() {
  const ref = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)",
  });

  function handleMouseMove(e: React.MouseEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rx = ((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * -16;
    const ry = ((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 16;
    setStyle({
      transform: `perspective(600px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) scale(1.14)`,
    });
  }

  function handleMouseLeave() {
    setStyle({
      transform: "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)",
    });
  }

  return (
    <span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className="relative -top-1 inline-block size-11 md:size-13 overflow-hidden rounded-xl border-2 border-[var(--ms-ember)] align-middle shadow-md transition-transform duration-200 ease-out cursor-pointer"
    >
      <img
        src="/images/mikey-shaw-studio.jpg"
        alt="Mikey Shaw"
        className="pointer-events-none size-full object-cover"
      />
    </span>
  );
}

export interface CTASection1Props {
  className?: string;
}

export default function CTASection1({ className = "" }: CTASection1Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleaned)) {
      setStatus("error");
      setFeedback("Enter a valid email address so we know where to send the kit.");
      return;
    }

    setStatus("sending");
    setFeedback("");
    trackEvent("newsletter_subscribe_submit", { source: "home_cta_1" });

    try {
      const firstName = cleaned.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim() || "Builder";
      const res = await fetch("/api/starter-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          email: cleaned,
          role: "newsletter-dispatch",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not save your subscription right now.");
      }
      setStatus("sent");
      setFeedback(data.message || "You are on the dispatch list. Your LogMem starter kit is on the way.");
      setEmail("");
      trackEvent("newsletter_subscribe_success", { source: "home_cta_1" });
    } catch (err: unknown) {
      setStatus("error");
      setFeedback(
        err instanceof Error
          ? err.message
          : "Something went wrong. Email michael@madezmedia.com directly."
      );
    }
  }

  return (
    <section
      id="subscribe"
      aria-labelledby="newsletter-cta-heading"
      className={`w-full overflow-hidden border-t border-[var(--ms-border)] bg-[var(--ms-ground)] px-6 py-20 md:py-24 ${className}`}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Headline */}
        <h2
          id="newsletter-cta-heading"
          className="mb-6 text-3xl font-black leading-[1.12] tracking-tight text-[var(--ms-text)] sm:text-5xl lg:text-[3.4rem]"
          style={{ fontFamily: "var(--ms-font-head)" }}
        >
          <span className="mb-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span>Ship real</span>
            <HoverThumbnail />
            <em className="italic text-[var(--ms-accent-text)]">agent systems</em>
          </span>

          <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span>without</span>
            <span aria-hidden="true" className="font-black leading-none text-[var(--ms-ember)]">
              ✱
            </span>
            <span>starting from</span>
            <span className="inline-flex items-center rounded-full border-2 border-[var(--ms-text)] px-4 py-0.5 leading-none text-[var(--ms-text)]">
              zero
            </span>
            <span>.</span>
          </span>
        </h2>

        {/* Subline */}
        <p className="mb-8 max-w-md text-sm leading-relaxed text-[var(--ms-muted)] sm:text-base">
          Get the free LogMem Starter Kit plus one dispatch a month on multi-agent memory, Voice AI, and production ops.
        </p>

        {/* Email form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mb-4 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:items-center"
        >
          <label htmlFor="ms-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="ms-newsletter-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            disabled={status === "sending" || status === "sent"}
            placeholder="you@company.com"
            className="min-h-[48px] flex-1 rounded-full border border-[var(--ms-border)] bg-[var(--ms-surface)] px-5 py-3 text-sm text-[var(--ms-text)] placeholder:text-[var(--ms-muted)] outline-none transition-colors focus:border-[var(--ms-ember)]"
          />

          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            className="ms-btn min-h-[48px] shrink-0 cursor-pointer rounded-full border-0 px-7 disabled:opacity-75"
            style={{ borderRadius: "999px" }}
          >
            {status === "sent" ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Subscribed
              </>
            ) : status === "sending" ? (
              "Sending…"
            ) : (
              <>
                Subscribe
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {feedback && (
          <p
            role={status === "error" ? "alert" : "status"}
            className={`mb-3 text-xs font-semibold ${
              status === "error" ? "text-[#d93a3a]" : "text-[var(--ms-accent-text)]"
            }`}
          >
            {feedback}
          </p>
        )}

        {/* Honest attribution line (zero fabricated subscriber counts) */}
        <p
          className="m-0 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ms-muted)]"
        >
          Written by Mikey Shaw · Charlotte, NC · Unsubscribe anytime
        </p>
      </div>
    </section>
  );
}
