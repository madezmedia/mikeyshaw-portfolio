import React, { useState } from 'react';

interface ServiceItem {
  id: string;
  name: string;
  price: string;
  baseComplexity: number;
  type: 'retainer' | 'flat' | 'hybrid';
  description: string;
  bullets: string[];
  ctaText: string;
  squareAction: 'quote' | 'checkout' | 'appointment' | 'link';
  linkUrl: string;
}

const services: ServiceItem[] = [
  {
    id: 'ai-assessment',
    name: '$499 AI Tools Assessment',
    price: '$499 Flat Fee',
    baseComplexity: 20,
    type: 'flat',
    description: '90-Min White-Glove Audit of your operational leaks, tool stack, and workflow bottlenecks. Identifies instant ROI wins and builds your custom fleet architecture roadmap.',
    bullets: [
      '90-minute live operational & workflow audit',
      'Audit of 7 core business leak vectors',
      'ACMI memory framework suitability check',
      'Actionable ROI & implementation blueprint',
      'Full 100% credit toward private fleet deployment'
    ],
    ctaText: 'Claim $499 Audit →',
    squareAction: 'link',
    linkUrl: '/assessment'
  },
  {
    id: 'fleet-deployment',
    name: '$4,500 Private ACMI Fleet Deployment',
    price: '$4,500 One-Time',
    baseComplexity: 60,
    type: 'hybrid',
    description: 'Turnkey private autonomous AI fleet built on dedicated infrastructure. Includes 2 Hermes agents, background crons, Mattermost/Slack bridge, and 30 days of white-glove onboarding.',
    bullets: [
      'Dedicated client Redis instance (hard privacy rule)',
      '2 Hermes autonomous agents configured for ops',
      'Automated background crons & task schedulers',
      'Mattermost / Slack messaging channel bridge',
      '30-day dedicated onboarding & ops support'
    ],
    ctaText: 'Deploy ACMI Fleet →',
    squareAction: 'link',
    linkUrl: '/fleet'
  },
  {
    id: 'fleet-retainer',
    name: '$2,500/mo Managed ACMI Fleet Retainer',
    price: '$2,500 / Month',
    baseComplexity: 85,
    type: 'retainer',
    description: 'Virtual AI Fleet CTO & SRE oversight. Continuous monitoring of background crons, weekly memory rollups, prompt engineering, and model upgrades to keep your fleet at peak performance.',
    bullets: [
      'Virtual AI Fleet CTO & SRE management',
      'Continuous 24/7 cron & fleet health monitoring',
      'Weekly memory rollups & signal synthesis',
      'Ongoing agent prompt & model upgrades',
      'Priority 4-hr SLA for system modifications'
    ],
    ctaText: 'Explore Managed Retainer →',
    squareAction: 'link',
    linkUrl: '/fleet'
  }
];

interface CustomService {
  type: string;
  price: string;
  name: string;
  desc: string;
  cta: string;
  href: string;
}

const customServices: CustomService[] = [
  {
    type: 'Hybrid',
    price: 'Custom retainer',
    name: 'Custom Agentic Fleet Deployment',
    desc: 'Autonomous multi-agent systems for production-scale operations — ACMI memory bus, Supabase + Redis, 45-day performance guarantee.',
    cta: 'Build custom quote',
    href: 'https://cal.com/mad-ez-media/ai-automation-discovery'
  },
  {
    type: 'Retainer',
    price: 'Monthly advisory',
    name: 'Executive AI Advisory for SMBs',
    desc: 'Deeper than coaching: weekly architecture reviews, custom low-code tooling, and dedicated Slack support with a 4-hour SLA.',
    cta: 'Schedule advisory brief',
    href: 'https://cal.com/mad-ez-media/ai-automation-discovery'
  },
  {
    type: 'Flat',
    price: 'Project basis',
    name: 'Custom Media Pipeline Setup',
    desc: 'Automated media synthesis — Fal.ai generation, RunPod lip-sync video, Deepgram voice, and auto-posting to social.',
    cta: 'Request scope',
    href: 'mailto:michael@madezmedia.com?subject=Custom%20Media%20Pipeline%20Scope%20Request'
  }
];

