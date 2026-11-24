"use client";

import React, {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent, SVGProps } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/* --------------------------------------------------------------------------
 * MikeyEditorialHero
 * Brand Kit v3 + Color Theory + Impeccable adaptation of the Elias editorial
 * hero architecture:
 * - Monumental MIKEY (Ember) / SHAW (Ink/White) display type behind a true
 *   alpha-matte HD portrait cutout (/images/mikey-shaw-cutout.png)
 * - Calibrated Kit v3 Violet-Ink-Ember circular printer's-proof spotlight
 *   (outlined type + duotone portrait under cursor)
 * - Gentle living-portrait breath & ambient rim shimmer (zero-video LCP,
 *   plus optional videoSrc slot if a MiniMax/Hailuo loop is added later)
 * - Interactive 3D Systems Folio (LogMem, Mad EZ Voice, Agent Fleet)
 * - Live self-typing Who / Now / Log shift dispatch sheet with LOGGED stamp
 * - Zero extra animation dependencies (60fps rAF damped springs), full Light
 *   & Dark theme native, full prefers-reduced-motion compliance.
 * -------------------------------------------------------------------------- */

export interface HeroSystemFolio {
  label: string;
  title: string;
  coverLines: string[];
  topics: string[];
  art: "keys" | "voice" | "fleet";
  colors: { cover: string; type: string; spine: string; spineText: string };
  chapter: string;
  chapterTitle: string;
  text: string;
  href: string;
}

export interface HeroShiftEntry {
  key: "who" | "now" | "log";
  heading: string;
  body: string;
}

export interface MikeyEditorialHeroProps {
  portraitSrc?: string;
  portraitAlt?: string;
  videoSrc?: string;
  className?: string;
}

const SYSTEMS: HeroSystemFolio[] = [
  {
    label: "Open-Source Protocol",
    title: "LogMem",
    coverLines: ["LOG", "MEM"],
    topics: ["Redis", "MCP", "MIT"],
    art: "keys",
    colors: {
      cover: "#1E1640",
      type: "#FFFFFF",
      spine: "#FF6A2B",
      spineText: "#120E24",
    },
    chapter: "Three Keys",
    chapterTitle: "Who, Now, Log",
    text: "MIT-licensed, Redis-native shared memory so teams of AI agents pick up cleanly without starting from zero.",
    href: "https://logmem.si",
  },
  {
    label: "Live Voice AI",
    title: "Mad EZ Voice",
    coverLines: ["MAD EZ", "VOICE"],
    topics: ["24/7", "Trades", "Dispatch"],
    art: "voice",
    colors: {
      cover: "#FFC93C",
      type: "#120E24",
      spine: "#FF6A2B",
      spineText: "#120E24",
    },
    chapter: "Production Ops",
    chapterTitle: "Zero Missed Calls",
    text: "24/7 AI receptionist and emergency triage for Charlotte trades with repeat-caller memory and direct booking.",
    href: "https://madezmedia.com",
  },
  {
    label: "Coordinated Ops",
    title: "Agent Fleet",
    coverLines: ["AGENT", "FLEET"],
    topics: ["20+ Agents", "Approval Gates"],
    art: "fleet",
    colors: {
      cover: "#F3F0FC",
      type: "#120E24",
      spine: "#9B6BFF",
      spineText: "#120E24",
    },
    chapter: "Governance",
    chapterTitle: "Audit Every Run",
    text: "Dedicated roles, shared handoff queues, and explicit human sign-off on anything that sends, spends, or deletes.",
    href: "/fleet",
  },
];

const SHIFT_ENTRIES: HeroShiftEntry[] = [
  {
    key: "who",
    heading: "who · durable context",
    body: "Client stack, rules, and preferences stay put across every tool and shift.",
  },
  {
    key: "now",
    heading: "now · active state",
    body: "Open jobs, blocked approvals, and next actions stay live in one shared view.",
  },
  {
    key: "log",
    heading: "log · append-only audit",
    body: "Every step recorded in order so any engineer or agent can verify what shipped.",
  },
];

const HERO_SOCIALS = [
  { label: "GitHub", href: "https://github.com/madezmedia" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/michael-shaw-clt/" },
  { label: "X", href: "https://x.com/madezmedia" },
  { label: "LogMem", href: "https://logmem.si" },
];

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

/* Built-in geometric Brand Kit v3 cover illustrations (no third-party logos) */
function CoverArtKeys(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 139" preserveAspectRatio="xMidYMid slice" aria-hidden="true" {...props}>
      <rect width="100" height="139" fill="#1E1640" />
      <circle cx="82" cy="24" r="32" fill="#2B205B" />
      <rect x="12" y="76" width="76" height="10" rx="5" fill="#FF6A2B" opacity="0.92" />
      <rect x="12" y="92" width="58" height="10" rx="5" fill="#1FB6FF" opacity="0.9" />
      <rect x="12" y="108" width="68" height="10" rx="5" fill="#9B6BFF" opacity="0.9" />
    </svg>
  );
}

function CoverArtVoice(props: SVGProps<SVGSVGElement>) {
  const bars = [18, 34, 48, 28, 56, 40, 22, 44, 30, 16];
  return (
    <svg viewBox="0 0 100 139" preserveAspectRatio="xMidYMid slice" aria-hidden="true" {...props}>
      <rect width="100" height="139" fill="#FFC93C" />
      <circle cx="50" cy="96" r="42" fill="#FFD666" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={13 + i * 8}
          y={114 - h * 0.72}
          width="4.6"
          height={h * 0.72}
          rx="2.3"
          fill={i === 4 ? "#FF6A2B" : "#120E24"}
          opacity={i === 4 ? 1 : 0.85}
        />
      ))}
    </svg>
  );
}

