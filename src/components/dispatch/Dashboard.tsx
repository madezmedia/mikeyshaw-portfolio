import { useState, useEffect, useCallback } from 'react';
import mockData from '../../data/mock-dispatch.json';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  'on-job':     { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  'en-route':   { bg: 'bg-blue-500/20',  text: 'text-blue-400',  dot: 'bg-blue-400' },
  'available':  { bg: 'bg-emerald-500/20',text: 'text-emerald-400',dot: 'bg-emerald-400' },
  'maintenance':{ bg: 'bg-red-500/20',   text: 'text-red-400',   dot: 'bg-red-400' },
  'in-progress':{ bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  'confirmed':  { bg: 'bg-emerald-500/20',text: 'text-emerald-400',dot: 'bg-emerald-400' },
  'scheduled':  { bg: 'bg-sky-500/20',   text: 'text-sky-400',   dot: 'bg-sky-400' },
  'tentative':  { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
};

const statusLabels: Record<string, string> = {
  'on-job': 'On Job', 'en-route': 'En Route', 'available': 'Available',
  'maintenance': 'Maintenance', 'in-progress': 'In Progress', 'confirmed': 'Confirmed',
  'scheduled': 'Scheduled', 'tentative': 'Tentative',
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <span className="font-mono text-lg tabular-nums">
      {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} &nbsp;
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

function Header({ alertsOpen, setAlertsOpen }: { alertsOpen: boolean; setAlertsOpen: (v: boolean) => void }) {
  const unread = mockData.alerts.filter(a => !a.read).length;
  return (
    <header className="bg-slate-900/95 border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-900 text-sm">CP</div>
        <div>
          <h1 className="text-lg font-bold text-slate-50 leading-tight">Core Pumping Solutions</h1>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Dispatch Dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <LiveClock />
        <div className="relative">
          <button onClick={() => setAlertsOpen(!alertsOpen)} className="relative p-2 rounded-lg hover:bg-slate-700 transition-colors">
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{unread}</span>}
          </button>
        </div>
        <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">MS</div>
      </div>
    </header>
  );
}

function FleetCard({ truck, isSelected, onClick }: { truck: typeof mockData.trucks[0]; isSelected: boolean; onClick: () => void }) {
  const c = statusColors[truck.status] || statusColors.available;
  const job = truck.currentJob ? mockData.jobs.find(j => j.id === truck.currentJob) : null;
  return (
    <button onClick={onClick} className={`rounded-xl border p-4 transition-all text-left w-full ${isSelected ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/50' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-50 text-lg">{truck.id}</span>
        <span className={`${c.bg} ${c.text} px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${truck.status === 'on-job' ? 'animate-pulse' : ''}`} />
          {statusLabels[truck.status]}
        </span>
      </div>
      <p className="text-sm text-slate-400">{truck.type} — {truck.operator}</p>
      {job && <p className="text-xs text-slate-500 mt-1">#{job.id} {job.customer}</p>}
      <p className="text-xs text-slate-500 mt-1">{truck.hoursToday > 0 ? `${truck.hoursToday} hrs today` : 'No hours today'}</p>
    </button>
  );
}

function Schedule({ selectedJobId, onSelectJob }: { selectedJobId: string | null; onSelectJob: (id: string) => void }) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 6);
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Today's Schedule</h3>
      <div className="relative overflow-x-auto">
        <div className="flex border-b border-slate-700 mb-1 min-w-[700px]">
          {hours.map(h => (
            <div key={h} className="flex-1 text-xs text-slate-500 text-center pb-1">{h > 12 ? h - 12 : h}{h >= 12 ? 'PM' : 'AM'}</div>
          ))}
        </div>
        <div className="relative min-w-[700px]" style={{ height: 200 }}>
          {hours.map(h => (
            <div key={h} className="absolute top-0 bottom-0 border-l border-slate-700/50" style={{ left: `${((h - 6) / 12) * 100}%` }} />
          ))}
          {mockData.jobs.map((job, idx) => {
            const start = toMin(job.startTime);
            const end = toMin(job.endTime);
            const left = ((start - 360) / 720) * 100;
            const width = ((end - start) / 720) * 100;
            const sc = statusColors[job.status] || statusColors.scheduled;
            const isSelected = selectedJobId === job.id;
            return (
              <button key={job.id} onClick={() => onSelectJob(job.id)}
                className={`absolute rounded-lg px-2 py-1.5 text-left transition-all overflow-hidden cursor-pointer
                  ${isSelected ? 'ring-2 ring-amber-400 z-10' : 'hover:brightness-110'}
                  ${sc.bg} border border-current/20`}
                style={{ left: `${left}%`, width: `${width}%`, top: idx * 34 }}>
                <div className="text-xs font-semibold text-slate-100 truncate">#{job.id} {job.customer}</div>
                <div className={`text-xs ${sc.text}`}>{job.truck || 'Unassigned'} · {job.yards} yds</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function JobsTable({ selectedJobId, onSelectJob }: { selectedJobId: string | null; onSelectJob: (id: string) => void }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-4 pt-4 pb-2">Active Jobs</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase border-b border-slate-700">
              <th className="text-left px-4 py-2">Job #</th>
              <th className="text-left px-4 py-2">Customer</th>
              <th className="text-left px-4 py-2">Truck</th>
              <th className="text-left px-4 py-2">Time</th>
              <th className="text-left px-4 py-2">Yards</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockData.jobs.map(job => {
              const sc = statusColors[job.status] || statusColors.scheduled;
              const isSelected = selectedJobId === job.id;
              return (
                <tr key={job.id} onClick={() => onSelectJob(job.id)}
                  className={`border-b border-slate-700/50 cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-700/50'}`}>
                  <td className="px-4 py-2.5 font-mono text-amber-400">#{job.id}</td>
                  <td className="px-4 py-2.5 text-slate-200">{job.customer}</td>
                  <td className="px-4 py-2.5 text-slate-300">{job.truck || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-300">{job.startTime}–{job.endTime}</td>
                  <td className="px-4 py-2.5 text-slate-300">{job.yards}</td>
                  <td className="px-4 py-2.5">
                    <span className={`${sc.bg} ${sc.text} px-2 py-0.5 rounded-full text-xs font-semibold`}>{statusLabels[job.status]}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button className="text-amber-400 hover:text-amber-300 text-xs font-medium">View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JobDetail({ job, onClose }: { job: typeof mockData.jobs[0] | undefined; onClose: () => void }) {
  if (!job) return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
      <p className="text-slate-500 text-sm">Select a job to view details</p>
    </div>
  );
  const revenue = job.yards * job.rate;
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h3 className="font-bold text-slate-50">Job #{job.id}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg">&times;</button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Customer</p>
          <p className="text-slate-100 font-semibold">{job.customer}</p>
          <p className="text-sm text-slate-400">{job.contact} · {job.contactPhone}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Location</p>
          <p className="text-sm text-slate-300">{job.address}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-slate-500 uppercase">Pump</p><p className="text-sm text-slate-200">{job.pumpType}</p></div>
          <div><p className="text-xs text-slate-500 uppercase">Truck</p><p className="text-sm text-slate-200">{job.truck || 'Unassigned'}</p></div>
          <div><p className="text-xs text-slate-500 uppercase">Yards</p><p className="text-sm text-slate-200">{job.yards}</p></div>
          <div><p className="text-xs text-slate-500 uppercase">Revenue</p><p className="text-sm text-emerald-400">${revenue.toLocaleString()}</p></div>
        </div>
        {job.specialInstructions && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Special Instructions</p>
            <p className="text-sm text-slate-300 mt-0.5">{job.specialInstructions}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Status Timeline</p>
          <div className="space-y-2">
            {job.timeline.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full border-2 ${step.done ? 'bg-emerald-400 border-emerald-400' : 'border-slate-600'}`} />
                <div className="flex-1">
                  <span className={`text-sm ${step.done ? 'text-slate-200' : 'text-slate-500'}`}>{step.step}</span>
                </div>
                <span className="text-xs text-slate-500">{step.time}</span>
              </div>
            ))}
          </div>
        </div>
        {job.notes && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Notes</p>
            <p className="text-sm text-slate-400 mt-0.5">{job.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCards() {
  const s = mockData.stats;
  const cards = [
    { label: 'Jobs Today', value: s.jobsToday, suffix: '', icon: '📋' },
    { label: 'Yards Pumped', value: s.yardsPumped.toLocaleString(), suffix: '', icon: '🏗️' },
    { label: 'Revenue', value: `$${s.revenueToday.toLocaleString()}`, suffix: '', icon: '💰' },
    { label: 'On-Time Rate', value: s.onTimeRate, suffix: '%', icon: '⏱️' },
    { label: 'Fleet Utilization', value: s.fleetUtilization, suffix: '%', icon: '🚛' },
  ];
  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map(c => (
        <div key={c.label} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">{c.icon} {c.label}</p>
          <p className="text-2xl font-bold text-slate-50 mt-1">{c.value}{c.suffix}</p>
        </div>
      ))}
    </div>
  );
}

function AlertsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const typeStyles: Record<string, string> = {
    warning: 'border-l-amber-500', info: 'border-l-blue-500', new: 'border-l-emerald-500', success: 'border-l-emerald-400'
  };
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute top-14 right-24 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h4 className="font-semibold text-slate-100">Notifications</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">&times;</button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {mockData.alerts.map(alert => (
            <div key={alert.id} className={`px-4 py-3 border-l-4 ${typeStyles[alert.type] || 'border-l-slate-500'} border-b border-slate-700/50 ${!alert.read ? 'bg-slate-700/30' : ''}`}>
              <p className="text-sm text-slate-200">{alert.message}</p>
              <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>('1247');
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const selectedJob = mockData.jobs.find(j => j.id === selectedJobId);

  const handleSelectJob = useCallback((id: string) => {
    setSelectedJobId(id);
    const job = mockData.jobs.find(j => j.id === id);
    if (job?.truck) setSelectedTruckId(job.truck);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Header alertsOpen={alertsOpen} setAlertsOpen={setAlertsOpen} />
      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />

      <div className="p-4 space-y-4">
        {/* Fleet Cards */}
        <div className="grid grid-cols-5 gap-3">
          {mockData.trucks.map(t => (
            <FleetCard key={t.id} truck={t} isSelected={selectedTruckId === t.id} onClick={() => setSelectedTruckId(t.id)} />
          ))}
        </div>

        {/* Main area */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <Schedule selectedJobId={selectedJobId} onSelectJob={handleSelectJob} />
            <JobsTable selectedJobId={selectedJobId} onSelectJob={handleSelectJob} />
          </div>
          <div>
            <JobDetail job={selectedJob} onClose={() => setSelectedJobId(null)} />
          </div>
        </div>

        {/* Stats */}
        <StatsCards />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 px-6 py-2 flex items-center justify-between text-xs text-slate-500">
        <span>
          {mockData.trucks.filter(t => t.status === 'available').length} Available ·
          {mockData.trucks.filter(t => t.status === 'on-job').length} On Job ·
          {mockData.trucks.filter(t => t.status === 'en-route').length} En Route ·
          {mockData.trucks.filter(t => t.status === 'maintenance').length} Down
        </span>
        <span>Core Dispatch v1.0 · Built by Michael Shaw</span>
      </footer>
    </div>
  );
}