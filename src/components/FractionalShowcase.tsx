import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Layers, ShieldCheck, Terminal, Workflow } from 'lucide-react';

export type AudienceMode = 'fractional' | 'operator';

interface FractionalShowcaseProps {
  defaultAudience?: AudienceMode;
  callUrl?: string;
}

interface EngagementTier {
  n: string;
  name: string;
  price: string;
  cadence: string;
  bestFor: string;
  summary: string;
  points: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

const CALL_DEFAULT = 'https://cal.com/mad-ez-media/ai-automation-discovery';

const FRACTIONAL_TIERS: EngagementTier[] = [
  {
    n: '01',
    name: 'Paid Diagnostic / Audit',
    price: '$3,500–$7,500',
    cadence: 'Fixed fee · credited toward build',
    bestFor: 'Teams asking "what should we build first?"',
    summary: 'Deep architecture and workflow audit of your tools, data boundaries, and highest-ROI agent lanes.',
    points: [
      'Stack, memory, and approval-gate blueprint',
      'Prioritized 90-day build sequence with real unit math',
      'Credited 100% if you roll into a build or retainer',
    ],
    cta: 'Book diagnostic call',
    href: CALL_DEFAULT,
  },
  {
    n: '02',
    name: 'Fractional CTO / Head of AI',
    price: '$8,500–$12,500',
    cadence: 'Per month · 1–3 days/wk (10–15 hrs)',
    bestFor: 'Startups with product but no senior AI leadership',
    summary: 'Hands-on AI systems leadership embedded with your founders and engineers. Weekly working demos over status decks.',
    points: [
      'Multi-agent architecture, model routing, and MCP tooling',
      'Production governance: approval gates and audit trails',
      'Direct hiring, vendor selection, and team enablement',
    ],
    cta: 'Discuss retainer',
    href: CALL_DEFAULT,
    featured: true,
  },
  {
    n: '03',
    name: 'AI Systems Build',
    price: 'From $25,000',
    cadence: '4–8 week fixed scope · milestones',
    bestFor: 'One flagship production system shipped end-to-end',
    summary: 'Scoped build for an agent fleet, voice AI pipeline, shared memory layer, or revenue workflow on your stack.',
    points: [
      'Built on your repos, cloud, and security boundaries',
      'Persistent LogMem memory + human approval gates',
      'Written playbook and live handoff with your team',
    ],
    cta: 'Scope a build',
    href: CALL_DEFAULT,
  },
  {
    n: '04',
    name: 'Sales Enablement Engine',
    price: '$3,500–$7,500',
    cadence: 'Per month operate + meeting bonus',
    bestFor: 'Seed / Series A teams ($15k+ ACV) needing pipeline',
    summary: 'Build ($10k–$25k) plus operate retainer for intent-driven outbound, visitor ID, and follow-up agents.',
    points: [
      'No pure-performance gimmicks. Clear base plus upside',
      'Compliance-first outbound with human review gates',
      'CRM, calendar, and morning brief tied into one log',
    ],
    cta: 'Review pipeline fit',
    href: CALL_DEFAULT,
  },
];

const OPERATOR_TIERS: EngagementTier[] = [
  {
    n: '01',
    name: 'Free Kit & Audit',
    price: '$0',
    cadence: 'Start this weekend',
    bestFor: 'Operators who want to test shared agent memory first',
    summary: 'A starter kit for running AI as a system, plus a short audit of the tools you already pay for.',
    points: [
      'Three-key LogMem memory starter pattern (Who / Now / Log)',
      'Honest audit of where calls, leads, or handoffs leak',
      'Zero obligation and zero lock-in',
    ],
    cta: 'Get the free kit',
    href: '/starter-kit',
  },
  {
    n: '02',
    name: 'First Shift',
    price: '$499',
    cadence: 'One-time · live in a week',
    bestFor: 'Your first AI agent on one clear business job',
    summary: 'One real agent connected to your tools, trained on your rules, and switched on with your team.',
    points: [
      'Scoped to one clear job you pick together',
      'Runs inside your phone, calendar, or CRM',
      'Human approves anything that spends or contacts clients',
    ],
    cta: 'Book First Shift',
    href: '/assessment',
    featured: true,
  },
  {
    n: '03',
    name: 'Fleet Deploy',
    price: '$4,500',
    cadence: 'Fixed build · your stack',
    bestFor: 'Operators ready to coordinate multiple agents cleanly',
    summary: 'A full multi-agent fleet connected to your tools where every agent writes its work to LogMem.',
    points: [
      'Dedicated role per agent so bots never step on each other',
      'Shared memory, handoff queues, and decision approvals',
      'Full visibility from one dashboard',
    ],
    cta: 'See Fleet Deploy',
    href: '/fleet',
  },
  {
    n: '04',
    name: 'Ongoing Systems',
    price: 'Scoped',
    cadence: 'Monthly care after Deploy',
    bestFor: 'Teams wanting continuous tuning as the business shifts',
    summary: 'I run, watch, and improve the fleet every month so you run the company instead of babysitting bots.',
    points: [
      'Prompt, routing, and reliability tuning',
      'Sync checks across calendar, CRM, and memory logs',
      'Plain monthly report with verified work records',
    ],
    cta: 'Talk ongoing care',
    href: CALL_DEFAULT,
  },
];

const PROOF_ASSETS = [
  {
    tag: 'Open-Source Protocol',
    title: 'LogMem Protocol & Console',
    summary: 'MIT-licensed, Redis-native shared memory for AI agent fleets (Who / Now / Log). Public skills repo, npm packages, and MCP server.',
    href: 'https://logmem.si',
    cta: 'Visit logmem.si',
  },
  {
    tag: 'Live Production Ops',
    title: '20+ Agent Coordinated Fleet',
    summary: 'Daily multi-agent production fleet running content, research, sales ops, and QA on shared memory with human approval gates and audit trails.',
    href: '/fleet',
    cta: 'See fleet architecture',
  },
  {
    tag: 'Voice AI · Trades',
    title: 'Mad EZ Media Voice AI',
    summary: '24/7 AI receptionist and missed-call recovery for Charlotte trades (garage door, HVAC, plumbing) with qualification, booking, and repeat-caller memory.',
    href: 'https://madezmedia.com',
    cta: 'Visit Mad EZ Media',
  },
  {
    tag: 'Field Automation',
    title: 'HomeGauge Voice-Agent Build',
    summary: 'Desktop automation plus field tablet voice workflow built for a home-inspection partner to remove manual post-inspection data entry.',
    href: '#contact',
    cta: 'Ask about this build',
  },
  {
    tag: 'Content Systems',
    title: '100-Post Founder Campaign',
    summary: 'End-to-end editorial campaign drafted, tracked, and scheduled by coordinated agents with explicit human sign-off on every post.',
    href: '#intel',
    cta: 'Read writing',
  },
  {
    tag: 'Autonomous Pipeline',
    title: "Folana's Journal Media Pipeline",
    summary: 'Public creator media pipeline that drafts, checks, and publishes on a daily cadence with verifiable run logs.',
    href: 'https://github.com/madezmedia/folanas-journal',
    cta: 'View on GitHub',
  },
];

const SKILLS = [
  'AI agents & orchestration',
  'Persistent agent memory (LogMem)',
  'Voice AI (Vapi / Retell class)',
  'LLM routing (Claude · GPT · Grok · Gemini)',
  'MCP tooling & Redis',
  'TypeScript & Next.js',
  'GoHighLevel pipelines',
  'Outbound & intent-data engines',
  'GEO / AEO visibility',
  'Human-in-the-loop governance',
];

export function FractionalShowcase({
  defaultAudience = 'fractional',
  callUrl = CALL_DEFAULT,
}: FractionalShowcaseProps) {
  const [audience, setAudience] = useState<AudienceMode>(defaultAudience);
  const tiers = audience === 'fractional' ? FRACTIONAL_TIERS : OPERATOR_TIERS;

  return (
    <div className="space-y-16">
      {/* Audience Switcher + Tiers */}
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
              <Layers className="size-3.5" aria-hidden="true" />
              <span>Engagements &amp; Rate Card</span>
            </div>
            <h2
              className="m-0 text-[clamp(2rem,4.4vw,3.4rem)] font-black leading-[1.04] tracking-tight text-[var(--ms-text)]"
              style={{ fontFamily: 'var(--ms-font-head)' }}
            >
              {audience === 'fractional' ? (
                <>
                  Senior AI leadership, <em className="italic text-[var(--ms-accent-text)]">hands-on.</em>
                </>
              ) : (
                <>
                  One ladder. Start at the <em className="italic text-[var(--ms-accent-text)]">bottom.</em>
                </>
              )}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--ms-muted)]">
              {audience === 'fractional'
                ? 'I build AI agent systems that answer, book, follow up, and remember. I run them in production for my own companies before I ever sell them to yours.'
                : 'Every rung works on its own and is priced up front. Start with the free starter kit, put one agent on First Shift, and scale into a full coordinated fleet.'}
            </p>
          </div>

