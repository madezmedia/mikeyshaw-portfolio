"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, Bookmark, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export interface BlogArticle {
  category: "Agent Memory" | "AI Systems" | "Automation";
  title: string;
  image: string;
  excerpt: string;
  author: { name: string; initials: string; avatar: string };
  date: string;
  readTime: string;
  href: string;
}

const MIKEY_AUTHOR = {
  name: "Mikey Shaw",
  initials: "MS",
  avatar: "/images/mikey-shaw-studio.jpg",
};

const FEATURED_POST: BlogArticle = {
  category: "Agent Memory",
  title:
    "I Gave My 10 AI Agents a Shared Brain. Here's Why, How, and Whether It Was Worth It.",
  image: "/images/mad_ez_media_mock.png",
  excerpt:
    "For six months, multi-agent coordination was a mess. Here is why Postgres, Notion, and graph frameworks broke down for shared agent memory, and how Redis Sorted Sets solved it.",
  author: MIKEY_AUTHOR,
  date: "Apr 22, 2026",
  readTime: "8 Min Read",
  href: "https://medium.com/@madezmedia/i-gave-my-10-ai-agents-a-shared-brain-heres-why-how-and-whether-it-was-worth-it-943025021e5c",
};

const CATEGORIES = ["All", "Agent Memory", "AI Systems", "Automation"] as const;

const POSTS: BlogArticle[] = [
  {
    category: "Agent Memory",
    title:
      "How We Built a Self-Organizing AI Fleet That Learns From Its Mistakes",
    image: "/images/ez_influencer_360.png",
    excerpt:
      "A deep dive into the memory protocol that evolved into LogMem, synchronizing durable context, live state, and append-only event timelines across independent agent fleets.",
    author: MIKEY_AUTHOR,
    date: "Apr 29, 2026",
    readTime: "6 Min Read",
    href: "https://medium.com/@madezmedia/acmi-protocol-v1-2-how-we-built-a-self-organizing-ai-fleet-that-learns-from-its-mistakes-f76668dc2204",
  },
  {
    category: "AI Systems",
    title: "Unlocking Hidden Insights: How AI Is Changing Operational Data Analytics",
    image: "/images/favor-ai-preview.png",
    excerpt:
      "Turning messy operational logs, call transcripts, and CRM trails into clear daily decisions without drowning founders in dashboards.",
    author: MIKEY_AUTHOR,
    date: "Jun 19, 2024",
    readTime: "5 Min Read",
    href: "https://medium.com/@madezmedia/unlocking-hidden-insights-how-ai-is-revolutionizing-data-analytics-28d111b2b9a1",
  },
  {
    category: "Automation",
    title:
      "Practical Patterns for Automated Social & Content Pipelines With Human Sign-Off",
    image: "/images/folana_episode_251.png",
    excerpt:
      "Connecting LLM drafting, structured webhooks, and review gates so content ships on schedule while a human still owns every published word.",
    author: MIKEY_AUTHOR,
    date: "Dec 26, 2023",
    readTime: "4 Min Read",
    href: "https://medium.com/@madezmedia/best-practices-for-integrating-zapier-and-chatgpt-for-automated-social-media-management-cda59b8a853c",
  },
];

export interface BlogBlockProps {
  featured?: BlogArticle;
  posts?: BlogArticle[];
  className?: string;
}

