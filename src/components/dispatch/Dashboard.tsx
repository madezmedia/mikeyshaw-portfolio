import { useState, useEffect, useCallback } from 'react';
import mockData from '../../data/mock-dispatch.json';

/* ── Design Tokens ── */
const D = {
  bg: '#0B1120', surface: '#131B2E', surfaceHover: '#1A2540',
  border: '#1E2D4A', borderLight: '#2A3A5C',
  amber: '#F59E0B', amberDim: 'rgba(245,158,11,0.12)', amberGlow: 'rgba(245,158,11,0.25)',
  green: '#10B981', greenDim: 'rgba(16,185,129,0.12)',
  blue: '#3B82F6', blueDim: 'rgba(59,130,246,0.12)',
  red: '#EF4444', redDim: 'rgba(239,68,68,0.12)',
  slate: '#64748B', slateLight: '#94A3B8', slateBright: '#CBD5E1',
  white: '#F1F5F9',
  radius: '10px', radiusLg: '14px',
};

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'on-job':      { bg: D.amberDim,  text: D.amber, dot: D.amber,  label: 'On Job' },
  'en-route':    { bg: D.blueDim,   text: D.blue,  dot: D.blue,   label: 'En Route' },
  'available':   { bg: D.greenDim,  text: D.green, dot: D.green,  label: 'Available' },
  'maintenance': { bg: D.redDim,    text: D.red,   dot: D.red,    label: 'Down' },
  'in-progress': { bg: D.amberDim,  text: D.amber, dot: D.amber,  label: 'In Progress' },
  'confirmed':   { bg: D.greenDim,  text: D.green, dot: D.green,  label: 'Confirmed' },
  'scheduled':   { bg: D.blueDim,   text: D.blue,  dot: D.blue,   label: 'Scheduled' },
  'tentative':   { bg: 'rgba(100,116,139,0.12)', text: D.slate, dot: D.slate, label: 'Tentative' },
};

