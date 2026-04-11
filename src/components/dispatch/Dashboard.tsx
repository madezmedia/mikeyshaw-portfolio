import { useState, useEffect, useCallback } from 'react';
import mockData from '../../data/mock-dispatch.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell, Truck, Clock, DollarSign, BarChart3, MapPin, Phone,
  CalendarDays, AlertTriangle, Info, Plus, CheckCircle2, Circle,
  Wrench, Navigation, X
} from 'lucide-react';

/* ── Status Config ── */
const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string; label: string; color: string; bg: string }> = {
  'on-job':      { variant: 'default',   className: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20', label: 'On Job',       color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  'en-route':    { variant: 'secondary', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20',     label: 'En Route',     color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  'available':   { variant: 'secondary', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20', label: 'Available', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  'maintenance': { variant: 'destructive', className: 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20',       label: 'Down',         color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  'in-progress': { variant: 'default',   className: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20', label: 'In Progress',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  'confirmed':   { variant: 'secondary', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20', label: 'Confirmed', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  'scheduled':   { variant: 'secondary', className: 'bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/20',         label: 'Scheduled',    color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)' },
  'tentative':   { variant: 'outline',   className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',                        label: 'Tentative',    color: '#64748B', bg: 'rgba(100,116,139,0.08)' },
};

/* ── Live Clock ── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="flex items-center gap-3">
      <CalendarDays className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
      <span className="font-mono text-base text-foreground tabular-nums tracking-wider">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}

/* ── Mini Progress Bar ── */
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }} />
    </div>
  );
}