export function BlogBlock({
  featured = FEATURED_POST,
  posts = POSTS,
  className,
}: BlogBlockProps) {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");

  const visible =
    active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <div className={cn("w-full text-[var(--ms-text)]", className)}>
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span
              className="inline-flex w-fit items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]"
            >
              <Bookmark className="size-3.5" aria-hidden="true" />
              Field Notes &amp; Dispatches
            </span>
            <h2
              className="m-0 text-[clamp(2rem,4.4vw,3.4rem)] font-black leading-[1.04] tracking-tight text-[var(--ms-text)]"
              style={{ fontFamily: "var(--ms-font-head)" }}
            >
              Notes from running real{" "}
              <em className="italic text-[var(--ms-accent-text)]">systems.</em>
            </h2>
            <p className="m-0 max-w-2xl text-base leading-relaxed text-[var(--ms-muted)]">
              Architecture deep dives, shared memory protocols, and honest
              post-mortems from the agent fleets we run in production.
            </p>
          </div>

          <a
            href="https://medium.com/@madezmedia"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("blog_profile_click", { platform: "Medium" })
            }
            className="inline-flex min-h-[44px] items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--ms-text)] underline decoration-[var(--ms-ember)] decoration-2 underline-offset-4 hover:text-[var(--ms-accent-text)]"
          >
            All dispatches on Medium
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>

        {/* Featured Article Split Card */}
        <Card
          className="group mb-10 overflow-hidden border border-[var(--ms-border)] bg-[var(--ms-surface)] p-0 ring-0 md:grid md:grid-cols-2"
          style={{ borderRadius: "var(--ms-r-card)" }}
        >
          <div className="relative aspect-video overflow-hidden bg-[var(--ms-inverse-bg)] md:aspect-auto md:h-full">
            <img
              src={featured.image}
              alt={featured.title}
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-[#120E24]/90 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
              <Clock className="size-3 text-[#FF6A2B]" aria-hidden="true" />
              {featured.readTime}
            </span>
          </div>

          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
            <span
              className="inline-flex w-fit rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ background: "var(--ms-ember)", color: "var(--ms-ink)" }}
            >
              {featured.category}
            </span>

            <h3
              className="m-0 text-2xl font-black leading-tight tracking-tight text-[var(--ms-text)] sm:text-3xl"
              style={{ fontFamily: "var(--ms-font-head)" }}
            >
              <a
                href={featured.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("blog_article_click", {
                    title: featured.title,
                    category: featured.category,
                    featured: true,
                  })
                }
                className="text-inherit no-underline transition-colors hover:text-[var(--ms-accent-text)]"
              >
                {featured.title}
              </a>
            </h3>

            <p className="m-0 text-sm leading-relaxed text-[var(--ms-muted)] sm:text-base">
              {featured.excerpt}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <Avatar className="size-10 border border-[var(--ms-border)]">
                <AvatarImage
                  src={featured.author.avatar}
                  alt={featured.author.name}
                />
                <AvatarFallback>{featured.author.initials}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="m-0 font-bold text-[var(--ms-text)]">
                  {featured.author.name}
                </p>
                <p className="m-0 font-mono text-xs text-[var(--ms-muted)]">
                  {featured.date}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={featured.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("blog_article_click", {
                    title: featured.title,
                    category: featured.category,
                    featured: true,
                  })
                }
                className="ms-btn"
              >
                Read Dispatch
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </Card>

        {/* Category Filter Bar */}
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter dispatches by topic"
        >
          {CATEGORIES.map((category) => {
            const isActive = active === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                aria-pressed={isActive}
                className={cn(
                  "min-h-[44px] cursor-pointer rounded-full border px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] transition-colors",
                  isActive
                    ? "border-[var(--ms-ember)] bg-[var(--ms-ember)] text-[var(--ms-ink)]"
                    : "border-[var(--ms-border)] bg-[var(--ms-ground)] text-[var(--ms-muted)] hover:border-[var(--ms-text)] hover:text-[var(--ms-text)]"
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <Card
              key={post.title}
              className="group flex h-full flex-col overflow-hidden border border-[var(--ms-border)] bg-[var(--ms-ground)] p-0 ring-0 transition-colors hover:border-[var(--ms-ember)]"
              style={{ borderRadius: "var(--ms-r-card)" }}
            >
              <div className="relative aspect-video overflow-hidden bg-[var(--ms-surface)]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#120E24]/90 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
                  <Clock className="size-3 text-[#FF6A2B]" aria-hidden="true" />
                  {post.readTime}
                </span>
              </div>

              <CardHeader className="gap-2 px-5 pt-5 pb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
                  {post.category}
                </span>
                <CardTitle
                  className="text-lg font-black leading-snug text-[var(--ms-text)]"
                  style={{ fontFamily: "var(--ms-font-head)" }}
                >
                  <a
                    href={post.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("blog_article_click", {
                        title: post.title,
                        category: post.category,
                        featured: false,
                      })
                    }
                    className="text-inherit no-underline transition-colors group-hover:text-[var(--ms-accent-text)]"
                  >
                    {post.title}
                  </a>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 px-5 pb-4">
                <p className="m-0 text-sm leading-relaxed text-[var(--ms-muted)]">
                  {post.excerpt}
                </p>
              </CardContent>

              <CardFooter className="items-center justify-between gap-3 border-t border-[var(--ms-border)] bg-[var(--ms-surface)]/60 px-5 py-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="size-8 border border-[var(--ms-border)]">
                    <AvatarImage
                      src={post.author.avatar}
                      alt={post.author.name}
                    />
                    <AvatarFallback>{post.author.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-xs">
                    <p className="m-0 truncate font-bold text-[var(--ms-text)]">
                      {post.author.name}
                    </p>
                    <p className="m-0 font-mono text-[11px] text-[var(--ms-muted)]">
                      {post.date}
                    </p>
                  </div>
                </div>

                <a
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Read ${post.title}`}
                  onClick={() =>
                    trackEvent("blog_article_click", {
                      title: post.title,
                      category: post.category,
                      featured: false,
                    })
                  }
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--ms-border)] text-[var(--ms-text)] transition-colors hover:border-[var(--ms-ember)] hover:bg-[var(--ms-ember)] hover:text-[var(--ms-ink)]"
                >
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlogBlock;
