import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Layers, ShieldCheck, Terminal, Workflow } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { ProjectShowcase, type ShowcaseProject } from '@/components/ui/project-showcase';

export type AudienceMode = 'fractional' | 'operator';

interface FractionalShowcaseProps {
  defaultAudience?: AudienceMode;
  callUrl?: string;
}

interface EngagementModel {
  n: string;
  name: string;
  cadence: string;
  bestFor: string;
  summary: string;
  points: string[];
  cta: string;
  href: string;
  primary?: boolean;
}

const BOOK_ANCHOR = '#book-call';

const FRACTIONAL_MODELS: EngagementModel[] = [
  {
    n: '01',
    name: 'Architecture Diagnostic',
    cadence: '2-week fixed scope',
    bestFor: 'Founders deciding what to build first and what to skip',
    summary:
      'Deep technical and workflow audit of your tools, data boundaries, and highest-leverage agent lanes before committing to a build.',
    points: [
      'Stack, shared memory, and approval-gate blueprint',
      'Prioritized 90-day build sequence grounded in real unit math',
      'Credited directly if you roll into an embedded retainer or build',
    ],
    cta: 'Book diagnostic call',
    href: BOOK_ANCHOR,
  },
  {
    n: '02',
    name: 'Fractional CTO / Head of AI',
    cadence: 'Embedded · 1 to 3 days/week',
    bestFor: 'Funded teams with live product and no senior AI systems lead',
    summary:
      'Hands-on AI architecture leadership working directly with your founders and engineers. Weekly working demos over status decks.',
    points: [
      'Multi-agent architecture, model routing, and MCP tooling',
      'Production governance with approval gates and written audit trails',
      'Technical hiring, vendor vetting, and engineering enablement',
    ],
    cta: 'Discuss embedded fit',
    href: BOOK_ANCHOR,
    primary: true,
  },
  {
    n: '03',
    name: 'Production AI Systems Build',
    cadence: '4 to 8 week milestone build',
    bestFor: 'One flagship production system shipped end-to-end',
    summary:
      'Scoped delivery for an agent fleet, Voice AI pipeline, LogMem shared memory layer, or revenue workflow built on your stack.',
    points: [
      'Built inside your repos, cloud, and security boundaries',
      'Persistent LogMem memory with human-in-the-loop sign-off',
      'Written operating playbook and live handoff with your team',
    ],
    cta: 'Scope a build',
    href: BOOK_ANCHOR,
  },
  {
    n: '04',
    name: 'Revenue & Agent Operations',
    cadence: 'Build + ongoing operate',
    bestFor: 'B2B teams turning intent signals and inbound into booked pipeline',
    summary:
      'Coordinated outbound, visitor identification, and follow-up agents wired directly into your CRM, calendar, and morning brief.',
    points: [
      'Compliance-first outreach with explicit human review gates',
      'Shared lead history across every agent and sales touchpoint',
      'Weekly reliability tuning and clean attribution reporting',
    ],
    cta: 'Review pipeline fit',
    href: BOOK_ANCHOR,
  },
];

const OPERATOR_MODELS: EngagementModel[] = [
  {
    n: '01',
    name: 'Starter Kit & Audit',
    cadence: 'Self-serve · start this weekend',
    bestFor: 'Operators who want to see shared agent memory work first',
    summary:
      'A practical starter kit for running AI as a coordinated system, plus an honest look at where calls, leads, and handoffs leak.',
    points: [
      'Three-key LogMem memory starter pattern (Who / Now / Log)',
      'Clear checklist of where existing tools drop context',
      'Open-source foundation with zero vendor lock-in',
    ],
    cta: 'Get the free kit',
    href: '/starter-kit',
  },
  {
    n: '02',
    name: 'First Shift',
    cadence: 'Live in one week',
    bestFor: 'Putting one reliable AI agent on a single business job',
    summary:
      'One focused agent connected to your phone, calendar, or CRM, trained on your rules, and switched on with your team.',
    points: [
      'Scoped to one clear operational job you pick together',
      'Runs on your existing tools instead of forcing a migration',
      'Human approves anything that spends or contacts clients',
    ],
    cta: 'Explore First Shift',
    href: '/assessment',
    primary: true,
  },
  {
    n: '03',
    name: 'Fleet Deploy',
    cadence: 'Scoped build · your stack',
    bestFor: 'Operators ready to coordinate multiple agents cleanly',
    summary:
      'A multi-agent fleet connected to your daily tools where every agent writes its work, handoffs, and blockers to LogMem.',
    points: [
      'Dedicated role per agent so bots never step on each other',
      'Shared memory, handoff queues, and decision approvals',
      'Single view of every run from one dashboard',
    ],
    cta: 'See Fleet Deploy',
    href: '/fleet',
  },
  {
    n: '04',
    name: 'Ongoing Systems Care',
    cadence: 'Monthly stewardship',
    bestFor: 'Teams wanting continuous tuning as operations evolve',
    summary:
      'I watch, tune, and extend the fleet every month so you run the business instead of babysitting automations.',
    points: [
      'Prompt, routing, and model reliability tuning',
      'Sync checks across calendar, CRM, and memory logs',
      'Plain monthly summary backed by verifiable run records',
    ],
    cta: 'Talk ongoing care',
    href: BOOK_ANCHOR,
  },
];