function CoverArtFleet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 139" preserveAspectRatio="xMidYMid slice" aria-hidden="true" {...props}>
      <rect width="100" height="139" fill="#F3F0FC" />
      <g stroke="#DDD6F3" strokeWidth="1.5">
        <line x1="22" y1="84" x2="50" y2="96" />
        <line x1="78" y1="82" x2="50" y2="96" />
        <line x1="50" y1="96" x2="34" y2="118" />
        <line x1="50" y1="96" x2="72" y2="116" />
      </g>
      <circle cx="50" cy="96" r="8" fill="#FF6A2B" />
      <circle cx="22" cy="84" r="5.5" fill="#120E24" />
      <circle cx="78" cy="82" r="5.5" fill="#1FB6FF" />
      <circle cx="34" cy="118" r="5.5" fill="#9B6BFF" />
      <circle cx="72" cy="116" r="5.5" fill="#120E24" />
    </svg>
  );
}

const COVER_ARTS = {
  keys: CoverArtKeys,
  voice: CoverArtVoice,
  fleet: CoverArtFleet,
};

/**
 * Calibrated Brand Kit v3 SVG filters:
 * - ms-ink-duotone: maps portrait luminance from Ink (#120E24) -> Deep Violet (#2E225C) -> Ember (#FF6A2B) -> Lavender Mist (#F3F0FC)
 * - ms-ink-outline: draws a razor-clean 2px outline from letter silhouettes without overlapping inner strokes
 */
function KitInkFilters({ uid }: { uid: string }) {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute pointer-events-none">
      <filter id={`${uid}-duotone`} colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.071 0.180 1.000 0.953" />
          <feFuncG type="table" tableValues="0.055 0.133 0.416 0.941" />
          <feFuncB type="table" tableValues="0.141 0.361 0.169 0.988" />
        </feComponentTransfer>
      </filter>
      <filter id={`${uid}-outline`}>
        <feMorphology in="SourceAlpha" operator="erode" radius="2" result="inside" />
        <feComposite in="SourceGraphic" in2="inside" operator="out" />
      </filter>
    </svg>
  );
}

/* Elias-inspired Ink-Flood Pill Button tokenized in Brand Kit v3 */
function InkFloodButton({
  label,
  href,
  icon = "right",
  onClick,
}: {
  label: string;
  href: string;
  icon?: "right" | "up-right";
  onClick?: () => void;
}) {
  const Arrow = icon === "up-right" ? ArrowUpRight : ArrowRight;
  return (
    <a
      href={href}
      onClick={onClick}
      className={`meh-cta ${icon === "up-right" ? "meh-cta-diag" : ""}`}
    >
      <span className="meh-cta-label">{label}</span>
      <span aria-hidden="true" className="meh-cta-mark">
        <Arrow className="meh-cta-arrow meh-cta-arrow-out" strokeWidth={2.2} />
        <Arrow className="meh-cta-arrow meh-cta-arrow-in" strokeWidth={2.2} />
      </span>
    </a>
  );
}

