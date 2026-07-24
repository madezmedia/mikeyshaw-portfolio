import React, { useEffect, useRef, useState } from 'react';
import './FolanaChatAssessment.css';

type StepType = 'chips' | 'text';

interface Step {
  key: string;
  q: string;
  type: StepType;
  multi: boolean;
  options?: string[];
  placeholder?: string;
}

interface HistoryTurn {
  question: string;
  answered: boolean;
  answerText: string;
}

const STEPS: Step[] = [
  {
    key: 'industry',
    q: 'Hey — I’m Folana. Two minutes, a few quick stops, and you’ll know exactly where your business is leaking time. First: what kind of work do you do?',
    type: 'chips',
    multi: false,
    options: [
      'Home services (plumbing, HVAC, electrical, roofing)',
      'Personal/local services (salon, fitness, cleaning)',
      'Professional services (law, accounting, real estate)',
      'Medical/dental/wellness practice',
      'Restaurant/retail',
      'Something else',
    ],
  },
  {
    key: 'teamSize',
    q: 'Got it. How many people are on your team, counting you?',
    type: 'chips',
    multi: false,
    options: ['Just me', '2–5', '6–15', '16–50', '50+'],
  },
  {
    key: 'email',
    q: 'Now the ecosystem — where does your business actually run day to day. What do you use for email?',
    type: 'chips',
    multi: false,
    options: ['Gmail / Google Workspace', 'Outlook / Microsoft 365', 'Something else', 'Honestly not sure'],
  },
  {
    key: 'chat',
    q: 'And internal chat or calls — Teams, Slack, group text?',
    type: 'chips',
    multi: false,
    options: ['Microsoft Teams', 'Slack', 'Group text / phone calls only', 'We don’t really have one'],
  },
  {
    key: 'social',
    q: 'Where do customers find you online? Pick everything that applies.',
    type: 'chips',
    multi: true,
    options: ['Google Business Profile', 'Facebook', 'Instagram', 'Website', 'Yelp / Angi / Thumbtack', 'Word of mouth only'],
  },
  {
    key: 'ops',
    q: 'Operations — how do you currently book jobs and send quotes?',
    type: 'chips',
    multi: false,
    options: [
      'Paper / calendar by hand',
      'Spreadsheets',
      'A scheduling app (Calendly, Jobber, ServiceTitan, etc.)',
      'A CRM handles it',
      'Honestly, whatever works that day',
    ],
  },
  {
    key: 'hr',
    q: 'HR side — is there a real onboarding process for new hires, or do they learn by shadowing someone?',
    type: 'chips',
    multi: false,
    options: ['Written SOPs / real onboarding', 'Shadowing, no docs', 'We rarely hire', 'It’s chaos, honestly'],
  },
  {
    key: 'aiTools',
    q: 'Have you paid for or tried any AI tools already? Pick any.',
    type: 'chips',
    multi: true,
    options: ['ChatGPT', 'Claude', 'A chatbot on our website', 'An AI phone/scheduling tool', 'None yet'],
  },
  {
    key: 'painPoint',
    q: 'Last one — in your own words, what’s the one thing that eats the most time or costs you the most jobs?',
    type: 'text',
    multi: false,
    placeholder: 'e.g. "quotes always go out late"',
  },
];

const TYPING_DELAY_MS = 550;
const CONSULT_URL = 'https://cal.com/mad-ez-media/ai-automation-discovery';