interface WhopTier {
  name: string;
  price: string;
  badge: string;
  desc: string;
  features: string[];
  url: string;
}

const whopTiers: WhopTier[] = [
  {
    name: 'Tier 1: Code Blueprints',
    price: 'Free / Community',
    badge: 'BLUEPRINTS',
    desc: 'Access entry-level code crawlers, simple automation scripts, and foundational ACMI bus schema files.',
    features: [
      'Basic Yelp/Places lead crawlers',
      'ACMI core v1.5 schema templates',
      'Weekly open-source developer updates',
      'Community Discord access'
    ],
    url: 'https://whop.com/checkout/plan_2Tz2QipTSn0O9'
  },
  {
    name: 'Tier 2: Pro Creator Suite',
    price: '$97/mo',
    badge: 'CREATOR PRO',
    desc: 'Unlock premium AI creator tools, the EZ-360 visual canvas, and advanced local pipeline templates.',
    features: [
      'EZ-360 Visual Creator Canvas access',
      'RunPod lip-sync video templates',
      'Upstash Redis billing/credits gateway logic',
      'Private Discord channels with direct developer chat'
    ],
    url: 'https://whop.com/checkout/plan_2Tz2QipTSn0O9'
  },
  {
    name: 'Tier 3: Enterprise Swarms',
    price: '$197/mo',
    badge: 'ENTERPRISE',
    desc: 'Priority assistance, active debugging slots, and full swarm orchestration templates for complex workflows.',
    features: [
      'Active agent debugging & monthly 1-on-1 code audit',
      'Direct API integrations (Composio, Fal, Deepgram specs)',
      'Pre-built multi-agent workflow systems',
      'Priority roadmap suggestions & early tool releases'
    ],
    url: 'https://whop.com/checkout/plan_2Tz2QipTSn0O9'
  }
];