/* Upper-right interactive 3D Systems Hardcover Folio */
function SystemsFolioCard({
  onScreen,
  reduced,
}: {
  onScreen: boolean;
  reduced: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ rx: 6, ry: -24 });
  const swapRef = useRef<number | null>(null);

  const item = SYSTEMS[index];
  const CoverArt = COVER_ARTS[item.art];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    return () => {
      if (swapRef.current) window.clearTimeout(swapRef.current);
    };
  }, []);

  useEffect(() => {
    if (hovered || open || reduced || !onScreen) return;
    const t = window.setTimeout(() => {
      setIndex((c) => (c + 1) % SYSTEMS.length);
    }, 4200);
    return () => window.clearTimeout(t);
  }, [hovered, open, reduced, onScreen, index]);

  const handleToggle = () => {
    if (!open) {
      setOpen(true);
      trackEvent("hero_folio_open", { system: item.title });
      return;
    }
    setOpen(false);
    swapRef.current = window.setTimeout(
      () => setIndex((c) => (c + 1) % SYSTEMS.length),
      reduced ? 0 : 480
    );
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    if (open) {
      setTilt({ rx: -ny * 2, ry: nx * 3 });
    } else {
      setTilt({ rx: 6 - ny * 7, ry: -24 + nx * 14 });
    }
  };

  const coverDeg = open ? -174 : hovered && !reduced ? -30 : 0;
  const bookTransform = open
    ? `translateX(50%) scale(1.16) rotateY(${tilt.ry}deg) rotateX(${tilt.rx}deg)`
    : `rotateY(${tilt.ry}deg) rotateX(${tilt.rx}deg)`;

  return (
    <figure className="meh-book">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${open ? "Close and show next system" : "Open overview for"} ${item.title}`}
        className="meh-book-frame"
        onPointerEnter={() => setHovered(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          setHovered(false);
          setTilt({ rx: 6, ry: -24 });
        }}
        onClick={handleToggle}
      >
        <span aria-hidden="true" className="meh-book-stage">
          <span
            className="meh-book-shadow"
            style={{ transform: open ? "scaleX(1.9)" : "scaleX(1)" }}
          />
          <span
            key={item.title}
            className="meh-book-3d"
            style={
              {
                transform: bookTransform,
                "--meh-cover": item.colors.cover,
                "--meh-cover-type": item.colors.type,
                "--meh-spine": item.colors.spine,
                "--meh-spine-text": item.colors.spineText,
              } as React.CSSProperties
            }
          >
            <span className="meh-book-back" />
            <span className="meh-book-edge" />
            <span className="meh-book-spine">
              <span>{item.title}</span>
            </span>
            <span className="meh-book-page">
              <span className="meh-book-page-text">{item.text}</span>
              <span className="meh-book-folio">0{index + 1}</span>
            </span>
            <span className="meh-book-hinge">
              <span
                className="meh-book-cover"
                style={{ transform: `rotateY(${coverDeg}deg)` }}
              >
                <span className="meh-book-cover-front">
                  <CoverArt className="meh-book-art" />
                  <span className="meh-book-title">
                    {item.coverLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                  <span className="meh-book-byline">MIKEY SHAW</span>
                </span>
                <span className="meh-book-cover-inside">
                  <span className="meh-book-page-chapter">{item.chapter}</span>
                  <span className="meh-book-inside-title">{item.chapterTitle}</span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </button>

      <figcaption className="meh-book-caption">
        <span className="meh-book-label">{item.label}</span>
        <span className="meh-book-topics">
          {item.topics.map((topic, i) => (
            <Fragment key={topic}>
              {i > 0 && (
                <span aria-hidden="true" className="meh-sep">
                  {" / "}
                </span>
              )}
              {topic}
            </Fragment>
          ))}
        </span>
        <a
          href={item.href}
          target={item.href.startsWith("http") ? "_blank" : undefined}
          rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={`Open ${item.title}`}
          className="meh-book-arrow"
          onClick={() => trackEvent("hero_folio_link_click", { system: item.title })}
        >
          <span className="meh-cta-mark meh-cta-diag">
            <ArrowUpRight aria-hidden="true" className="meh-cta-arrow meh-cta-arrow-out" strokeWidth={2.2} />
            <ArrowUpRight aria-hidden="true" className="meh-cta-arrow meh-cta-arrow-in" strokeWidth={2.2} />
          </span>
        </a>
      </figcaption>
    </figure>
  );
}

/* Lower-right live self-typing Who / Now / Log shift dispatch card */
function LiveShiftSheet({
  onScreen,
  reduced,
}: {
  onScreen: boolean;
  reduced: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [stamped, setStamped] = useState(false);

  const entry = SHIFT_ENTRIES[index];
  const shown = reduced ? entry.body : entry.body.slice(0, typed);
  const finished = shown.length === entry.body.length;

  useEffect(() => {
    if (reduced || !onScreen) return;
    if (typed < entry.body.length) {
      const prev = entry.body[typed - 1] ?? "";
      const delay = /[,.]/.test(prev) ? 260 : 42;
      const t = window.setTimeout(() => setTyped((c) => c + 1), delay);
      return () => window.clearTimeout(t);
    }
    if (!stamped) {
      const t = window.setTimeout(() => setStamped(true), 650);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setStamped(false);
      setTyped(0);
      setIndex((c) => (c + 1) % SHIFT_ENTRIES.length);
    }, 2600);
    return () => window.clearTimeout(t);
  }, [reduced, onScreen, typed, stamped, entry.body]);

  return (
    <aside aria-label="LogMem shared memory pattern" className="meh-pad">
      <div className="meh-sheet">
        <div className="meh-sheet-top">
          <span className="meh-sheet-eyebrow">logmem.si · space/mikey</span>
          <span
            className={`meh-stamp ${finished ? "is-ready" : ""} ${stamped ? "is-pressed" : ""}`}
            aria-hidden="true"
          >
            LOGGED
          </span>
        </div>

        <p className={`meh-sheet-key meh-sheet-key--${entry.key}`}>{entry.heading}</p>
        <p className="meh-sheet-body">
          {shown}
          {!reduced && !finished && <span className="meh-caret" aria-hidden="true" />}
        </p>

        <div className="meh-sheet-meta">
          <span>
            Key 0{index + 1} / 0{SHIFT_ENTRIES.length}
          </span>
          <span className="meh-sheet-live">
            <i aria-hidden="true" />
            shared memory
          </span>
        </div>
      </div>
    </aside>
  );
}

export function MikeyEditorialHero({
  portraitSrc = "/images/mikey-shaw-cutout.png",
  portraitAlt = "Mikey Shaw, Fractional CTO and AI Systems Architect",
  videoSrc,
  className = "",
}: MikeyEditorialHeroProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [spotEnabled, setSpotEnabled] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Target & current damped spring values updated directly on CSS vars (zero React re-renders!)
  const springRef = useRef({
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    sx: 0,
    sy: 0,
    csx: 0,
    csy: 0,
    sr: 0,
    csr: 0,
    active: false,
    raf: 0,
  });

  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const wide = window.matchMedia("(min-width: 1024px)");
    const sync = () => setSpotEnabled(!reduced && fine.matches && wide.matches);
    sync();
    fine.addEventListener?.("change", sync);
    wide.addEventListener?.("change", sync);
    return () => {
      fine.removeEventListener?.("change", sync);
      wide.removeEventListener?.("change", sync);
    };
  }, [reduced]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let vis = true;
    const sync = () => setOnScreen(vis && !document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      vis = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const tickSpring = useCallback(() => {
    const s = springRef.current;
    const canvas = canvasRef.current;
    if (!canvas) {
      s.raf = 0;
      return;
    }

    s.cx += (s.tx - s.cx) * 0.08;
    s.cy += (s.ty - s.cy) * 0.08;
    s.csx += (s.sx - s.csx) * 0.22;
    s.csy += (s.sy - s.csy) * 0.22;
    s.csr += (s.sr - s.csr) * 0.16;

    canvas.style.setProperty("--meh-px", `${s.cx.toFixed(3)}`);
    canvas.style.setProperty("--meh-py", `${s.cy.toFixed(3)}`);
    canvas.style.setProperty("--meh-spot-x", `${s.csx.toFixed(1)}px`);
    canvas.style.setProperty("--meh-spot-y", `${s.csy.toFixed(1)}px`);
    canvas.style.setProperty("--meh-spot-r", `${s.csr.toFixed(1)}px`);

    const settled =
      Math.abs(s.tx - s.cx) < 0.002 &&
      Math.abs(s.ty - s.cy) < 0.002 &&
      Math.abs(s.sx - s.csx) < 0.3 &&
      Math.abs(s.sy - s.csy) < 0.3 &&
      Math.abs(s.sr - s.csr) < 0.3;

    if (!settled) {
      s.raf = window.requestAnimationFrame(tickSpring);
    } else {
      s.raf = 0;
    }
  }, []);

  useEffect(() => {
    const s = springRef.current;
    return () => {
      if (s.raf) window.cancelAnimationFrame(s.raf);
    };
  }, []);

  const ensureTick = () => {
    if (!springRef.current.raf) {
      springRef.current.raf = window.requestAnimationFrame(tickSpring);
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!spotEnabled || !canvasRef.current) return;
    const s = springRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    s.tx = (e.clientX / window.innerWidth) * 2 - 1;
    s.ty = (e.clientY / window.innerHeight) * 2 - 1;

    if (!s.active) {
      s.active = true;
      if (s.csr < 1) {
        s.csx = x;
        s.csy = y;
      }
    }
    s.sx = x;
    s.sy = y;
    s.sr = 148;
    ensureTick();
  };

  const handlePointerLeave = () => {
    const s = springRef.current;
    s.tx = 0;
    s.ty = 0;
    s.sr = 0;
    s.active = false;
    ensureTick();
  };

  const firstLetters = [..."MIKEY"];
  const lastLetters = [..."SHAW"];

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Mikey Shaw, Fractional CTO and AI Systems Architect"
      className={`meh-hero ${entered ? "is-in" : ""} ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--meh-filter-duotone": `url(#${uid}-duotone)`,
          "--meh-filter-outline": `url(#${uid}-outline)`,
        } as React.CSSProperties
      }
    >
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />
      <KitInkFilters uid={uid} />

      <div className="meh-wrap meh-stage">
        <div ref={canvasRef} className="meh-canvas">
          {/* Monumental Two-Line Name + HD Alpha-Matte Portrait Sculpture */}
          <div className="meh-figure">
            {/* Ambient studio violet/ember halo behind portrait */}
            <div className="meh-aura" aria-hidden="true" />

            {/* Base Name Layer */}
            <div className="meh-layer meh-layer-name meh-layer-base">
              <h1 className="meh-name">
                <span className="sr-only">Mikey Shaw</span>
                <span className="meh-name-first" aria-hidden="true">
                  {firstLetters.map((ch, i) => (
                    <span key={i} className="meh-lmask">
                      <span
                        className="meh-lchar meh-from-below"
                        style={{ "--d": `${i * 55}ms` } as React.CSSProperties}
                      >
                        {ch}
                      </span>
                    </span>
                  ))}
                </span>
                <span className="meh-name-last" aria-hidden="true">
                  {lastLetters.map((ch, i) => (
                    <span key={i} className="meh-lmask">
                      <span
                        className="meh-lchar meh-from-above"
                        style={
                          {
                            "--d": `${180 + (lastLetters.length - 1 - i) * 60}ms`,
                          } as React.CSSProperties
                        }
                      >
                        {ch}
                      </span>
                    </span>
                  ))}
                </span>
              </h1>
            </div>

            {/* Proof Spotlight Outlined Name Twin */}
            {spotEnabled && (
              <div aria-hidden="true" className="meh-layer meh-layer-name meh-layer-ink">
                <div className="meh-name">
                  <span className="meh-name-first meh-ink-first">MIKEY</span>
                  <span className="meh-name-last meh-ink-last">SHAW</span>
                </div>
              </div>
            )}

            {/* Base Portrait Cutout (with subtle living-portrait micro-breath) */}
            <div className="meh-layer meh-layer-portrait meh-layer-base">
              {videoSrc && !reduced ? (
                <video
                  src={videoSrc}
                  poster="/images/mikey-shaw-studio.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="meh-portrait meh-portrait-video"
                />
              ) : (
                <img
                  src={portraitSrc}
                  alt={portraitAlt}
                  width={704}
                  height={1128}
                  decoding="async"
                  className="meh-portrait"
                />
              )}
            </div>

            {/* Proof Spotlight Duotone Portrait Twin */}
            {spotEnabled && !videoSrc && (
              <div aria-hidden="true" className="meh-layer meh-layer-portrait meh-layer-ink">
                <img
                  src={portraitSrc}
                  alt=""
                  width={704}
                  height={1128}
                  decoding="async"
                  className="meh-portrait meh-ink-portrait"
                />
              </div>
            )}
          </div>

          {/* Left-Edge Executive Intro + Ink-Flood CTA */}
          <div className="meh-intro">
            <p className="meh-intro-roles">
              <span>Fractional CTO</span>
              <span aria-hidden="true" className="meh-sep">/</span>
              <span>Head of AI</span>
              <span aria-hidden="true" className="meh-sep">/</span>
              <span>Charlotte, NC</span>
            </p>

            <p className="meh-intro-headline">
              <span className="block">Your AI agents</span>
              <span className="block">should not start</span>
              <span className="block">
                <em className="meh-intro-em">from zero.</em>
              </span>
            </p>

            <hr className="meh-intro-rule" />

            <p className="meh-intro-desc">
              Operator first, technologist second. I build multi-agent systems that answer, book, follow up, and remember on shared memory in LogMem.
            </p>

            <div className="meh-intro-actions">
              <InkFloodButton
                label="Book discovery call"
                href="#book-call"
                icon="right"
                onClick={() => trackEvent("hero_primary_cta_click", { target: "book_call" })}
              />
              <a
                href="/fractional"
                className="meh-text-link"
                onClick={() => trackEvent("hero_secondary_cta_click", { target: "fractional" })}
              >
                Engagement models →
              </a>
            </div>
          </div>

          {/* Upper-Right Interactive 3D Production Systems Folio */}
          <SystemsFolioCard onScreen={onScreen} reduced={reduced} />

          {/* Lower-Right Live LogMem Shift Sheet */}
          <LiveShiftSheet onScreen={onScreen} reduced={reduced} />

          {/* Bottom-Left Social Links */}
          <ul aria-label="Social links" className="meh-socials">
            {HERO_SOCIALS.map((s, idx) => (
              <Fragment key={s.label}>
                {idx > 0 && (
                  <li aria-hidden="true" className="meh-sep">
                    /
                  </li>
                )}
                <li>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meh-slink"
                    onClick={() => trackEvent("social_profile_click", { platform: s.label })}
                  >
                    {s.label}
                  </a>
                </li>
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default MikeyEditorialHero;

const HERO_CSS = `
.meh-hero {
  --meh-page: var(--ms-ground, #FFFFFF);
  --meh-paper: var(--ms-surface, #F3F0FC);
  --meh-ink: var(--ms-text, #120E24);
  --meh-muted: var(--ms-muted, #5A5278);
  --meh-border: var(--ms-border, #DDD6F3);
  --meh-ember: #FF6A2B;
  --meh-accent-text: var(--ms-accent-text, #B2410E);
  --meh-sheet-bg: #FAF8FF;
  --meh-sheet-shadow: 0 18px 40px -20px rgba(18, 14, 36, 0.28);
  --meh-gutter: 16px;
  --meh-w: min(100cqw - 2 * var(--meh-gutter), 1400px);

  position: relative;
  width: 100%;
  container-type: inline-size;
  background: var(--meh-page);
  color: var(--meh-ink);
  padding-top: 76px;
  overflow: clip;
  border-bottom: 1px solid var(--meh-border);
}

:root[data-theme="dark"] .meh-hero,
.dark .meh-hero {
  --meh-sheet-bg: #15102B;
  --meh-sheet-shadow: 0 22px 46px -18px rgba(0, 0, 0, 0.6);
}

@media (min-width: 640px) {
  .meh-hero { --meh-gutter: 24px; }
}
@media (min-width: 1024px) {
  .meh-hero { --meh-gutter: 40px; }
}

.meh-wrap {
  width: var(--meh-w);
  margin-inline: auto;
}

.meh-stage {
  padding-block: 16px 40px;
}

.meh-canvas {
  --meh-px: 0;
  --meh-py: 0;
  --meh-spot-x: 0px;
  --meh-spot-y: 0px;
  --meh-spot-r: 0px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "figure"
    "intro"
    "book"
    "pad"
    "socials";
  row-gap: 32px;
}

.meh-figure {
  grid-area: figure;
  position: relative;
  container-type: inline-size;
  overflow: hidden;
  border-radius: 16px;
}

/* Soft studio violet backdrop card on mobile/tablet so portrait stands cleanly */
.meh-figure::after {
  content: "";
  display: block;
  width: 68cqw;
  height: 68cqw;
  margin: 4cqw 0 0 auto;
  border-radius: 16px 16px 0 0;
  background: radial-gradient(circle at 60% 28%, #2C215A 0%, #120E24 78%);
  border: 1px solid var(--meh-border);
  border-bottom: 0;
}

.meh-aura {
  display: none;
}

.meh-layer {
  display: contents;
}

.meh-name {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0;
  font-family: var(--ms-font-head);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.84;
  letter-spacing: -0.02em;
}

.meh-lmask {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
}

.meh-lchar {
  display: inline-block;
  transition: transform 0.95s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--d, 0ms);
}

.meh-from-below { transform: translateY(104%); }
.meh-from-above { transform: translateY(-104%); }
.meh-hero.is-in .meh-lchar { transform: translateY(0%); }

.meh-name-first {
  font-size: 24.5cqw;
  color: var(--meh-ember);
  margin-left: -0.025em;
}

.meh-name-last {
  align-self: flex-end;
  font-size: 21cqw;
  color: var(--meh-ink);
  margin-right: -0.02em;
}

.meh-portrait {
  position: absolute;
  z-index: 2;
  top: 10cqw;
  left: 2cqw;
  height: calc(100% - 10cqw);
  width: auto;
  max-width: none;
  object-fit: contain;
  transform-origin: bottom center;
  filter: drop-shadow(0 20px 30px rgba(18, 14, 36, 0.28));
  clip-path: inset(100% 0% 0% 0%);
  transform: scale(1.04);
  transition: clip-path 1.15s cubic-bezier(0.16, 1, 0.3, 1) 0.18s, transform 1.15s cubic-bezier(0.16, 1, 0.3, 1) 0.18s;
}

.meh-hero.is-in .meh-portrait {
  clip-path: inset(0% 0% 0% 0%);
  transform: scale(1);
  animation: meh-breath 9s ease-in-out 1.4s infinite;
}

@keyframes meh-breath {
  0%, 100% { transform: translate3d(calc(var(--meh-px, 0) * 14px), 0, 0) scale(1); }
  50% { transform: translate3d(calc(var(--meh-px, 0) * 14px), -2px, 0) scale(1.012); }
}

.meh-ink-first {
  color: var(--meh-ember);
  filter: var(--meh-filter-outline);
}
.meh-ink-last {
  color: var(--meh-ink);
  filter: var(--meh-filter-outline);
}
.meh-ink-portrait {
  filter: var(--meh-filter-duotone);
}

/* Intro Column */
.meh-intro {
  grid-area: intro;
}

.meh-intro-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55em;
  margin: 0 0 14px;
  font: 700 11px/1.4 var(--ms-font-mono);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--meh-muted);
}

.meh-sep {
  color: var(--meh-accent-text);
}

.meh-intro-headline {
  margin: 0 0 20px;
  font-family: var(--ms-font-head);
  font-weight: 900;
  font-size: clamp(1.75rem, 4.5vw, 2.25rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--meh-ink);
}

.meh-intro-em {
  font-style: italic;
  color: var(--meh-accent-text);
}

.meh-intro-rule {
  width: 56px;
  height: 2px;
  border: 0;
  margin: 0 0 20px;
  background: var(--meh-ember);
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.35s;
}

.meh-hero.is-in .meh-intro-rule {
  transform: scaleX(1);
}

.meh-intro-desc {
  margin: 0 0 22px;
  max-width: 34ch;
  font-size: 15px;
  line-height: 1.6;
  color: var(--meh-muted);
}

.meh-intro-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 18px;
}

/* Ink-Flood Pill CTA */
.meh-cta {
  --meh-mark: 34px;
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-height: 44px;
  padding: 4px 5px 4px 20px;
  overflow: hidden;
  border: 1.5px solid var(--meh-ink);
  border-radius: 999px;
  color: var(--meh-ink);
  text-decoration: none;
  font: 700 12px/1 var(--ms-font-body);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease;
}

.meh-cta::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: 50%;
  right: calc(5px + var(--meh-mark) / 2);
  width: var(--meh-mark);
  height: var(--meh-mark);
  margin: calc(var(--meh-mark) / -2) calc(var(--meh-mark) / -2) 0 0;
  border-radius: 50%;
  background: var(--meh-ink);
  transform: scale(0);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.meh-cta-mark {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--meh-mark);
  height: var(--meh-mark);
  overflow: hidden;
  border-radius: 50%;
  background: var(--meh-ember);
  color: #120E24;
  flex: none;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.meh-cta-arrow {
  position: absolute;
  width: 15px;
  height: 15px;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.meh-cta-arrow-in { transform: translateX(-160%); }
.meh-cta-diag .meh-cta-arrow-in { transform: translate(-160%, 160%); }

@media (hover: hover) {
  .meh-cta:hover {
    color: var(--meh-page);
  }
  .meh-cta:hover::before {
    transform: scale(15);
  }
  .meh-cta:hover .meh-cta-mark {
    transform: scale(1.06);
  }
  .meh-cta:hover .meh-cta-arrow-out { transform: translateX(160%); }
  .meh-cta-diag:hover .meh-cta-arrow-out { transform: translate(160%, -160%); }
  .meh-cta:hover .meh-cta-arrow-in { transform: translate(0, 0); }
}

.meh-text-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--meh-ink);
  text-decoration: underline;
  text-decoration-color: var(--meh-ember);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.meh-text-link:hover { color: var(--meh-accent-text); }

/* 3D Production Systems Folio */
.meh-book {
  grid-area: book;
  margin: 0;
}

.meh-book-frame {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--meh-border);
  border-radius: 14px;
  background: var(--meh-paper);
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  container-type: size;
}

.meh-book-stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  perspective: 900px;
  text-align: left;
}

.meh-book-shadow {
  position: absolute;
  bottom: 9cqh;
  width: 46cqh;
  height: 7cqh;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(18, 14, 36, 0.34), transparent);
  filter: blur(4px);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.meh-book-3d {
  --meh-depth: 9cqh;
  position: relative;
  display: block;
  height: 74cqh;
  aspect-ratio: 0.72;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.meh-book-3d > span { position: absolute; }

.meh-book-back {
  inset: 0;
  border-radius: 2px 5px 5px 2px;
  background: color-mix(in srgb, var(--meh-cover, #120E24) 76%, black);
  transform: translateZ(calc(var(--meh-depth) / -2));
}

.meh-book-edge {
  top: 2%;
  right: 0;
  width: var(--meh-depth);
  height: 96%;
  background: repeating-linear-gradient(to right, #f3f0fc 0 1.5px, #ddd6f3 1.5px 2.5px);
  transform: translateX(50%) rotateY(90deg);
}

.meh-book-spine {
  top: 0;
  left: 0;
  width: var(--meh-depth);
  height: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--meh-spine, #FF6A2B);
  transform: translateX(-50%) rotateY(-90deg);
}

.meh-book-spine > span {
  color: var(--meh-spine-text, #120E24);
  font: 700 3.4cqh/1 var(--ms-font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  transform: rotate(90deg);
}

.meh-book-page {
  inset: 2% 3% 2% 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.5cqh;
  padding: 0 10% 0 14%;
  background: linear-gradient(to right, rgba(18, 14, 36, 0.12), transparent 14%), #FFFFFF;
  transform: translateZ(calc(var(--meh-depth) / 2 - 2px));
}

.meh-book-page-text {
  color: #120E24;
  font-size: 3.7cqh;
  line-height: 1.48;
}

.meh-book-folio {
  position: absolute;
  bottom: 6%;
  left: 0;
  right: 0;
  color: #5A5278;
  font: 700 3cqh/1 var(--ms-font-mono);
  text-align: center;
}

.meh-book-hinge {
  inset: 0;
  transform: translateZ(calc(var(--meh-depth) / 2));
  transform-style: preserve-3d;
}

.meh-book-cover {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  transform-style: preserve-3d;
  transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}

.meh-book-cover-front,
.meh-book-cover-inside {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  backface-visibility: hidden;
}

.meh-book-cover-front {
  justify-content: space-between;
  padding: 11% 10% 9%;
  border-radius: 2px 5px 5px 2px;
  overflow: hidden;
  background: var(--meh-cover, #1E1640);
  color: var(--meh-cover-type, #FFFFFF);
  box-shadow: inset 3px 0 0 rgba(255, 255, 255, 0.22);
}

.meh-book-cover-inside {
  justify-content: center;
  gap: 2.5cqh;
  padding: 0 12%;
  border-radius: 5px 2px 2px 5px;
  background: linear-gradient(to left, rgba(18, 14, 36, 0.12), transparent 14%), #FAF8FF;
  transform: rotateY(180deg);
}

.meh-book-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.meh-book-title {
  position: relative;
  font-family: var(--ms-font-head);
  font-size: 9.2cqh;
  font-weight: 900;
  line-height: 0.94;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.meh-book-byline {
  position: relative;
  font: 700 2.8cqh/1 var(--ms-font-mono);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.meh-book-page-chapter {
  color: #B2410E;
  font: 700 3cqh/1 var(--ms-font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.meh-book-inside-title {
  color: #120E24;
  font-family: var(--ms-font-head);
  font-size: 7.4cqh;
  font-weight: 900;
  line-height: 0.98;
}

.meh-book-caption {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.meh-book-label {
  margin-right: auto;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--meh-ink);
  white-space: nowrap;
}

.meh-book-topics {
  font: 600 11.5px/1 var(--ms-font-mono);
  color: var(--meh-muted);
  white-space: nowrap;
}

.meh-book-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  margin: -8px -8px -8px 0;
}
.meh-book-arrow .meh-cta-mark {
  --meh-mark: 28px;
}
@media (hover: hover) {
  .meh-book:hover .meh-book-arrow .meh-cta-arrow-out { transform: translate(160%, -160%); }
  .meh-book:hover .meh-book-arrow .meh-cta-arrow-in { transform: translate(0, 0); }
}

/* Lower-right live Who / Now / Log Shift Sheet */
.meh-pad {
  grid-area: pad;
}

.meh-sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 210px;
  padding: 22px 22px 18px;
  border-radius: 10px;
  border: 1px solid var(--meh-border);
  background: var(--meh-sheet-bg);
  box-shadow: var(--meh-sheet-shadow);
  transform: rotate(-0.8deg);
}

.meh-sheet-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.meh-sheet-eyebrow {
  font: 700 10.5px/1.3 var(--ms-font-mono);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--meh-muted);
}

.meh-stamp {
  position: absolute;
  top: 14px;
  right: 16px;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border: 2px solid var(--meh-ember);
  border-radius: 50%;
  color: var(--meh-accent-text);
  font: 700 9.5px/1 var(--ms-font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transform: rotate(12deg);
  opacity: 0.3;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s, color 0.25s, opacity 0.3s;
}

.meh-stamp.is-ready { opacity: 0.9; }
.meh-stamp.is-pressed {
  opacity: 1;
  background: var(--meh-ember);
  color: #120E24;
  transform: rotate(0deg) scale(0.88);
}

.meh-sheet-key {
  margin: 18px 0 6px;
  font: 700 13px/1.3 var(--ms-font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.meh-sheet-key--who { color: var(--ms-who-text, #B2410E); }
.meh-sheet-key--now { color: var(--ms-now-text, #0A6A99); }
.meh-sheet-key--log { color: var(--ms-log-text, #6B3FD9); }

.meh-sheet-body {
  margin: 0;
  min-height: 58px;
  padding-right: 54px;
  font: 500 14.5px/1.6 var(--ms-font-mono);
  color: var(--meh-ink);
}

.meh-caret {
  display: inline-block;
  width: 0.55em;
  height: 1.05em;
  margin-left: 2px;
  background: var(--meh-ember);
  vertical-align: -0.15em;
  animation: meh-caret 0.9s steps(2, jump-none) infinite;
}
@keyframes meh-caret { 50% { opacity: 0; } }

.meh-sheet-meta {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--meh-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: 700 10.5px/1 var(--ms-font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--meh-muted);
}

.meh-sheet-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meh-sheet-live i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--meh-ember);
}

/* Socials */
.meh-socials {
  grid-area: socials;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  font: 700 12.5px/1 var(--ms-font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meh-slink {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--meh-ink);
  text-decoration: none;
  position: relative;
}
.meh-slink:hover { color: var(--meh-accent-text); }

@media (min-width: 640px) {
  .meh-canvas {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      "figure figure"
      "intro book"
      "pad pad"
      "socials socials";
    column-gap: 32px;
  }
  .meh-figure::after { height: 52cqw; }
}

/* Wide Desktop Architectural Composition (Elias spatial geometry, Kit v3 proportions) */
@media (min-width: 1024px) {
  .meh-stage {
    position: relative;
    min-height: clamp(660px, calc(100svh - 76px), 840px);
    padding: 0;
  }

  .meh-canvas {
    --meh-u: min(100cqw / 1280, (100cqh - 32px) / 680);
    --meh-top: calc(22 * var(--meh-u));
    --meh-last-top: calc(var(--meh-top) + 216 * var(--meh-u));
    --meh-last-base: calc(var(--meh-top) + 382 * var(--meh-u));
    --meh-portrait-h: min(calc(100cqh - var(--meh-top) - 34 * var(--meh-u)), calc(660 * var(--meh-u)));
    --meh-portrait-left: clamp(290px, calc(50cqw - var(--meh-portrait-h) * 0.31), 540px);

    position: absolute;
    inset: 0;
    display: block;
    container-type: size;
  }

  .meh-figure {
    display: contents;
  }
  .meh-figure::after {
    display: none;
  }

  .meh-aura {
    display: block;
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: calc(var(--meh-portrait-left) - 48 * var(--meh-u));
    width: calc(var(--meh-portrait-h) * 0.78);
    height: calc(var(--meh-portrait-h) * 0.78);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 106, 43, 0.14) 0%, rgba(155, 107, 255, 0.1) 42%, transparent 70%);
    pointer-events: none;
  }

  .meh-layer {
    position: absolute;
    inset: 0;
    display: block;
    pointer-events: none;
  }
  .meh-layer-name { z-index: 0; }
  .meh-layer-portrait { z-index: 2; }

  .meh-layer-base {
    --meh-spot: radial-gradient(
      circle var(--meh-spot-r, 0px) at var(--meh-spot-x, 0px) var(--meh-spot-y, 0px),
      transparent calc(var(--meh-spot-r, 0px) - 1px),
      #000 calc(var(--meh-spot-r, 0px) + 1px)
    );
    mask-image: var(--meh-spot);
    -webkit-mask-image: var(--meh-spot);
  }

  .meh-layer-ink {
    --meh-spot: radial-gradient(
      circle var(--meh-spot-r, 0px) at var(--meh-spot-x, 0px) var(--meh-spot-y, 0px),
      #000 calc(var(--meh-spot-r, 0px) + 1px),
      transparent calc(var(--meh-spot-r, 0px) + 2px)
    );
    mask-image: var(--meh-spot);
    -webkit-mask-image: var(--meh-spot);
  }

  .meh-name {
    position: static;
    display: block;
    line-height: 0.92;
  }

  .meh-name-first,
  .meh-name-last {
    position: absolute;
    white-space: nowrap;
    margin: 0;
  }

  .meh-name-first {
    top: var(--meh-top);
    left: -0.02em;
    font-size: calc(238 * var(--meh-u));
    transform: translate3d(calc(var(--meh-px, 0) * -8px), calc(var(--meh-py, 0) * -4px), 0);
  }

  .meh-name-last {
    top: var(--meh-last-top);
    right: -0.015em;
    font-size: calc(214 * var(--meh-u));
    transform: translate3d(calc(var(--meh-px, 0) * -12px), calc(var(--meh-py, 0) * -5px), 0);
  }

  .meh-portrait {
    top: calc(100% - var(--meh-portrait-h));
    left: var(--meh-portrait-left);
    height: var(--meh-portrait-h);
    transform: translate3d(calc(var(--meh-px, 0) * 14px), 0, 0);
  }

  .meh-intro {
    position: absolute;
    z-index: 4;
    top: calc(var(--meh-last-top) + 18 * var(--meh-u));
    left: 0;
    width: clamp(255px, calc(300 * var(--meh-u)), 330px);
  }

  .meh-intro-headline {
    font-size: clamp(22px, calc(30 * var(--meh-u)), 34px);
    margin-bottom: calc(18 * var(--meh-u));
  }

  .meh-intro-rule {
    margin-bottom: calc(18 * var(--meh-u));
  }

  .meh-intro-desc {
    font-size: clamp(13.5px, calc(14.5 * var(--meh-u)), 15.5px);
    margin-bottom: calc(18 * var(--meh-u));
  }

  .meh-book {
    position: absolute;
    z-index: 4;
    top: calc(var(--meh-top) + 4 * var(--meh-u));
    right: 0;
    width: clamp(290px, calc(348 * var(--meh-u)), 372px);
  }

  .meh-book-frame {
    height: clamp(168px, calc(198 * var(--meh-u)), 214px);
    aspect-ratio: auto;
  }

  .meh-pad {
    position: absolute;
    z-index: 3;
    top: calc(var(--meh-last-base) + 26 * var(--meh-u));
    right: 0;
    width: clamp(300px, calc(390 * var(--meh-u)), 420px);
    bottom: 0;
    display: flex;
  }

  .meh-sheet {
    flex: 1;
    min-height: 0;
    border-radius: 10px 10px 0 0;
    border-bottom: 0;
    transform: rotate(-0.7deg) translateY(4px);
  }

  .meh-socials {
    position: absolute;
    z-index: 4;
    bottom: 14px;
    left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .meh-hero * {
    animation: none !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0ms !important;
  }
  .meh-lchar,
  .meh-intro-rule,
  .meh-portrait {
    transform: none !important;
    clip-path: none !important;
  }
}
`;