const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'logmem',
    title: 'LogMem Protocol',
    category: 'Open-Source Protocol',
    image: '/images/ez_influencer_360.png',
    tagline: 'Shared memory for teams of AI agents',
    description: (
      <>
        <p className="m-0">
          MIT-licensed, Redis-native shared memory protocol built around three keys: Who (durable facts), Now (live state), and Log (append-only audit trail).
        </p>
        <p className="m-0">
          Ships with public MCP servers, TypeScript SDK primitives, human approval gates, and a live fleet console so multi-agent teams pick up cleanly without starting from zero.
        </p>
      </>
    ),
    actions: (
      <>
        <a href="https://logmem.si" target="_blank" rel="noopener noreferrer" className="ms-btn">
          Visit logmem.si
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        <a
          href="https://github.com/logmem/logmem"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--ms-r-button)] border-2 border-[var(--ms-text)] px-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-[var(--ms-text)] no-underline hover:bg-[var(--ms-surface)]"
        >
          Source on GitHub
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </a>
      </>
    ),
  },
  {
    id: 'madez-voice',
    title: 'Mad EZ Voice AI',
    category: 'Voice AI · Trades',
    image: '/images/mad_ez_media_mock.png',
    tagline: '24/7 AI receptionist for local trades',
    description: (
      <>
        <p className="m-0">
          Production Voice AI receptionist and missed-call recovery system serving Charlotte trades across plumbing, HVAC, electrical, and garage door dispatch.
        </p>
        <p className="m-0">
          Qualifies emergencies in real time, remembers repeat callers, routes high-priority dispatches, and books directly into the operator calendar.
        </p>
      </>
    ),
    actions: (
      <>
        <a href="https://madezmedia.com" target="_blank" rel="noopener noreferrer" className="ms-btn">
          Visit Mad EZ Media
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        <a
          href="#book-call"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--ms-r-button)] border-2 border-[var(--ms-text)] px-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-[var(--ms-text)] no-underline hover:bg-[var(--ms-surface)]"
        >
          Book a live walkthrough
        </a>
      </>
    ),
  },
  {
    id: 'agent-fleet',
    title: '20+ Agent Fleet',
    category: 'Live Production Ops',
    image: '/images/tony_showcase.png',
    tagline: 'Coordinated daily multi-agent operations',
    description: (
      <>
        <p className="m-0">
          My own internal production fleet handling research, engineering QA, content drafting, SEO audits, and outbound prep across isolated agent roles.
        </p>
        <p className="m-0">
          Every handoff writes to LogMem and every irreversible action (send, spend, merge, deploy) pauses for explicit human sign-off.
        </p>
      </>
    ),
    actions: (
      <>
        <a href="/fleet" className="ms-btn">
          Explore fleet architecture
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        <a
          href="/starter-kit"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--ms-r-button)] border-2 border-[var(--ms-text)] px-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-[var(--ms-text)] no-underline hover:bg-[var(--ms-surface)]"
        >
          Get free starter kit
        </a>
      </>
    ),
  },
  {
    id: 'folana',
    title: "Folana's Journal",
    category: 'Autonomous Media Pipeline',
    image: '/images/folana_episode_251.png',
    tagline: 'Daily creator media pipeline running on its own',
    description: (
      <>
        <p className="m-0">
          End-to-end automated storytelling, audio, and visual production pipeline publishing daily episodes with verifiable run logs and strict creative guardrails.
        </p>
        <p className="m-0">
          Built to prove autonomous media generation can stay brand-consistent and auditable over hundreds of consecutive runs.
        </p>
      </>
    ),
    actions: (
      <a
        href="https://github.com/madezmedia/folanas-journal"
        target="_blank"
        rel="noopener noreferrer"
        className="ms-btn"
      >
        View repo on GitHub
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </a>
    ),
  },
  {
    id: 'homegauge',
    title: 'HomeGauge Field Voice',
    category: 'Field Automation',
    image: '/images/favor-ai-preview.png',
    tagline: 'Hands-free voice reporting for field inspections',
    description: (
      <>
        <p className="m-0">
          Custom desktop automation and tablet voice-agent workflow engineered for a home-inspection partner to eliminate hours of manual post-inspection data entry.
        </p>
        <p className="m-0">
          Inspectors speak findings live on site while structured notes map directly into existing legacy desktop software.
        </p>
      </>
    ),
    actions: (
      <a href="#book-call" className="ms-btn">
        Ask about custom field builds
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </a>
    ),
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
  callUrl = BOOK_ANCHOR,
}: FractionalShowcaseProps) {
  const [audience, setAudience] = useState<AudienceMode>(defaultAudience);
  const models = audience === 'fractional' ? FRACTIONAL_MODELS : OPERATOR_MODELS;

  return (
    <div className="space-y-16">
      {/* Audience Switcher + Executive Engagement Models */}
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
              <Layers className="size-3.5" aria-hidden="true" />
              <span>How We Work Together</span>
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
                  Start small. Scale into <em className="italic text-[var(--ms-accent-text)]">systems.</em>
                </>
              )}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--ms-muted)]">
              {audience === 'fractional'
                ? 'I build AI agent systems that answer, book, follow up, and remember. I run them in production for my own companies before I ever sell them to yours. Commercial terms are scoped privately after we look at your actual stack.'
                : 'Every stage stands on its own. Start with the open starter kit, put one agent on a clear job with First Shift, or deploy a full coordinated fleet on your stack.'}
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
              onClick={() => {
                setAudience('fractional');
                trackEvent('audience_switcher_change', { audience: 'fractional' });
              }}
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
              onClick={() => {
                setAudience('operator');
                trackEvent('audience_switcher_change', { audience: 'operator' });
              }}
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

        {/* 2x2 Architectural Engagement Grid (No SaaS Pricing Tables) */}
        <ol className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
          {models.map((model) => {
            const external = model.href.startsWith('http');
            return (
              <li
                key={audience + model.n}
                className="relative flex flex-col justify-between overflow-hidden border border-[var(--ms-border)] bg-[var(--ms-ground)] p-7 transition-colors hover:border-[var(--ms-ember)]"
                style={{
                  borderRadius: 'var(--ms-r-card)',
                  borderLeftWidth: model.primary ? '4px' : '1px',
                  borderLeftColor: model.primary ? 'var(--ms-ember)' : 'var(--ms-border)',
                }}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--ms-border)]">
                    <span className="font-mono text-xs font-bold tracking-[0.2em] text-[var(--ms-accent-text)]">
                      {model.n}
                    </span>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ms-muted)]">
                      {model.cadence}
                    </span>
                  </div>

                  <h3
                    className="mt-5 mb-2 text-2xl font-black leading-snug text-[var(--ms-text)]"
                    style={{ fontFamily: 'var(--ms-font-head)' }}
                  >
                    {model.name}
                  </h3>

                  <p className="m-0 text-sm leading-relaxed text-[var(--ms-muted)]">
                    {model.summary}
                  </p>

                  <ul className="mt-5 mb-6 space-y-2.5 p-0 list-none">
                    {model.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--ms-text)]"
                      >
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-1 size-4 shrink-0 text-[var(--ms-accent-text)]"
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--ms-border)] pt-4">
                  <p className="m-0 max-w-xs text-xs leading-relaxed text-[var(--ms-muted)]">
                    <strong className="text-[var(--ms-text)]">Best for:</strong> {model.bestFor}
                  </p>

                  <a
                    href={model.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    onClick={() =>
                      trackEvent('engagement_model_click', {
                        audience,
                        model: model.name,
                      })
                    }
                    className="inline-flex min-h-[44px] items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--ms-text)] underline decoration-[var(--ms-ember)] decoration-2 underline-offset-4 hover:text-[var(--ms-accent-text)] shrink-0"
                  >
                    <span>{model.cta}</span>
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </a>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Executive Engagement Principles (Fractional view) */}
        {audience === 'fractional' ? (
          <div
            className="grid grid-cols-1 gap-5 border border-[var(--ms-border)] bg-[var(--ms-ground)] p-6 md:grid-cols-3"
            style={{ borderRadius: 'var(--ms-r-card)' }}
          >
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
                Entity &amp; Location
              </span>
              <p className="mt-1.5 mb-0 text-xs leading-relaxed text-[var(--ms-muted)]">
                Charlotte, NC · Remote-first · Mad EZ Media Partners LLC. US entity filing{' '}
                <strong className="text-[var(--ms-text)]">W-9</strong> (international via Deel or Remote EOR).
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
                Commercial Structure
              </span>
              <p className="mt-1.5 mb-0 text-xs leading-relaxed text-[var(--ms-muted)]">
                Fixed-scope diagnostics, milestone builds, or monthly fractional retainers. Scoped cleanly after a{' '}
                <strong className="text-[var(--ms-text)]">direct architecture call.</strong>
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ms-accent-text)]">
                Operating Standard
              </span>
              <p className="mt-1.5 mb-0 text-xs leading-relaxed text-[var(--ms-muted)]">
                Approval gates on anything that sends, spends, or deletes. Written records for every decision.{' '}
                <strong className="text-[var(--ms-text)]">Weekly demos over status decks.</strong>
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
            href={callUrl.startsWith('http') ? '#book-call' : callUrl}
            className="inline-flex min-h-[44px] items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--ms-text)] underline decoration-[var(--ms-ember)] decoration-2 underline-offset-4 hover:text-[var(--ms-accent-text)]"
          >
            Request a live system walkthrough
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </div>

        <ProjectShowcase
          projects={SHOWCASE_PROJECTS}
          label="Selected Production Systems"
        />
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