export default function FolanaChatAssessment() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [history, setHistory] = useState<HistoryTurn[]>([{ question: STEPS[0].q, answered: false, answerText: '' }]);
  const [showTyping, setShowTyping] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const done = idx >= STEPS.length;
  const step = done ? null : STEPS[idx];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [history, showTyping, done]);

  function answerCurrent(displayText: string, value: string | string[]) {
    if (showTyping) return; // guard against double submission mid-transition
    const currentStep = STEPS[idx];

    setHistory((h) => {
      const next = [...h];
      next[next.length - 1] = { ...next[next.length - 1], answered: true, answerText: displayText };
      return next;
    });
    setAnswers((a) => ({ ...a, [currentStep.key]: value }));
    setShowTyping(true);
    setTextValue('');
    setMultiSelected([]);

    setTimeout(() => {
      const nextIdx = idx + 1;
      setShowTyping(false);
      setIdx(nextIdx);
      if (nextIdx < STEPS.length) {
        setHistory((h) => [...h, { question: STEPS[nextIdx].q, answered: false, answerText: '' }]);
      }
    }, TYPING_DELAY_MS);
  }

  function toggleMulti(label: string) {
    setMultiSelected((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]));
  }

  function submitMulti() {
    if (!multiSelected.length) return;
    answerCurrent(multiSelected.join(', '), [...multiSelected]);
  }

  function submitText(e: React.FormEvent) {
    e.preventDefault();
    if (!textValue.trim()) return;
    answerCurrent(textValue, textValue);
  }

  // --- results computation, mirrors the design's leak-signal inference ---
  const leakSignals: string[] = [];
  if (
    answers.ops === 'Paper / calendar by hand' ||
    answers.ops === 'Spreadsheets' ||
    answers.ops === 'Honestly, whatever works that day'
  ) {
    leakSignals.push('scheduling/quoting');
  }
  if (answers.hr === 'Shadowing, no docs' || answers.hr === 'It’s chaos, honestly') {
    leakSignals.push('team documentation');
  }
  if (Array.isArray(answers.aiTools) && answers.aiTools.includes('None yet')) {
    leakSignals.push('no AI deployed yet');
  }
  if (answers.chat === 'We don’t really have one') {
    leakSignals.push('no internal comms system');
  }

  const resultHeadline =
    leakSignals.length >= 2
      ? 'You’ve got real leaks worth fixing.'
      : 'You’re further along than most — but there’s still a leak.';
  const resultBody = `Based on what you told me: ${
    leakSignals.length ? leakSignals.join(', ') : 'a few small gaps'
  }. The 90-minute white-glove audit ($499) turns this into a scored report and a 30-day plan — book the free 15-min consult first if you want to talk it through.`;

  const ecosystemSummary = [
    { label: 'Email', value: (answers.email as string) || '—' },
    { label: 'Team chat', value: (answers.chat as string) || '—' },
    { label: 'Where customers find you', value: Array.isArray(answers.social) ? answers.social.join(', ') : '—' },
    { label: 'AI tools tried', value: Array.isArray(answers.aiTools) ? answers.aiTools.join(', ') : '—' },
  ];

  const progressPct = Math.round((Math.min(idx, STEPS.length) / STEPS.length) * 100);
  const stepDisplay = Math.min(idx + 1, STEPS.length);

  return (
    <div className="folana-widget w-full max-w-2xl mx-auto bg-white rounded-2xl border border-[#2d4a3e]/12 shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex flex-col gap-3 border-b border-[#2d4a3e]/8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#2d4a3e] text-white flex items-center justify-center font-label-mono font-bold text-sm shrink-0">
              F
            </span>
            <div className="flex flex-col leading-tight">
              <strong className="font-sans font-extrabold text-sm text-[#2d4a3e]">Folana</strong>
              <span className="font-label-mono text-[8.5px] tracking-[0.16em] uppercase text-[#2d4a3e]/55">
                AI Systems Audit &middot; Mad EZ Media
              </span>
            </div>
          </div>
          <span className="font-label-mono text-[9px] tracking-[0.14em] uppercase text-[#2d4a3e]/50 shrink-0">
            Step {stepDisplay} of {STEPS.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#2d4a3e]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2d4a3e] rounded-full transition-all duration-400 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Message history */}
      <div className="folana-messages flex flex-col gap-4 px-6 py-5 max-h-[480px] overflow-y-auto">
        {history.map((turn, i) => (
          <div key={i} className="folana-bubble-in flex flex-col gap-2">
            <div className="flex gap-2.5 items-start">
              <span className="w-6 h-6 rounded-md bg-[#2d4a3e] text-white flex items-center justify-center font-label-mono font-bold text-[10px] shrink-0">
                F
              </span>
              <div className="bg-[#faf9f5] border border-[#2d4a3e]/10 rounded-xl px-4 py-3 text-[13.5px] leading-[1.55] text-[#2d4a3e] max-w-[82%] font-sans">
                {turn.question}
              </div>
            </div>
            {turn.answered && (
              <div className="flex justify-end">
                <div className="bg-[#2d4a3e] text-white rounded-xl px-4 py-2.5 text-[13px] max-w-[78%] font-sans">
                  {turn.answerText}
                </div>
              </div>
            )}
          </div>
        ))}

        {showTyping && (
          <div className="flex gap-2.5 items-center">
            <span className="w-6 h-6 rounded-md bg-[#2d4a3e] text-white flex items-center justify-center font-label-mono font-bold text-[10px] shrink-0">
              F
            </span>
            <div className="folana-dots bg-[#faf9f5] border border-[#2d4a3e]/10 rounded-xl px-4 py-3">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {done && (
          <div className="folana-bubble-in flex flex-col gap-4 mt-1">
            <div className="bg-[#2d4a3e] rounded-xl text-white p-5 flex flex-col gap-2.5">
              <span className="font-label-mono text-[9px] tracking-[0.2em] uppercase text-[#FCDC00] font-bold">
                Your snapshot
              </span>
              <h3 className="font-heading font-extrabold text-[19px] leading-snug m-0">{resultHeadline}</h3>
              <p className="text-[12.5px] leading-relaxed text-white/90 m-0">{resultBody}</p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-label-mono text-[9px] tracking-[0.2em] uppercase text-[#2d4a3e]/55 font-bold">
                Your ecosystem, on record
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ecosystemSummary.map((e) => (
                  <div
                    key={e.label}
                    className="bg-white border border-[#2d4a3e]/10 rounded-lg px-3.5 py-2.5 flex flex-col gap-0.5"
                  >
                    <span className="font-label-mono text-[8px] tracking-[0.14em] uppercase text-[#2d4a3e]/50 font-bold">
                      {e.label}
                    </span>
                    <span className="text-xs font-semibold text-[#2d4a3e]">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center bg-[#2d4a3e] hover:bg-[#3a5c4e] transition-colors text-white rounded-full py-3.5 font-sans font-bold text-xs uppercase tracking-widest no-underline"
            >
              Book the free 15-min consult &rarr;
            </a>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input controls */}
      {!done && (
        <div className="px-6 pb-6 pt-1 border-t border-[#2d4a3e]/8">
          {step?.type === 'chips' && (
            <div className="flex flex-col gap-2.5 pt-4">
              <div className="flex flex-wrap gap-2">
                {step.options?.map((label) => {
                  const selected = step.multi && multiSelected.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={showTyping}
                      onClick={() => (step.multi ? toggleMulti(label) : answerCurrent(label, label))}
                      className={`folana-chip border-[1.5px] rounded-full px-4 py-2.5 text-[12.5px] font-semibold font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        selected
                          ? 'bg-[#2d4a3e] border-[#2d4a3e] text-white'
                          : 'bg-white border-[#2d4a3e]/25 text-[#2d4a3e] hover:border-[#2d4a3e]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {step.multi && (
                <button
                  type="button"
                  disabled={!multiSelected.length || showTyping}
                  onClick={submitMulti}
                  className="w-full bg-[#2d4a3e] hover:bg-[#3a5c4e] transition-colors text-white rounded-full py-3.5 font-sans font-bold text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue ({multiSelected.length} selected)
                </button>
              )}
            </div>
          )}

          {step?.type === 'text' && (
            <form onSubmit={submitText} className="flex gap-2 pt-4">
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={step.placeholder}
                disabled={showTyping}
                className="flex-1 border-[1.5px] border-[#2d4a3e]/20 rounded-full px-4 py-3 text-[13px] font-sans text-[#2d4a3e] bg-white focus:outline-none focus:border-[#2d4a3e] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={showTyping || !textValue.trim()}
                className="bg-[#2d4a3e] hover:bg-[#3a5c4e] transition-colors text-white w-11 h-11 rounded-full text-base shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send answer"
              >
                &rarr;
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