/* ── Shared Styles ── */
const cardStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${D.surface} 0%, ${D.surfaceHover} 100%)`,
  border: `1px solid ${D.border}`,
  borderRadius: D.radiusLg,
  backdropFilter: 'blur(8px)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: D.slate,
};

/* ── Live Clock ── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 13, color: D.slateLight }}>
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
      <span style={{ fontFamily: 'monospace', fontSize: 16, color: D.white, fontVariantNumeric: 'tabular-nums', letterSpacing: 1 }}>
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}

/* ── Header ── */
function Header({ alertsOpen, setAlertsOpen, unread }: { alertsOpen: boolean; setAlertsOpen: (v: boolean) => void; unread: number }) {
  return (
    <header style={{
      background: `linear-gradient(180deg, ${D.surface} 0%, ${D.bg} 100%)`,
      borderBottom: `1px solid ${D.border}`,
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: `linear-gradient(135deg, ${D.amber} 0%, #D97706 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14, color: D.bg, letterSpacing: -0.5,
          boxShadow: `0 0 20px ${D.amberGlow}`,
        }}>CP</div>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: D.white, lineHeight: 1.2 }}>Core Pumping Solutions</h1>
          <p style={{ fontSize: 10, color: D.amber, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Dispatch Command Center</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <LiveClock />
        <button onClick={() => setAlertsOpen(!alertsOpen)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={D.slateLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unread > 0 && <span style={{
            position: 'absolute', top: 2, right: 2,
            background: D.red, color: '#fff', fontSize: 10, fontWeight: 700,
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 8px ${D.redDim}`,
          }}>{unread}</span>}
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: D.amberDim, border: `2px solid ${D.amber}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: D.amber, fontWeight: 700, fontSize: 12,
        }}>MS</div>
      </div>
    </header>
  );
}

/* ── Fleet Card ── */
function FleetCard({ truck, isSelected, onClick }: { truck: typeof mockData.trucks[0]; isSelected: boolean; onClick: () => void }) {
  const sc = statusConfig[truck.status] || statusConfig.available;
  const job = truck.currentJob ? mockData.jobs.find(j => j.id === truck.currentJob) : null;
  return (
    <button onClick={onClick} style={{
      ...cardStyle,
      padding: 16, textAlign: 'left' as const, width: '100%', cursor: 'pointer',
      borderColor: isSelected ? D.amber : D.border,
      boxShadow: isSelected ? `0 0 20px ${D.amberGlow}, inset 0 1px 0 rgba(255,255,255,0.05)` : '0 2px 8px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: D.white }}>{truck.id}</span>
        <span style={{
          background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 20,
          fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot,
            boxShadow: truck.status === 'on-job' ? `0 0 6px ${sc.dot}` : 'none',
            animation: truck.status === 'on-job' ? 'pulse 2s infinite' : 'none' }} />
          {sc.label}
        </span>
      </div>
      <div style={{ fontSize: 12, color: D.slateLight, marginBottom: 4 }}>{truck.type}</div>
      <div style={{ fontSize: 12, color: D.slate, marginBottom: 6 }}>{truck.operator}</div>
      {job && <div style={{ fontSize: 11, color: D.amber, opacity: 0.8 }}>#{job.id} {job.customer}</div>}
      <div style={{ fontSize: 11, color: D.slate, marginTop: 4 }}>
        {truck.hoursToday > 0 ? (
          <span style={{ color: D.green }}>{truck.hoursToday} hrs today</span>
        ) : 'No hours'}
      </div>
    </button>
  );
}

/* ── Schedule Timeline ── */
function Schedule({ selectedJobId, onSelectJob }: { selectedJobId: string | null; onSelectJob: (id: string) => void }) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 6);
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  return (
    <div style={{ ...cardStyle, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: D.slate, letterSpacing: 1, textTransform: 'uppercase' }}>Today's Schedule</h3>
        <span style={{ fontSize: 11, color: D.slate }}>{mockData.jobs.length} jobs scheduled</span>
      </div>
      <div style={{ position: 'relative', overflowX: 'auto' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${D.border}`, marginBottom: 8, minWidth: 700 }}>
          {hours.map(h => (
            <div key={h} style={{ flex: 1, fontSize: 10, color: D.slate, textAlign: 'center', paddingBottom: 6 }}>
              {h > 12 ? h - 12 : h}{h >= 12 ? 'PM' : 'AM'}
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', minWidth: 700, height: 210 }}>
          {hours.map(h => (
            <div key={h} style={{ position: 'absolute', top: 0, bottom: 0, left: `${((h - 6) / 12) * 100}%`, borderLeft: `1px solid ${D.border}`, opacity: 0.5 }} />
          ))}
          {/* Now indicator */}
          {(() => {
            const now = new Date(); const nowMin = now.getHours() * 60 + now.getMinutes();
            if (nowMin >= 360 && nowMin <= 1080) {
              const left = ((nowMin - 360) / 720) * 100;
              return <div style={{ position: 'absolute', top: -4, bottom: 0, left: `${left}%`, borderLeft: `2px solid ${D.red}`, zIndex: 5 }}>
                <div style={{ position: 'absolute', top: -2, left: -4, width: 6, height: 6, borderRadius: '50%', background: D.red }} />
              </div>;
            }
            return null;
          })()}
          {mockData.jobs.map((job, idx) => {
            const start = toMin(job.startTime); const end = toMin(job.endTime);
            const left = ((start - 360) / 720) * 100; const width = ((end - start) / 720) * 100;
            const sc = statusConfig[job.status] || statusConfig.scheduled;
            const isSelected = selectedJobId === job.id;
            return (
              <button key={job.id} onClick={() => onSelectJob(job.id)} style={{
                position: 'absolute', left: `${left}%`, width: `${width}%`, top: idx * 34,
                borderRadius: 6, padding: '4px 8px', textAlign: 'left', cursor: 'pointer',
                background: sc.bg, border: isSelected ? `2px solid ${sc.text}` : `1px solid ${D.border}`,
                boxShadow: isSelected ? `0 0 12px ${sc.bg}` : 'none',
                transition: 'all 0.15s ease', zIndex: isSelected ? 3 : 1,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: D.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{job.id} {job.customer}</div>
                <div style={{ fontSize: 10, color: sc.text }}>{job.truck || 'TBD'} · {job.yards} yds</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Mini Bar Chart ── */
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: '100%', height: 4, background: D.border, borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
    </div>
  );
}

/* ── Stats Cards ── */
function StatsCards() {
  const s = mockData.stats;
  const cards = [
    { label: 'Jobs Today', value: s.jobsToday, max: 10, color: D.amber, prefix: '' },
    { label: 'Yards Pumped', value: s.yardsPumped, max: 800, color: D.blue, prefix: '' },
    { label: 'Revenue Today', value: s.revenueToday, max: 8000, color: D.green, prefix: '$' },
    { label: 'On-Time Rate', value: s.onTimeRate, max: 100, color: D.green, prefix: '', suffix: '%' },
    { label: 'Fleet Utilization', value: s.fleetUtilization, max: 100, color: D.amber, prefix: '', suffix: '%' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
      {cards.map(c => (
        <div key={c.label} style={{ ...cardStyle, padding: 16 }}>
          <div style={{ ...labelStyle, marginBottom: 8 }}>{c.label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: D.white, lineHeight: 1, marginBottom: 10 }}>
            {c.prefix}{c.value.toLocaleString()}{c.suffix || ''}
          </div>
          <MiniBar value={c.value} max={c.max} color={c.color} />
        </div>
      ))}
    </div>
  );
}

/* ── Jobs Table ── */
function JobsTable({ selectedJobId, onSelectJob }: { selectedJobId: string | null; onSelectJob: (id: string) => void }) {
  const cols = ['Job #', 'Customer', 'Location', 'Truck', 'Time', 'Yards', 'Status'];
  return (
    <div style={{ ...cardStyle, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 8px' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: D.slate, letterSpacing: 1, textTransform: 'uppercase' }}>Active Jobs</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${D.border}` }}>
            {cols.map(c => <th key={c} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, color: D.slate, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {mockData.jobs.map(job => {
            const sc = statusConfig[job.status] || statusConfig.scheduled;
            const sel = selectedJobId === job.id;
            return (
              <tr key={job.id} onClick={() => onSelectJob(job.id)} style={{
                cursor: 'pointer', transition: 'background 0.15s',
                background: sel ? D.amberDim : 'transparent',
                borderBottom: `1px solid ${D.border}`,
              }}
                onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = D.surfaceHover; }}
                onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: D.amber, fontWeight: 600 }}>#{job.id}</td>
                <td style={{ padding: '10px 12px', color: D.white, fontWeight: 500 }}>{job.customer}</td>
                <td style={{ padding: '10px 12px', color: D.slateLight, fontSize: 12 }}>{job.address.split(',')[0]}</td>
                <td style={{ padding: '10px 12px', color: D.slateLight }}>{job.truck || '—'}</td>
                <td style={{ padding: '10px 12px', color: D.slateLight, fontVariantNumeric: 'tabular-nums' }}>{job.startTime}–{job.endTime}</td>
                <td style={{ padding: '10px 12px', color: D.slateLight }}>{job.yards}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{sc.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Job Detail Panel ── */
function JobDetail({ job, onClose }: { job: typeof mockData.jobs[0] | undefined; onClose: () => void }) {
  if (!job) return (
    <div style={{ ...cardStyle, padding: 40, textAlign: 'center' as const }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
      <p style={{ color: D.slate, fontSize: 13 }}>Select a job to view details</p>
    </div>
  );
  const revenue = job.yards * job.rate;
  const sc = statusConfig[job.status] || statusConfig.scheduled;
  return (
    <div style={{ ...cardStyle, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${D.border}`, background: `linear-gradient(135deg, ${sc.bg} 0%, transparent 100%)` }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 700, color: D.white }}>Job #{job.id}</span>
          <span style={{ marginLeft: 10, background: sc.bg, color: sc.text, padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{sc.label}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: D.slate, fontSize: 20, cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={labelStyle}>Customer</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: D.white, marginTop: 2 }}>{job.customer}</div>
          <div style={{ fontSize: 12, color: D.slateLight }}>{job.contact} · {job.contactPhone}</div>
        </div>
        <div>
          <div style={labelStyle}>Location</div>
          <div style={{ fontSize: 13, color: D.slateBright, marginTop: 2 }}>{job.address}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><div style={labelStyle}>Pump</div><div style={{ fontSize: 13, color: D.white, marginTop: 2 }}>{job.pumpType}</div></div>
          <div><div style={labelStyle}>Truck</div><div style={{ fontSize: 13, color: D.white, marginTop: 2 }}>{job.truck || 'Unassigned'}</div></div>
          <div><div style={labelStyle}>Yardage</div><div style={{ fontSize: 13, color: D.white, marginTop: 2 }}>{job.yards} yds</div></div>
          <div><div style={labelStyle}>Revenue</div><div style={{ fontSize: 14, fontWeight: 700, color: D.green, marginTop: 2 }}>${revenue.toLocaleString()}</div></div>
        </div>
        {job.specialInstructions && (
          <div style={{ background: D.amberDim, borderRadius: 8, padding: 10, borderLeft: `3px solid ${D.amber}` }}>
            <div style={{ ...labelStyle, color: D.amber, marginBottom: 4 }}>Special Instructions</div>
            <div style={{ fontSize: 12, color: D.slateBright }}>{job.specialInstructions}</div>
          </div>
        )}
        <div>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Status Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {job.timeline.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: step.done ? D.green : 'transparent',
                  border: `2px solid ${step.done ? D.green : D.border}`,
                  boxShadow: step.done ? `0 0 6px ${D.greenDim}` : 'none',
                }} />
                <span style={{ fontSize: 12, color: step.done ? D.white : D.slate, flex: 1 }}>{step.step}</span>
                <span style={{ fontSize: 11, color: D.slate, fontVariantNumeric: 'tabular-nums' }}>{step.time}</span>
              </div>
            ))}
          </div>
        </div>
        {job.notes && (
          <div>
            <div style={labelStyle}>Notes</div>
            <div style={{ fontSize: 12, color: D.slateLight, marginTop: 2 }}>{job.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Alerts Panel ── */
function AlertsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const typeColor: Record<string, string> = { warning: D.amber, info: D.blue, new: D.green, success: D.green };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={onClose}>
      <div style={{
        position: 'absolute', top: 56, right: 80, width: 380,
        background: D.surface, border: `1px solid ${D.border}`, borderRadius: D.radiusLg,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: D.white, fontSize: 14 }}>Notifications</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: D.slate, fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {mockData.alerts.map(alert => (
            <div key={alert.id} style={{
              padding: '12px 16px', borderLeft: `3px solid ${typeColor[alert.type] || D.slate}`,
              borderBottom: `1px solid ${D.border}`, background: !alert.read ? D.amberDim : 'transparent',
            }}>
              <div style={{ fontSize: 13, color: D.white, lineHeight: 1.4 }}>{alert.message}</div>
              <div style={{ fontSize: 11, color: D.slate, marginTop: 4 }}>{alert.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>('1247');
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const selectedJob = mockData.jobs.find(j => j.id === selectedJobId);
  const unread = mockData.alerts.filter(a => !a.read).length;

  const handleSelectJob = useCallback((id: string) => {
    setSelectedJobId(id);
    const job = mockData.jobs.find(j => j.id === id);
    if (job?.truck) setSelectedTruckId(job.truck);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.white, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } * { box-sizing: border-box; } button { font-family: inherit; }`}</style>
      <Header alertsOpen={alertsOpen} setAlertsOpen={setAlertsOpen} unread={unread} />
      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Fleet Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {mockData.trucks.map(t => (
            <FleetCard key={t.id} truck={t} isSelected={selectedTruckId === t.id} onClick={() => setSelectedTruckId(t.id)} />
          ))}
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Main Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Schedule selectedJobId={selectedJobId} onSelectJob={handleSelectJob} />
            <JobsTable selectedJobId={selectedJobId} onSelectJob={handleSelectJob} />
          </div>
          <div>
            <JobDetail job={selectedJob} onClose={() => setSelectedJobId(null)} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: D.surface, borderTop: `1px solid ${D.border}`,
        padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, color: D.slate,
      }}>
        <span>
          <span style={{ color: D.green }}>●</span> {mockData.trucks.filter(t => t.status === 'available').length} Available &nbsp;
          <span style={{ color: D.amber }}>●</span> {mockData.trucks.filter(t => t.status === 'on-job').length} On Job &nbsp;
          <span style={{ color: D.blue }}>●</span> {mockData.trucks.filter(t => t.status === 'en-route').length} En Route &nbsp;
          <span style={{ color: D.red }}>●</span> {mockData.trucks.filter(t => t.status === 'maintenance').length} Down
        </span>
        <span>Core Dispatch v1.0 — Built by <strong style={{ color: D.amber }}>Michael Shaw</strong></span>
      </footer>
    </div>
  );
}
