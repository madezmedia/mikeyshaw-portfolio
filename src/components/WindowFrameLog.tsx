import React from 'react';

interface LogEntry {
  time: string;
  event: string;
  action: string;
  status: 'inbound' | 'locked' | 'needs-you';
  statusLabel: string;
}

const SAMPLE_ROWS: LogEntry[] = [
  {
    time: '08:14',
    event: 'Inbound lead from FractionalJobs.io',
    action: 'Triage agent logged company stage, stack, and brief to Who',
    status: 'inbound',
    statusLabel: 'Inbound',
  },
  {
    time: '09:02',
    event: 'Weekly architecture brief compiled',
    action: 'Research agent handed verified notes to delivery lead via LogMem',
    status: 'locked',
    statusLabel: 'Job locked',
  },
  {
    time: '11:27',
    event: 'Paused invoice refund request',
    action: 'Billing agent stopped before spending and opened an approval gate',
    status: 'needs-you',
    statusLabel: 'Needs you',
  },
  {
    time: '14:05',
    event: 'Voice receptionist follow-up booked',
    action: 'Dispatch agent synced calendar slot and wrote audit trail',
    status: 'locked',
    statusLabel: 'Job locked',
  },
];

const CHIP_CLASS: Record<LogEntry['status'], string> = {
  inbound: 'ms-chip ms-chip--inbound',
  locked: 'ms-chip ms-chip--locked',
  'needs-you': 'ms-chip ms-chip--needs-you',
};

export function WindowFrameLog() {
  return (
    <div
      className="overflow-hidden border border-[var(--ms-border)] bg-[var(--ms-surface)]"
      style={{ borderRadius: 'var(--ms-r-window)' }}
      aria-label="Sample LogMem agent shift log"
    >
      {/* Window chrome */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ms-border)] bg-[var(--ms-ground)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full"
            style={{ background: 'var(--ms-ember)' }}
          />
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full"
            style={{ background: 'var(--ms-blue)' }}
          />
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full"
            style={{ background: 'var(--ms-violet)' }}
          />
          <span className="ml-2 font-mono text-[11px] font-bold tracking-[0.14em] text-[var(--ms-muted)]">
            logmem.si/space/mikey
          </span>
        </div>
        <span className="rounded-full border border-[var(--ms-border)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ms-muted)]">
          Sample
        </span>
      </div>

      {/* Header */}
      <div className="border-b border-[var(--ms-border)] px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            className="m-0 text-xl font-black text-[var(--ms-text)]"
            style={{ fontFamily: 'var(--ms-font-head)' }}
          >
            One shared log across every <em className="italic text-[var(--ms-accent-text)]">agent.</em>
          </h3>
          <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-[var(--ms-muted)]">
            Illustrative. Not client data.
          </span>
        </div>
      </div>

      {/* Rows */}
      <ul className="m-0 list-none divide-y divide-[var(--ms-border)] p-0">
        {SAMPLE_ROWS.map((row) => (
          <li
            key={row.time + row.event}
            className="grid grid-cols-1 gap-2 px-5 py-3.5 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
          >
            <span className="font-mono text-sm font-bold tabular-nums text-[var(--ms-accent-text)]">
              {row.time}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold text-[var(--ms-text)]">{row.event}</p>
              <p className="m-0 mt-0.5 text-xs text-[var(--ms-muted)]">{row.action}</p>
            </div>
            <div className="sm:justify-self-end">
              <span className={CHIP_CLASS[row.status]}>{row.statusLabel}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ms-border)] bg-[var(--ms-ground)] px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="ms-chip ms-chip--inbound">Inbound</span>
          <span className="ms-chip ms-chip--locked">Job locked</span>
          <span className="ms-chip ms-chip--needs-you">Needs you</span>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ms-muted)]">
          Approval gates on spend &amp; sends
        </span>
      </div>
    </div>
  );
}

export default WindowFrameLog;