          {/* Kit v3 Segmented Audience Switcher */}
          <div
            role="group"
            aria-label="Choose your path"
            className="inline-flex flex-wrap rounded-full border border-[var(--ms-border)] bg-[var(--ms-ground)] p-1"
          >
            <button
              type="button"
              aria-pressed={audience === 'fractional'}
              onClick={() => setAudience('fractional')}
              className="min-h-[44px] cursor-pointer rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
              style={
                audience === 'fractional'
                  ? { background: 'var(--ms-ember)', color: 'var(--ms-ink)' }
                  : { background: 'transparent', color: 'var(--ms-muted)' }
              }
            >
              Fractional CTO / AI
            </button>
            <button
              type="button"
              aria-pressed={audience === 'operator'}
              onClick={() => setAudience('operator')}
              className="min-h-[44px] cursor-pointer rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
              style={
                audience === 'operator'
                  ? { background: 'var(--ms-ember)', color: 'var(--ms-ink)' }
                  : { background: 'transparent', color: 'var(--ms-muted)' }
              }
            >
              Operator Ladder
            </button>
          </div>
        </div>

        {/* Tier Cards */}
        <ol className="m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier) => {
            const external = tier.href.startsWith('http');
            return (
              <li
                key={audience + tier.n}
                className="relative flex flex-col overflow-hidden border border-[var(--ms-border)] bg-[var(--ms-ground)] p-6"
                style={{
                  borderRadius: 'var(--ms-r-card)',
                  borderTopWidth: tier.featured ? '5px' : '1px',
                  borderTopColor: tier.featured ? 'var(--ms-ember)' : 'var(--ms-border)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold tracking-[0.2em] text-[var(--ms-accent-text)]">
                    {tier.n}
                  </span>
                  {tier.featured ? (
                    <span
                      className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{ background: 'var(--ms-ember)', color: 'var(--ms-ink)' }}
                    >
                      Most common
                    </span>
                  ) : null}
                </div>

                <h3
                  className="mt-3 mb-1 text-xl font-black leading-snug text-[var(--ms-text)]"
                  style={{ fontFamily: 'var(--ms-font-head)' }}
                >
                  {tier.name}
                </h3>

                <div className="mt-2">
                  <div
                    className="text-3xl font-black tabular-nums leading-none text-[var(--ms-text)]"
                    style={{ fontFamily: 'var(--ms-font-head)' }}
                  >
                    {tier.price}
                  </div>
                  <div className="mt-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ms-muted)]">
                    {tier.cadence}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[var(--ms-muted)]">{tier.summary}</p>

                <ul className="mt-4 mb-6 flex-1 space-y-2 border-t border-[var(--ms-border)] pt-4 p-0 list-none">
                  {tier.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--ms-text)]">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0 text-[var(--ms-accent-text)]"
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                <p className="mb-4 text-[11px] font-medium text-[var(--ms-muted)]">
                  <strong className="text-[var(--ms-text)]">Best for:</strong> {tier.bestFor}
                </p>

                <a
                  href={tier.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className={tier.featured ? 'ms-btn w-full' : 'inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[var(--ms-r-button)] border-2 border-[var(--ms-text)] px-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-[var(--ms-text)] no-underline transition-colors hover:bg-[var(--ms-surface)]'}
                >
                  <span>{tier.cta}</span>
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </a>
              </li>
            );
          })}
        </ol>

        {/* Commercial terms strip (Fractional view) */}
        {audience === 'fractional' ? (
          <div
            className="grid grid-cols-1 gap-4 border border-[var(--ms-border)] bg-[var(--ms-ground)] p-5 md:grid-cols-3"
            style={{ borderRadius: 'var(--ms-r-card)' }}
          >
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
                Contract &amp; Tax
              </span>
              <p className="mt-1 mb-0 text-xs leading-relaxed text-[var(--ms-muted)]">
                Charlotte, NC · Remote-first · Mad EZ Media Partners LLC. US entity filing <strong className="text-[var(--ms-text)]">W-9</strong> (international via Deel/Remote EOR).
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
                Equity Policy
              </span>
              <p className="mt-1 mb-0 text-xs leading-relaxed text-[var(--ms-muted)]">
                Full-cash engagements carry no equity. Reduced-cash pre-seed arrangements cap at <strong className="text-[var(--ms-text)]">1%</strong> on a 24-month vest with cliff.
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
                How I Work
              </span>
              <p className="mt-1 mb-0 text-xs leading-relaxed text-[var(--ms-muted)]">
                Approval gates on anything that sends, spends, or deletes. Written records for every decision. <strong className="text-[var(--ms-text)]">Weekly demos over status decks.</strong>
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Proof Assets Grid — 100% Real, Zero Invented Stats */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              <span>Proof Assets · Show, Don&apos;t Tell</span>
            </div>
            <h3
              className="m-0 text-[clamp(1.6rem,3.4vw,2.5rem)] font-black leading-[1.08] text-[var(--ms-text)]"
              style={{ fontFamily: 'var(--ms-font-head)' }}
            >
              Systems running in <em className="italic text-[var(--ms-accent-text)]">production.</em>
            </h3>
          </div>
          <a
            href={callUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--ms-text)] underline decoration-[var(--ms-ember)] decoration-2 underline-offset-4 hover:text-[var(--ms-accent-text)]"
          >
            Request a live system walkthrough
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROOF_ASSETS.map((item) => {
            const external = item.href.startsWith('http');
            return (
              <article
                key={item.title}
                className="flex flex-col border border-[var(--ms-border)] bg-[var(--ms-ground)] p-6 transition-colors hover:border-[var(--ms-ember)]"
                style={{ borderRadius: 'var(--ms-r-card)' }}
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
                  {item.tag}
                </span>
                <h4
                  className="mt-2 mb-2 text-lg font-black leading-snug text-[var(--ms-text)]"
                  style={{ fontFamily: 'var(--ms-font-head)' }}
                >
                  {item.title}
                </h4>
                <p className="m-0 flex-1 text-sm leading-relaxed text-[var(--ms-muted)]">
                  {item.summary}
                </p>
                <a
                  href={item.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 font-sans text-sm font-bold text-[var(--ms-text)] underline decoration-[var(--ms-ember)] decoration-2 underline-offset-4 hover:text-[var(--ms-accent-text)]"
                >
                  <span>{item.cta}</span>
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </a>
              </article>
            );
          })}
        </div>
      </div>

      {/* Stack / Skill Map — Text Chips Only (Kit v3 Rule: No Third-Party Logos) */}
      <div
        className="border border-[var(--ms-border)] bg-[var(--ms-ground)] p-6"
        style={{ borderRadius: 'var(--ms-r-card)' }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
            <Terminal className="size-3.5" aria-hidden="true" />
            <span>Core Capabilities &amp; Stack</span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[var(--ms-muted)]">
            <Workflow className="size-3.5" aria-hidden="true" />
            Former Restaurant GM · Operator P&amp;L Math
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[var(--ms-border)] bg-[var(--ms-surface)] px-3.5 py-1.5 font-mono text-xs font-bold text-[var(--ms-text)]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FractionalShowcase;