/* ── Header ── */
function Header({ alertsOpen, setAlertsOpen, unread }: { alertsOpen: boolean; setAlertsOpen: (v: boolean) => void; unread: number }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-extrabold text-background shadow-lg shadow-amber-500/20">
            CP
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Core Pumping Solutions</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">Dispatch Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <LiveClock />
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setAlertsOpen(!alertsOpen)}>
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-lg shadow-destructive/30">
                  {unread}
                </span>
              )}
            </Button>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500/15 text-xs font-bold text-amber-400">
            MS
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── Fleet Card ── */
function FleetCard({ truck, isSelected, onClick }: { truck: typeof mockData.trucks[0]; isSelected: boolean; onClick: () => void }) {
  const sc = statusConfig[truck.status] || statusConfig.available;
  const job = truck.currentJob ? mockData.jobs.find(j => j.id === truck.currentJob) : null;
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'border-amber-500/60 bg-amber-500/5 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
          : 'border-border bg-card hover:border-amber-500/20'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg font-extrabold text-foreground">{truck.id}</span>
          </div>
          <Badge variant="outline" className={`${sc.className} text-[10px] gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${truck.status === 'on-job' ? 'animate-pulse' : ''}`} style={{ background: sc.color }} />
            {sc.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{truck.type}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{truck.operator}</p>
        {job && (
          <p className="text-[11px] text-amber-400/80 mt-2 font-medium">
            #{job.id} {job.customer}
          </p>
        )}
        <Separator className="my-2 opacity-50" />
        <p className="text-xs">
          {truck.hoursToday > 0 ? (
            <span className="text-emerald-400 font-medium">{truck.hoursToday} hrs today</span>
          ) : (
            <span className="text-muted-foreground">No hours today</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

/* ── Schedule Timeline ── */
function Schedule({ selectedJobId, onSelectJob }: { selectedJobId: string | null; onSelectJob: (id: string) => void }) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 6);
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Schedule</CardTitle>
          <span className="text-xs text-muted-foreground">{mockData.jobs.length} jobs</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="relative overflow-x-auto">
          <div className="flex border-b border-border mb-2 min-w-[700px]">
            {hours.map(h => (
              <div key={h} className="flex-1 text-center pb-2 text-[10px] text-muted-foreground font-medium">
                {h > 12 ? h - 12 : h}{h >= 12 ? 'PM' : 'AM'}
              </div>
            ))}
          </div>
          <div className="relative min-w-[700px]" style={{ height: 210 }}>
            {hours.map(h => (
              <div key={h} className="absolute top-0 bottom-0 border-l border-border/40" style={{ left: `${((h - 6) / 12) * 100}%` }} />
            ))}
            {/* Now line */}
            {(() => {
              const now = new Date(); const nowMin = now.getHours() * 60 + now.getMinutes();
              if (nowMin >= 360 && nowMin <= 1080) {
                return (
                  <div className="absolute top-0 bottom-0 z-10" style={{ left: `${((nowMin - 360) / 720) * 100}%`, borderLeft: '2px solid #EF4444' }}>
                    <div className="absolute -top-1 left-[-4px] w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                  </div>
                );
              }
              return null;
            })()}
            {mockData.jobs.map((job, idx) => {
              const start = toMin(job.startTime); const end = toMin(job.endTime);
              const left = ((start - 360) / 720) * 100; const width = ((end - start) / 720) * 100;
              const sc = statusConfig[job.status] || statusConfig.scheduled;
              const sel = selectedJobId === job.id;
              return (
                <button
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  className={`absolute rounded-lg px-2 py-1.5 text-left transition-all duration-150 cursor-pointer overflow-hidden ${
                    sel ? 'ring-2 ring-amber-400 z-20 shadow-lg' : 'hover:brightness-125'
                  }`}
                  style={{
                    left: `${left}%`, width: `${width}%`, top: idx * 34,
                    background: sc.bg, border: sel ? `1px solid ${sc.color}` : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="text-[11px] font-semibold text-foreground truncate">#{job.id} {job.customer}</div>
                  <div className="text-[10px] font-medium" style={{ color: sc.color }}>{job.truck || 'TBD'} · {job.yards} yds</div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Stats Cards ── */
function StatsCards() {
  const s = mockData.stats;
  const cards = [
    { label: 'Jobs Today', value: s.jobsToday, max: 10, icon: CalendarDays, color: '#F59E0B', prefix: '' },
    { label: 'Yards Pumped', value: s.yardsPumped, max: 800, icon: BarChart3, color: '#3B82F6', prefix: '' },
    { label: 'Revenue Today', value: s.revenueToday, max: 8000, icon: DollarSign, color: '#10B981', prefix: '$' },
    { label: 'On-Time Rate', value: s.onTimeRate, max: 100, icon: Clock, color: '#10B981', prefix: '', suffix: '%' },
    { label: 'Fleet Utilization', value: s.fleetUtilization, max: 100, icon: Truck, color: '#F59E0B', prefix: '', suffix: '%' },
  ];
  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map(c => (
        <Card key={c.label} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">
              {c.prefix}{c.value.toLocaleString()}{c.suffix || ''}
            </p>
            <div className="mt-3">
              <ProgressBar value={c.value} max={c.max} color={c.color} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Jobs Table ── */
function JobsTable({ selectedJobId, onSelectJob }: { selectedJobId: string | null; onSelectJob: (id: string) => void }) {
  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Jobs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left px-4 py-2 font-semibold">Job #</th>
              <th className="text-left px-4 py-2 font-semibold">Customer</th>
              <th className="text-left px-4 py-2 font-semibold">Location</th>
              <th className="text-left px-4 py-2 font-semibold">Truck</th>
              <th className="text-left px-4 py-2 font-semibold">Time</th>
              <th className="text-left px-4 py-2 font-semibold">Yards</th>
              <th className="text-left px-4 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockData.jobs.map(job => {
              const sc = statusConfig[job.status] || statusConfig.scheduled;
              const sel = selectedJobId === job.id;
              return (
                <tr
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  className={`cursor-pointer border-b border-border/50 transition-colors ${
                    sel ? 'bg-amber-500/8' : 'hover:bg-muted/50'
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-semibold text-amber-400">#{job.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{job.customer}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{job.address.split(',')[0]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{job.truck || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs tabular-nums">{job.startTime}–{job.endTime}</td>
                  <td className="px-4 py-3 text-muted-foreground">{job.yards}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`${sc.className} text-[10px]`}>{sc.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

/* ── Job Detail Panel ── */
function JobDetail({ job, onClose }: { job: typeof mockData.jobs[0] | undefined; onClose: () => void }) {
  if (!job) return (
    <Card className="border-border bg-card h-full">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <CalendarDays className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Select a job to view details</p>
      </CardContent>
    </Card>
  );

  const revenue = job.yards * job.rate;
  const sc = statusConfig[job.status] || statusConfig.scheduled;

  return (
    <Card className="border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ background: `linear-gradient(135deg, ${sc.bg} 0%, transparent 100%)` }}>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">Job #{job.id}</span>
          <Badge variant="outline" className={`${sc.className} text-[10px]`}>{sc.label}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
        <div className="p-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
            <p className="text-sm font-semibold text-foreground">{job.customer}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{job.contact} · {job.contactPhone}</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{job.address}</span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pump Type</p>
              <p className="text-sm text-foreground mt-0.5">{job.pumpType}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Truck</p>
              <p className="text-sm text-foreground mt-0.5">{job.truck || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Yardage</p>
              <p className="text-sm text-foreground mt-0.5">{job.yards} yds</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Revenue</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">${revenue.toLocaleString()}</p>
            </div>
          </div>

          {job.specialInstructions && (
            <div className="rounded-lg bg-amber-500/8 border-l-[3px] border-amber-500 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-1">Special Instructions</p>
              <p className="text-xs text-muted-foreground">{job.specialInstructions}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Status Timeline</p>
            <div className="space-y-2">
              {job.timeline.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                  )}
                  <span className={`text-xs flex-1 ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.step}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono tabular-nums">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {job.notes && (
            <>
              <Separator />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                <p className="text-xs text-muted-foreground">{job.notes}</p>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

/* ── Alerts Panel ── */
function AlertsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const typeConfig: Record<string, { icon: typeof AlertTriangle; color: string }> = {
    warning: { icon: AlertTriangle, color: '#F59E0B' },
    info:    { icon: Info,          color: '#3B82F6' },
    new:     { icon: Plus,          color: '#10B981' },
    success: { icon: CheckCircle2,  color: '#10B981' },
  };
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute top-14 right-20 w-96" onClick={e => e.stopPropagation()}>
        <Card className="border-border bg-card shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-bold text-foreground">Notifications</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
          <ScrollArea className="max-h-80">
            {mockData.alerts.map(alert => {
              const tc = typeConfig[alert.type] || typeConfig.info;
              return (
                <div
                  key={alert.id}
                  className={`px-4 py-3 border-l-[3px] border-b border-border/50 transition-colors ${
                    !alert.read ? 'bg-amber-500/5' : ''
                  }`}
                  style={{ borderLeftColor: tc.color }}
                >
                  <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                </div>
              );
            })}
          </ScrollArea>
        </Card>
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
    <div className="min-h-screen bg-background text-foreground">
      <Header alertsOpen={alertsOpen} setAlertsOpen={setAlertsOpen} unread={unread} />
      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />

      <div className="p-4 space-y-4">
        {/* Fleet */}
        <div className="grid grid-cols-5 gap-3">
          {mockData.trucks.map(t => (
            <FleetCard key={t.id} truck={t} isSelected={selectedTruckId === t.id} onClick={() => setSelectedTruckId(t.id)} />
          ))}
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Main Area */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <Schedule selectedJobId={selectedJobId} onSelectJob={handleSelectJob} />
            <JobsTable selectedJobId={selectedJobId} onSelectJob={handleSelectJob} />
          </div>
          <div>
            <JobDetail job={selectedJob} onClose={() => setSelectedJobId(null)} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />{mockData.trucks.filter(t => t.status === 'available').length} Available</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />{mockData.trucks.filter(t => t.status === 'on-job').length} On Job</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />{mockData.trucks.filter(t => t.status === 'en-route').length} En Route</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />{mockData.trucks.filter(t => t.status === 'maintenance').length} Down</span>
        </div>
        <span>Core Dispatch v1.0 — Built by <strong className="text-amber-400">Michael Shaw</strong></span>
      </footer>
    </div>
  );
}
