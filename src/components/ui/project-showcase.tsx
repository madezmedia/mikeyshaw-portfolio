"use client";

import * as React from "react";
import { ArrowLeft, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export type ShowcaseProject = {
  id: string;
  title: string;
  /** Image URL. */
  image: string;
  /** Small category tag. */
  category?: string;
  /** Heading shown above the description in the detail view. */
  tagline?: string;
  description?: React.ReactNode;
  /** Buttons or links shown at the end of the detail view. */
  actions?: React.ReactNode;
};

export type ProjectShowcaseProps = Omit<
  React.ComponentProps<"section">,
  "onChange" | "defaultValue"
> & {
  projects: ShowcaseProject[];
  /** Label above the list. */
  label?: React.ReactNode;
  /** Id of the open project, or null for the list. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  /** Let the floating preview be dragged around on desktop. */
  draggable?: boolean;
};

/**
 * Interactive floating-preview project index & detail reader.
 * Zero extra animation library dependency (native pointer drag + CSS transitions).
 */
function ProjectShowcase({
  projects,
  label = "Production Systems",
  value,
  defaultValue = null,
  onValueChange,
  draggable = true,
  className,
  ...props
}: ProjectShowcaseProps) {
  const areaRef = React.useRef<HTMLElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const [inner, setInner] = React.useState<string | null>(defaultValue);
  const openId = value !== undefined ? value : inner;

  const setOpen = React.useCallback(
    (id: string | null) => {
      if (value === undefined) setInner(id);
      onValueChange?.(id);
      if (id) {
        trackEvent("project_showcase_open", { project_id: id });
      }
    },
    [value, onValueChange]
  );

  const [hover, setHover] = React.useState(0);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const dragRef = React.useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const openIndex = projects.findIndex((p) => p.id === openId);
  const open = openIndex >= 0 ? projects[openIndex] : null;
  const shown = projects[open ? openIndex : hover] ?? projects[0];

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const area = areaRef.current;
    const card = previewRef.current;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    let nx = dragRef.current.origX + dx;
    let ny = dragRef.current.origY + dy;

    if (area && card) {
      const maxX = Math.max(0, area.clientWidth - card.clientWidth - 48);
      const maxY = Math.max(0, area.clientHeight - card.clientHeight - 48);
      nx = Math.max(-24, Math.min(maxX, nx));
      ny = Math.max(-24, Math.min(maxY, ny));
    }
    setOffset({ x: nx, y: ny });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer already released
    }
  };

  if (!shown) return null;

  return (
    <section
      ref={areaRef}
      data-slot="project-showcase"
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--ms-r-card)] border border-[var(--ms-border)] bg-[var(--ms-ground)] text-[var(--ms-text)]",
        open ? "min-h-[540px]" : "min-h-[500px] lg:h-[580px]",
        className
      )}
      {...props}
    >
      {!open ? (
        <div className="relative flex size-full flex-col justify-between gap-8 p-6 sm:p-8 lg:block lg:min-h-[580px]">
          {/* Floating / Draggable Preview Frame */}
          <div
            ref={previewRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
            }}
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-2xl border border-[var(--ms-border)] bg-[var(--ms-surface)] shadow-xl transition-shadow lg:absolute lg:top-[8%] lg:left-[5%] lg:w-[min(25rem,46%)]",
              draggable && "lg:cursor-grab lg:active:cursor-grabbing select-none"
            )}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-[var(--ms-inverse-bg)]">
              <img
                key={shown.id}
                src={shown.image}
                alt={shown.title}
                draggable={false}
                className="size-full object-cover transition-opacity duration-300"
              />
              {shown.category && (
                <span className="absolute top-3 left-3 rounded-full bg-[#120E24]/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  {shown.category}
                </span>
              )}
              {draggable && (
                <span
                  aria-hidden="true"
                  className="hidden lg:inline-flex items-center gap-1 absolute bottom-2.5 right-2.5 rounded-full bg-[#120E24]/85 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#C4BDE6] backdrop-blur-sm"
                >
                  <GripHorizontal className="size-3 text-[#FF6A2B]" />
                  Drag
                </span>
              )}
            </div>
            {shown.tagline && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--ms-border)]">
                <span className="truncate text-xs font-bold text-[var(--ms-text)]">
                  {shown.tagline}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(shown.id)}
                  className="shrink-0 cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ms-accent-text)] underline underline-offset-4"
                >
                  Inspect →
                </button>
              </div>
            )}
          </div>

          {/* Right-Anchored Editorial Project List */}
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 lg:absolute lg:right-[6%] lg:bottom-[10%] lg:w-[44%]">
            <li
              aria-hidden="true"
              className="mb-2 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]"
            >
              <span>{label}</span>
              <span className="h-px flex-1 bg-[var(--ms-border)]" />
            </li>
            {projects.map((p, i) => {
              const isActive = hover === i;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onPointerEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onClick={() => setOpen(p.id)}
                    className={cn(
                      "group relative flex min-h-[44px] w-fit cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left text-2xl font-black tracking-tight text-[var(--ms-text)] outline-none transition-all duration-200 sm:text-3xl lg:text-4xl",
                      "focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4",
                      isActive ? "opacity-100 translate-x-1" : "opacity-45 hover:opacity-80"
                    )}
                    style={{ fontFamily: "var(--ms-font-head)" }}
                  >
                    <span>{p.title}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 rounded-full bg-[var(--ms-ember)] transition-all duration-200",
                        isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        /* Expanded Editorial Detail View */
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10">
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="inline-flex min-h-[44px] w-fit cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[var(--ms-muted)] transition-colors hover:text-[var(--ms-text)]"
          >
            <ArrowLeft className="size-4 text-[var(--ms-accent-text)]" aria-hidden="true" />
            All systems
          </button>

          <div className="space-y-2">
            {open.category && (
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
                {open.category}
              </span>
            )}
            <h3
              className="m-0 text-3xl font-black leading-none tracking-tight text-[var(--ms-text)] sm:text-5xl"
              style={{ fontFamily: "var(--ms-font-head)" }}
            >
              {open.title}
            </h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--ms-border)] bg-[var(--ms-surface)]">
            <img
              src={open.image}
              alt={open.title}
              className="aspect-video w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            {open.tagline && (
              <div className="flex items-center gap-4">
                <h4
                  className="m-0 text-xl font-black tracking-tight text-[var(--ms-text)] sm:text-2xl"
                  style={{ fontFamily: "var(--ms-font-head)" }}
                >
                  {open.tagline}
                </h4>
                <span
                  aria-hidden="true"
                  className="h-0.5 flex-1 rounded-full bg-[var(--ms-ember)]"
                />
              </div>
            )}

            {open.description && (
              <div className="flex flex-col gap-3 text-sm leading-relaxed text-[var(--ms-muted)] sm:text-base">
                {open.description}
              </div>
            )}

            {open.actions && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {open.actions}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export { ProjectShowcase };
export default ProjectShowcase;