export default function ServicesAndOffers() {
  const [selectedService, setSelectedService] = useState<string>('fleet-deployment');
  
  // Quote wizard state
  const [companyName, setCompanyName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [databaseOption, setDatabaseOption] = useState(false);
  const [telemetryOption, setTelemetryOption] = useState(false);
  const [customCrmOption, setCustomCrmOption] = useState(false);
  const [timelineSpeed, setTimelineSpeed] = useState<number>(3); // 1 = Urgent (2 wks), 3 = Normal (6 wks), 6 = Extended (12 wks)

  // Tracking state
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteResponse, setQuoteResponse] = useState<any>(null);

  const currentService = services.find(s => s.id === selectedService) || services[1];

  // Calculate project complexity score instead of exact price
  const calculateComplexity = () => {
    let score = currentService.baseComplexity;
    if (selectedService === 'fleet-deployment' || selectedService === 'fleet-retainer') {
      if (databaseOption) score += 15;
      if (telemetryOption) score += 20;
      if (customCrmOption) score += 10;
      if (timelineSpeed === 1) score += 15;
    } else if (selectedService === 'ai-assessment') {
      if (timelineSpeed === 1) score += 15;
    }
    return Math.min(score, 100);
  };

  const getComplexityTier = (score: number) => {
    if (score < 40) return 'Standard Integration';
    if (score >= 40 && score < 70) return 'Pro Hybrid Architecture';
    return 'Enterprise Swarm Deployment';
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !emailAddress) {
      alert('Please fill out your Company Name and Email Address.');
      return;
    }

    setSubmittingQuote(true);

    const generatedInvoiceId = 'sq-inv_' + Math.random().toString(36).substring(2, 11).toUpperCase();
    const generatedQuoteId = 'Q-' + Math.floor(100000 + Math.random() * 900000);
    const score = calculateComplexity();
    const currentLeadId = localStorage.getItem('bentley_lead_id') || '';

    const quoteDetails = {
      leadId: currentLeadId,
      invoiceId: generatedInvoiceId,
      quoteId: generatedQuoteId,
      service: currentService.name,
      company: companyName,
      email: emailAddress,
      addons: {
        databaseHardening: databaseOption,
        telemetryPortal: telemetryOption,
        crmIntegration: customCrmOption
      },
      timelineWeeks: timelineSpeed === 1 ? 2 : timelineSpeed === 3 ? 6 : 12,
      complexityScore: score,
      complexityTier: getComplexityTier(score),
      status: 'QUOTE_STAGED',
      merchantNotes: 'Direct Square merchant dispatch queued. Integration verified.',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/ingest-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteDetails)
      });

      if (!response.ok) throw new Error('Failed to ingest lead in ACMI');

      const data = await response.json();
      
      setQuoteResponse(quoteDetails);
      
      // Dispatch custom event to notify ChatWidget of session identified/merged
      const event = new CustomEvent('squareQuoteSubmitted', {
        detail: {
          leadId: data.leadId,
          quoteId: generatedQuoteId
        }
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.warn('Backend lead ingestion offline. Falling back to local state.', err);
      setQuoteResponse(quoteDetails);
    } finally {
      setSubmittingQuote(false);
    }
  };

  const resetForm = () => {
    setQuoteResponse(null);
    setCompanyName('');
    setEmailAddress('');
    setDatabaseOption(false);
    setTelemetryOption(false);
    setCustomCrmOption(false);
    setTimelineSpeed(3);
  };

  return (
    <div className="w-full space-y-24">
      {/* Services Listing Section */}
      <div id="services-offering" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div 
            key={service.id} 
            className={`flex flex-col justify-between p-8 bg-[var(--ms-surface)] border rounded-2xl transition-all duration-300 shadow-sm ${
              selectedService === service.id 
                ? 'border-[var(--ms-text)] ring-2 ring-[var(--ms-text)]/10 translate-y-[-2px]' 
                : 'border-[var(--ms-text)]/10 hover:border-[var(--ms-text)]/30'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="font-label-mono text-[9px] uppercase tracking-widest px-2.5 py-1 bg-[var(--ms-text)]/5 text-[var(--ms-text)] rounded-full font-bold">
                  {service.type.toUpperCase()} SERVICE
                </span>
                <span className="font-label-mono text-xs font-semibold text-accent-pink">
                  {service.price}
                </span>
              </div>
              <h3 className="font-heading text-2xl font-extrabold text-[var(--ms-text)] mb-4 leading-tight">
                {service.name}
              </h3>
              <p className="font-sans text-sm text-[var(--ms-text)]/75 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <div className="h-[1px] bg-[var(--ms-text)]/10 w-full my-6"></div>
              
              <h4 className="font-label-mono text-[9px] text-[var(--ms-muted)] uppercase tracking-wider mb-3 font-bold">Included Specifications</h4>
              <ul className="space-y-2.5">
                {service.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[var(--ms-text)]/80 font-sans">
                    <span className="text-accent-pink font-bold">—</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--ms-text)]/5">
              <a 
                href={service.linkUrl}
                onClick={() => setSelectedService(service.id)}
                className={`w-full block text-center py-3.5 px-6 font-sans font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-200 cursor-pointer no-underline ${
                  selectedService === service.id 
                    ? 'bg-[var(--ms-btn-bg)] shadow-[var(--ms-btn-shadow)] text-[var(--ms-btn-fg)] shadow-md' 
                    : 'bg-[var(--ms-text)]/5 text-[var(--ms-text)] hover:bg-[var(--ms-text)]/10'
                }`}
              >
                {service.ctaText}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Engagements — quote required */}
      <div id="custom-engagements" className="space-y-6">
        <span className="font-label-mono text-[10px] uppercase tracking-[0.3em] text-[var(--ms-muted)] font-bold block">
          Custom · Quote required · Existing engagements
        </span>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {customServices.map((svc) => (
            <div
              key={svc.name}
              className="flex flex-col gap-2.5 p-6 bg-[var(--ms-surface)] border border-[var(--ms-text)]/10 hover:border-[var(--ms-text)]/30 rounded-2xl transition-all duration-300"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-label-mono text-[8.5px] uppercase tracking-[0.2em] bg-[var(--ms-text)]/5 px-2.5 py-1 rounded-full font-bold text-[var(--ms-text)]">
                  {svc.type}
                </span>
                <span className="font-label-mono text-[10px] font-bold text-accent-pink text-right">
                  {svc.price}
                </span>
              </div>
              <strong className="font-heading text-lg text-[var(--ms-text)] leading-tight">{svc.name}</strong>
              <p className="font-sans text-xs leading-relaxed text-[var(--ms-text)]/70">{svc.desc}</p>
              <a
                href={svc.href}
                target={svc.href.startsWith('http') ? '_blank' : undefined}
                rel={svc.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="mt-auto pt-2 font-label-mono text-[9.5px] uppercase tracking-[0.16em] font-bold text-[var(--ms-text)] hover:text-accent-pink no-underline"
              >
                {svc.cta} →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Square Integration & Quote Request Panel */}
      <div className="bg-[var(--ms-ground)] border border-[var(--ms-text)]/15 rounded-2xl overflow-hidden shadow-md">
        <div className="bg-[var(--ms-inverse-bg)] px-8 py-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--ms-text)]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--ms-blue)] animate-pulse"></span>
              <span className="font-label-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ms-accent-text)] font-bold">Square Merchant Engine</span>
            </div>
            <h3 className="font-heading text-xl font-bold">Inquire & Request Custom Quote</h3>
          </div>
          <div className="bg-[var(--ms-surface)]/10 px-4 py-1.5 rounded-lg border border-white/10 font-label-mono text-xs">
            Client Selected: <span className="text-accent-yellow font-bold uppercase">{currentService.id.replace('-', ' ')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left: Customizer inputs */}
          <div className="lg:col-span-7 p-8 border-b lg:border-b-0 lg:border-r border-[var(--ms-text)]/10 space-y-6">
            {!quoteResponse ? (
              <form onSubmit={handleQuoteSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-mono text-[10px] uppercase tracking-wider text-[var(--ms-muted)] mb-2 font-bold">Company Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Acme Automation Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--ms-surface)] border border-[var(--ms-text)]/15 rounded-lg text-sm text-[var(--ms-text)] placeholder-[var(--ms-text)]/40 focus:outline-none focus:border-[var(--ms-text)]"
                    />
                  </div>
                  <div>
                    <label className="block font-label-mono text-[10px] uppercase tracking-wider text-[var(--ms-muted)] mb-2 font-bold">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="exec@company.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--ms-surface)] border border-[var(--ms-text)]/15 rounded-lg text-sm text-[var(--ms-text)] placeholder-[var(--ms-text)]/40 focus:outline-none focus:border-[var(--ms-text)]"
                    />
                  </div>
                </div>

                {/* Show custom options for fleet services */}
                {(selectedService === 'fleet-deployment' || selectedService === 'fleet-retainer') && (
                  <div className="space-y-4">
                    <label className="block font-label-mono text-[10px] uppercase tracking-wider text-[var(--ms-muted)] mb-2 font-bold">Architecture Upgrades & Extensions</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className={`flex flex-col justify-between p-4 bg-[var(--ms-surface)] border rounded-lg cursor-pointer transition-all ${databaseOption ? 'border-[var(--ms-text)] bg-[var(--ms-text)]/5' : 'border-[var(--ms-text)]/10 hover:border-[var(--ms-text)]/20'}`}>
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            checked={databaseOption} 
                            onChange={(e) => setDatabaseOption(e.target.checked)}
                            className="mt-1 accent-[var(--ms-inverse-bg)]"
                          />
                          <div>
                            <span className="block font-sans text-xs font-bold text-[var(--ms-text)]">Database Hardening</span>
                            <span className="block font-label-mono text-[9px] text-[var(--ms-muted)] mt-1">
                              Integration Upgrade
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className={`flex flex-col justify-between p-4 bg-[var(--ms-surface)] border rounded-lg cursor-pointer transition-all ${telemetryOption ? 'border-[var(--ms-text)] bg-[var(--ms-text)]/5' : 'border-[var(--ms-text)]/10 hover:border-[var(--ms-text)]/20'}`}>
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            checked={telemetryOption} 
                            onChange={(e) => setTelemetryOption(e.target.checked)}
                            className="mt-1 accent-[var(--ms-inverse-bg)]"
                          />
                          <div>
                            <span className="block font-sans text-xs font-bold text-[var(--ms-text)]">Telemetry Dashboard</span>
                            <span className="block font-label-mono text-[9px] text-[var(--ms-muted)] mt-1">
                              ACMI Live Portal
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className={`flex flex-col justify-between p-4 bg-[var(--ms-surface)] border rounded-lg cursor-pointer transition-all ${customCrmOption ? 'border-[var(--ms-text)] bg-[var(--ms-text)]/5' : 'border-[var(--ms-text)]/10 hover:border-[var(--ms-text)]/20'}`}>
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            checked={customCrmOption} 
                            onChange={(e) => setCustomCrmOption(e.target.checked)}
                            className="mt-1 accent-[var(--ms-inverse-bg)]"
                          />
                          <div>
                            <span className="block font-sans text-xs font-bold text-[var(--ms-text)]">CRM Synced Flow</span>
                            <span className="block font-label-mono text-[9px] text-[var(--ms-muted)] mt-1">
                              API Webhook Sync
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-label-mono text-[10px] uppercase tracking-wider text-[var(--ms-muted)] font-bold">Project Dispatch Speed</label>
                    <span className="font-label-mono text-[10px] text-accent-pink font-bold">
                      {timelineSpeed === 1 ? 'URGENT DISPATCH (2 Wks)' : timelineSpeed === 3 ? 'STANDARD TRACK (6 Wks)' : 'EXTENDED TIMELINE (12 Wks)'}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="6" 
                    step="2"
                    value={timelineSpeed}
                    onChange={(e) => setTimelineSpeed(Number(e.target.value))}
                    className="w-full h-1 bg-[var(--ms-text)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--ms-inverse-bg)]"
                  />
                  <div className="flex justify-between font-label-mono text-[9px] text-[var(--ms-muted)] mt-1.5 uppercase font-semibold">
                    <span>Urgent SLA</span>
                    <span>Standard</span>
                    <span>Extended</span>
                  </div>
                </div>

                <div className="pt-4">
                  {currentService.squareAction === 'appointment' ? (
                    <a 
                      href="https://cal.com/mad-ez-media/ai-automation-discovery"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-block text-center py-4 bg-[var(--ms-btn-bg)] shadow-[var(--ms-btn-shadow)] text-[var(--ms-btn-fg)] font-sans font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[var(--ms-btn-bg)] transition-all cursor-pointer shadow-md no-underline"
                    >
                      Book strategy brief on Cal.com
                    </a>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={submittingQuote}
                      className="w-full py-4 bg-[var(--ms-btn-bg)] shadow-[var(--ms-btn-shadow)] text-[var(--ms-btn-fg)] font-sans font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[var(--ms-btn-bg)] transition-all cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {submittingQuote ? 'Communicating with Square API...' : 'Submit Architecture Intake & Request Quote'}
                    </button>
                  )}
                </div>
              </form>
            ) : (
              // Success Screen - Simulated Deep Square Tracking Dashboard
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 bg-[var(--ms-text)]/5 border border-[var(--ms-text)]/10 rounded-xl space-y-4">
                  <div className="flex items-center gap-3 text-[var(--ms-text)] font-sans font-bold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Square Quote Intake Complete</span>
                  </div>
                  
                  <p className="font-sans text-xs text-[var(--ms-text)]/80 leading-relaxed">
                    Mikey's AI Sales Co-Pilot has validated your custom setup request. A pre-filled Square Invoice proposal has been structured with direct tracking coordinates.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 font-label-mono text-[10px] uppercase text-[var(--ms-text)]/70">
                    <div>
                      <span className="block text-[var(--ms-muted)] font-bold">Square Invoice ID</span>
                      <span className="block text-sm font-semibold tracking-normal mt-0.5">{quoteResponse.invoiceId}</span>
                    </div>
                    <div>
                      <span className="block text-[var(--ms-muted)] font-bold">Quote Track Reference</span>
                      <span className="block text-sm font-semibold tracking-normal mt-0.5 text-accent-pink">{quoteResponse.quoteId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-2">
                  <a 
                    href={`mailto:michael@madezmedia.com?subject=Square%20Proposal%20Inquiry%20[${quoteResponse.quoteId}]&body=Hi%20Mikey,%0D%0A%0D%0AI%20have%20staged%20a%20Square%20quote%20for%20the%20${encodeURIComponent(quoteResponse.service)}.%0D%0A%0D%0AInvoice%20ID:%20${quoteResponse.invoiceId}%0D%0AComplexity%20Tier:%20${encodeURIComponent(quoteResponse.complexityTier)}%0D%0ACompany:%20${encodeURIComponent(quoteResponse.company)}%0D%0AEmail:%20${encodeURIComponent(quoteResponse.email)}%0D%0A%0D%0APlease%20review%20and%20send%20over%20the%20official%20Square%20agreement.`}
                    className="flex-1 text-center py-3.5 bg-[var(--ms-btn-bg)] shadow-[var(--ms-btn-shadow)] text-[var(--ms-btn-fg)] font-sans font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[var(--ms-btn-bg)] transition-all no-underline shadow-sm"
                  >
                    Confirm & Send Email Inquiry
                  </a>
                  <button 
                    onClick={resetForm}
                    className="px-6 py-3.5 bg-[var(--ms-text)]/5 text-[var(--ms-text)] font-sans font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[var(--ms-text)]/10 transition-all cursor-pointer"
                  >
                    Build Another Quote
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Telemetry Preview Panel */}
          <div className="lg:col-span-5 p-8 bg-[var(--ms-ground)] flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <span className="font-label-mono text-[9px] uppercase tracking-widest text-[var(--ms-muted)] font-bold block">Telemetry Ledger & Scope</span>
              
              <div className="space-y-4">
                <div className="flex justify-between items-baseline text-[var(--ms-text)] border-b border-[var(--ms-text)]/10 pb-2.5">
                  <span className="font-sans text-sm font-semibold">{currentService.name}</span>
                  <span className="font-label-mono text-[10px] font-bold text-accent-pink uppercase">Intake Active</span>
                </div>

                <div className="space-y-2 text-xs text-[var(--ms-text)]/70 font-sans">
                  <div className="flex justify-between items-center">
                    <span>Base Scope Level:</span>
                    <span className="font-label-mono text-[10px] font-bold text-[var(--ms-text)]">{currentService.baseComplexity} / 100</span>
                  </div>

                  {(selectedService === 'fleet-deployment' || selectedService === 'fleet-retainer') && (
                    <div className="space-y-2">
                      {databaseOption && (
                        <div className="flex justify-between items-center">
                          <span>+ Dedicated DB Hardening</span>
                          <span className="font-label-mono text-[10px] font-bold text-[var(--ms-text)]">+15</span>
                        </div>
                      )}
                      {telemetryOption && (
                        <div className="flex justify-between items-center">
                          <span>+ ACMI Telemetry Live Portal</span>
                          <span className="font-label-mono text-[10px] font-bold text-[var(--ms-text)]">+20</span>
                        </div>
                      )}
                      {customCrmOption && (
                        <div className="flex justify-between items-center">
                          <span>+ CRM API & Webhook Syncs</span>
                          <span className="font-label-mono text-[10px] font-bold text-[var(--ms-text)]">+10</span>
                        </div>
                      )}
                    </div>
                  )}

                  {timelineSpeed === 1 && (
                    <div className="flex justify-between items-center text-accent-pink font-bold">
                      <span>+ Urgent 2-Week SLA Priority</span>
                      <span className="font-label-mono text-[10px]">+15</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[var(--ms-surface)] border border-[var(--ms-text)]/10 p-5 rounded-xl space-y-4">
              <div className="flex flex-col gap-1">
                <span className="font-label-mono text-[9px] uppercase tracking-wider text-[var(--ms-muted)] font-bold">COMPLEXITY TIER</span>
                <span className="font-heading text-lg font-black text-[var(--ms-text)] leading-tight">
                  {getComplexityTier(calculateComplexity())}
                </span>
                <div className="w-full bg-[var(--ms-text)]/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-[var(--ms-inverse-bg)] h-full transition-all duration-300"
                    style={{ width: `${calculateComplexity()}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="h-[1px] bg-[var(--ms-text)]/10 w-full"></div>
              
              <div className="flex justify-between items-baseline">
                <span className="font-label-mono text-[9px] uppercase tracking-wider text-[var(--ms-muted)] font-bold">ESTIMATED RATE</span>
                <span className="font-sans text-xs font-bold text-accent-pink uppercase">
                  {currentService.price}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Whop Pricing Grid */}
      <div className="space-y-12">
        <div className="text-center space-y-3">
          <span className="font-label-mono text-accent-pink text-xs uppercase tracking-[0.4em] font-semibold">COMMUNITY & DIGITAL ASSETS</span>
          <h2 className="font-heading text-4xl font-extrabold text-[var(--ms-text)]">Whop Membership Tiers</h2>
          <p className="font-sans text-[var(--ms-text)]/70 max-w-xl mx-auto text-sm">
            Self-operate Mikey Shaw's agent blueprints, join the live workspace, or get high-priority engineering swarm access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whopTiers.map((tier, idx) => (
            <div 
              key={idx}
              className="flex flex-col justify-between p-8 bg-[var(--ms-surface)] border border-[var(--ms-text)]/10 hover:border-[var(--ms-text)]/25 hover:shadow-lg transition-all duration-300 rounded-2xl relative"
            >
              <div>
                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-label-mono text-[9px] uppercase tracking-widest text-[var(--ms-muted)] font-bold">
                    {tier.badge}
                  </span>
                  <span className="font-heading text-2xl font-black text-[var(--ms-text)]">
                    {tier.price}
                  </span>
                </div>
                
                <h3 className="font-sans font-bold text-lg text-[var(--ms-text)] mb-3">{tier.name}</h3>
                <p className="font-sans text-xs text-[var(--ms-text)]/70 leading-relaxed mb-6">{tier.desc}</p>
                
                <div className="h-[1px] bg-[var(--ms-text)]/10 w-full my-6"></div>
                
                <ul className="space-y-3">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[var(--ms-text)]/80">
                      <span className="text-[var(--ms-accent-text)] font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6">
                <a 
                  href={tier.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-block text-center py-3.5 bg-[var(--ms-btn-bg)] shadow-[var(--ms-btn-shadow)] hover:bg-[var(--ms-btn-bg)] text-[var(--ms-btn-fg)] font-sans font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-200 shadow-sm no-underline"
                >
                  Join Membership
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
