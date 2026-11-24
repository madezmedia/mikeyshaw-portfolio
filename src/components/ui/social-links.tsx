"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SocialLinkItem {
  name: string;
  href?: string;
  image?: string;
  tag?: string;
}

export interface SocialLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  socials: SocialLinkItem[];
}

/**
 * Hover-reveal social row implemented with CSS transitions (no framer-motion required).
 */
export function SocialLinks({
  socials,
  className,
  ...props
}: SocialLinksProps) {
  const [hoveredSocial, setHoveredSocial] = React.useState<string | null>(null);
  const [rotation, setRotation] = React.useState<number>(0);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1 sm:gap-2",
        className
      )}
      {...props}
    >
      {socials.map((social) => {
        const isHovered = hoveredSocial === social.name;
        const isDimmed = hoveredSocial !== null && !isHovered;
        const isExternal = social.href && !social.href.startsWith("mailto:");
        const Tag = social.href ? "a" : "div";

        return (
          <Tag
            key={social.name}
            {...(social.href
              ? {
                  href: social.href,
                  target: isExternal ? "_blank" : undefined,
                  rel: isExternal ? "noopener noreferrer" : undefined,
                }
              : {})}
            className={cn(
              "relative inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 py-2 text-[var(--ms-text)] no-underline transition-opacity duration-200 cursor-pointer",
              isDimmed ? "opacity-45" : "opacity-100"
            )}
            onMouseEnter={() => {
              setHoveredSocial(social.name);
              setRotation(((social.name.length * 7) % 14) - 7);
            }}
            onMouseLeave={() => setHoveredSocial(null)}
            onFocus={() => setHoveredSocial(social.name)}
            onBlur={() => setHoveredSocial(null)}
          >
            <span className="block text-base font-bold tracking-tight sm:text-lg">
              {social.name}
            </span>

            {social.image ? (
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 transition-all duration-200 ease-out",
                  isHovered
                    ? "opacity-100 -translate-y-2 scale-100"
                    : "opacity-0 translate-y-2 scale-90"
                )}
                style={{
                  transform: isHovered
                    ? `translate(-50%, -8px) rotate(${rotation}deg)`
                    : "translate(-50%, 6px) rotate(0deg)",
                }}
              >
                <img
                  src={social.image}
                  alt=""
                  className="size-12 rounded-xl border border-[var(--ms-border)] bg-[var(--ms-ground)] object-contain p-1.5 shadow-lg"
                />
              </span>
            ) : social.tag ? (
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--ms-ember)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ms-ink)] shadow transition-all duration-200",
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1"
                )}
                style={{ fontFamily: "var(--ms-font-mono)" }}
              >
                {social.tag}
              </span>
            ) : null}
          </Tag>
        );
      })}
    </div>
  );
}

export default SocialLinks;
