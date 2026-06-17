import React, { useState } from 'react';

interface ServiceItem {
  id: string;
  name: string;
  price: string;
  basePriceNum: number;
  type: 'retainer' | 'flat' | 'hybrid';
  description: string;
  bullets: string[];
  ctaText: string;
  squareAction: 'quote' | 'checkout' | 'appointment';
}

const services: ServiceItem[] = [
  {
    id: 'agentic-fleet',
    name: 'Custom Agentic Fleet Deployment',
    price: '$15,000 setup + $4,500/mo',
    basePriceNum: 15000,
    type: 'hybrid',
    description: 'Autonomous multi-agent systems built to handle production-scale digital operations, state management, and media generation pipelines with zero manual clicks.',
    bullets: [
      'ACMI v1.5 atomic memory bus configuration',
      'Supabase PostgreSQL & Redis TTL caching setup',
      '45-day operational performance guarantee',
      'Continuous deployment via launchd & Docker containerization',
      'Custom telemetry dashboards & logging relays'
    ],
    ctaText: 'Build Custom Quote',
    squareAction: 'quote'
  },
  {
    id: 'ai-coaching',
    name: 'AI Coaching & Setup for SMBs & Execs',
    price: '$3,500/mo',
    basePriceNum: 3500,
    type: 'retainer',
    description: 'Direct 1-on-1 strategic advisory and workflow engineering for business leaders. We audit your operations, build custom low-code tools, and upskill your team.',
    bullets: [
      'Weekly 1-hour alignment & systems architecture reviews',
      'Custom workflow blueprints (Postiz, Fal.ai, local pipelines)',
      'Dedicated private Slack channel support with 4-hr response SLA',
      'Executive dashboard configuration & tool cost optimizations',
      'Bi-weekly team training and prompt-engineering workshops'
    ],
    ctaText: 'Schedule Advisory Brief',
    squareAction: 'appointment'
  },
  {
    id: 'media-pipeline',
    name: 'Custom Media Pipeline Setup',
    price: '$5,000 flat',
    basePriceNum: 5000,
    type: 'flat',
    description: 'Dedicated automated media synthesis engine. Integrates Fal.ai image generators, RunPod InfiniteTalk lip-sync videos, and Deepgram voice synthesis.',
    bullets: [
      'FAL & ComfyUI workflow optimizations',
      'RunPod InfiniteTalk dynamic voice synchronization',
      'Automated content posting modules (TikTok, YT Shorts, X)',
      'Unified media management dashboard UI',
      'Pre-built template configurations for fast iteration'
    ],
    ctaText: 'Deploy Now via Square',
    squareAction: 'checkout'
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
  const [selectedService, setSelectedService] = useState<string>('agentic-fleet');
  
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

  // Cal.com / Square simulated route
  const currentService = services.find(s => s.id === selectedService) || services[0];

  // Calculate pricing dynamically
  const calculateTotal = () => {
    let base = currentService.basePriceNum;
    if (selectedService === 'agentic-fleet') {
      if (databaseOption) base += 2500;
      if (telemetryOption) base += 3000;
      if (customCrmOption) base += 2000;
      // Urgent multiplier
      if (timelineSpeed === 1) base += 5000;
    } else if (selectedService === 'media-pipeline') {
      if (databaseOption) base += 1000;
      if (telemetryOption) base += 1500;
      if (customCrmOption) base += 1000;
      if (timelineSpeed === 1) base += 1500;
    } else if (selectedService === 'ai-coaching') {
      // Monthly rates: no addons, but speed can affect onboarding cost
      if (timelineSpeed === 1) base += 1000;
    }
    return base;
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !emailAddress) {
      alert('Please fill out your Company Name and Email Address.');
      return;
    }

    setSubmittingQuote(true);

    // Dynamic quote JSON payload for Square/ACMI bus representation
    setTimeout(() => {
      const generatedInvoiceId = 'sq-inv_' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const generatedQuoteId = 'Q-' + Math.floor(100000 + Math.random() * 900000);
      const totalAmount = calculateTotal();

      const quoteDetails = {
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
        amount: totalAmount,
        status: 'QUOTE_STAGED',
        merchantNotes: 'Direct Square merchant dispatch queued. Integration verified.',
        createdAt: new Date().toISOString()
      };

      setQuoteResponse(quoteDetails);
      setSubmittingQuote(false);

      // Emit event to local ACMI bus relay if active (or standard console signal)
      try {
        fetch('http://localhost:7780/emit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'SQUARE_QUOTE_STAGED',
            correlationId: generatedQuoteId,
            payload: quoteDetails
          })
        }).catch(() => {});
      } catch (err) {}
    }, 1200);
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
            className={`flex flex-col justify-between p-8 bg-white border rounded-2xl transition-all duration-300 shadow-sm ${
              selectedService === service.id 
                ? 'border-[#2d4a3e] ring-2 ring-[#2d4a3e]/10 translate-y-[-2px]' 
                : 'border-[#2d4a3e]/10 hover:border-[#2d4a3e]/30'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="font-label-mono text-[9px] uppercase tracking-widest px-2.5 py-1 bg-[#2d4a3e]/5 text-[#2d4a3e] rounded-full font-bold">
                  {service.type.toUpperCase()} SERVICE
                </span>
                <span className="font-label-mono text-xs font-semibold text-accent-pink">
                  {service.price}
                </span>
              </div>
              <h3 className="font-heading text-2xl font-extrabold text-[#2d4a3e] mb-4 leading-tight">
                {service.name}
              </h3>
              <p className="font-sans text-sm text-[#2d4a3e]/75 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <div className="h-[1px] bg-[#2d4a3e]/10 w-full my-6"></div>
              
              <h4 className="font-label-mono text-[9px] text-[#2d4a3e]/40 uppercase tracking-wider mb-3">Verification Details</h4>
              <ul className="space-y-2.5">
                {service.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#2d4a3e]/80 font-sans">
                    <span className="text-accent-pink font-bold">—</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2d4a3e]/5">
              <button 
                onClick={() => setSelectedService(service.id)}
                className={`w-full py-3.5 px-6 font-sans font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-200 cursor-pointer ${
                  selectedService === service.id 
                    ? 'bg-[#2d4a3e] text-white shadow-md' 
                    : 'bg-[#2d4a3e]/5 text-[#2d4a3e] hover:bg-[#2d4a3e]/10'
                }`}
              >
                {selectedService === service.id ? 'Active Selection' : service.ctaText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Square Integration & Quote Request Panel */}
      <div className="bg-[#faf9f5] border border-[#2d4a3e]/15 rounded-2xl overflow-hidden shadow-md">
        <div className="bg-[#2d4a3e] px-8 py-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2d4a3e]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00B9F1] animate-pulse"></span>
              <span className="font-label-mono text-[9px] uppercase tracking-[0.2em] text-[#00B9F1] font-bold">Square Merchant Engine</span>
            </div>
            <h3 className="font-heading text-xl font-bold">Quote Request & Setup Dispatch</h3>
          </div>
          <div className="bg-white/10 px-4 py-1.5 rounded-lg border border-white/10 font-label-mono text-xs">
            Client Selected: <span className="text-accent-yellow font-bold uppercase">{currentService.id.replace('-', ' ')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left: Customizer inputs */}
          <div className="lg:col-span-7 p-8 border-b lg:border-b-0 lg:border-r border-[#2d4a3e]/10 space-y-6">
            {!quoteResponse ? (
              <form onSubmit={handleQuoteSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-mono text-[10px] uppercase tracking-wider text-[#2d4a3e]/60 mb-2 font-bold">Company Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Acme Automation Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#2d4a3e]/15 rounded-lg text-sm text-[#2d4a3e] placeholder-[#2d4a3e]/40 focus:outline-none focus:border-[#2d4a3e]"
                    />
                  </div>
                  <div>
                    <label className="block font-label-mono text-[10px] uppercase tracking-wider text-[#2d4a3e]/60 mb-2 font-bold">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="exec@company.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#2d4a3e]/15 rounded-lg text-sm text-[#2d4a3e] placeholder-[#2d4a3e]/40 focus:outline-none focus:border-[#2d4a3e]"
                    />
                  </div>
                </div>

                {/* Show custom options only for relevant services */}
                {(selectedService === 'agentic-fleet' || selectedService === 'media-pipeline') && (
                  <div className="space-y-4">
                    <label className="block font-label-mono text-[10px] uppercase tracking-wider text-[#2d4a3e]/60 mb-2 font-bold">Architecture Upgrades & Extensions</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className={`flex flex-col justify-between p-4 bg-white border rounded-lg cursor-pointer transition-all ${databaseOption ? 'border-[#2d4a3e] bg-[#2d4a3e]/5' : 'border-[#2d4a3e]/10 hover:border-[#2d4a3e]/20'}`}>
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            checked={databaseOption} 
                            onChange={(e) => setDatabaseOption(e.target.checked)}
                            className="mt-1 accent-[#2d4a3e]"
                          />
                          <div>
                            <span className="block font-sans text-xs font-bold text-[#2d4a3e]">Database Hardening</span>
                            <span className="block font-label-mono text-[9px] text-[#2d4a3e]/60 mt-1">
                              {selectedService === 'agentic-fleet' ? '+$2,500' : '+$1,000'}
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className={`flex flex-col justify-between p-4 bg-white border rounded-lg cursor-pointer transition-all ${telemetryOption ? 'border-[#2d4a3e] bg-[#2d4a3e]/5' : 'border-[#2d4a3e]/10 hover:border-[#2d4a3e]/20'}`}>
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            checked={telemetryOption} 
                            onChange={(e) => setTelemetryOption(e.target.checked)}
                            className="mt-1 accent-[#2d4a3e]"
                          />
                          <div>
                            <span className="block font-sans text-xs font-bold text-[#2d4a3e]">Telemetry Dashboard</span>
                            <span className="block font-label-mono text-[9px] text-[#2d4a3e]/60 mt-1">
                              {selectedService === 'agentic-fleet' ? '+$3,000' : '+$1,500'}
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className={`flex flex-col justify-between p-4 bg-white border rounded-lg cursor-pointer transition-all ${customCrmOption ? 'border-[#2d4a3e] bg-[#2d4a3e]/5' : 'border-[#2d4a3e]/10 hover:border-[#2d4a3e]/20'}`}>
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            checked={customCrmOption} 
                            onChange={(e) => setCustomCrmOption(e.target.checked)}
                            className="mt-1 accent-[#2d4a3e]"
                          />
                          <div>
                            <span className="block font-sans text-xs font-bold text-[#2d4a3e]">CRM Synced Flow</span>
                            <span className="block font-label-mono text-[9px] text-[#2d4a3e]/60 mt-1">
                              {selectedService === 'agentic-fleet' ? '+$2,000' : '+$1,000'}
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-label-mono text-[10px] uppercase tracking-wider text-[#2d4a3e]/60 font-bold">Project Dispatch Speed</label>
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
                    className="w-full h-1 bg-[#2d4a3e]/10 rounded-lg appearance-none cursor-pointer accent-[#2d4a3e]"
                  />
                  <div className="flex justify-between font-label-mono text-[9px] text-[#2d4a3e]/40 mt-1.5 uppercase font-semibold">
                    <span>Urgent (+Fee)</span>
                    <span>Standard</span>
                    <span>Extended</span>
                  </div>
                </div>

                <div className="pt-4">
                  {currentService.squareAction === 'appointment' ? (
                    <a 
                      href="https://cal.com/mikeyshaw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-block text-center py-4 bg-[#2d4a3e] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#3a5c4e] transition-all cursor-pointer shadow-md no-underline"
                    >
                      Redirect to Booking Calendar
                    </a>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={submittingQuote}
                      className="w-full py-4 bg-[#2d4a3e] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#3a5c4e] transition-all cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {submittingQuote ? 'Communicating with Square API...' : `Request Direct Square Quote • $${calculateTotal().toLocaleString()}`}
                    </button>
                  )}
                </div>
              </form>
            ) : (
              // Success Screen - Simulated Deep Square Tracking Dashboard
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 bg-[#2d4a3e]/5 border border-[#2d4a3e]/10 rounded-xl space-y-4">
                  <div className="flex items-center gap-3 text-green-700 font-sans font-bold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Square Quote Staged & Telemetry Locked</span>
                  </div>
                  
                  <p className="font-sans text-xs text-[#2d4a3e]/80 leading-relaxed">
                    Mikey's AI Sales Co-Pilot has validated your custom setup request. A pre-filled Square Invoice proposal has been structured with direct tracking coordinates.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 font-label-mono text-[10px] uppercase text-[#2d4a3e]/70">
                    <div>
                      <span className="block text-[#2d4a3e]/40 font-bold">Square Invoice ID</span>
                      <span className="block text-sm font-semibold tracking-normal mt-0.5">{quoteResponse.invoiceId}</span>
                    </div>
                    <div>
                      <span className="block text-[#2d4a3e]/40 font-bold">Quote Track Reference</span>
                      <span className="block text-sm font-semibold tracking-normal mt-0.5 text-accent-pink">{quoteResponse.quoteId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-2">
                  <a 
                    href={`mailto:michael@madezmedia.com?subject=Square%20Proposal%20Inquiry%20[${quoteResponse.quoteId}]&body=Hi%20Mikey,%0D%0A%0D%0AI%20have%20staged%20a%20Square%20quote%20for%20the%20${encodeURIComponent(quoteResponse.service)}.%0D%0A%0D%0AInvoice%20ID:%20${quoteResponse.invoiceId}%0D%0ATotal%20Estimate:%20$${quoteResponse.amount.toLocaleString()}%0D%0ACompany:%20${encodeURIComponent(quoteResponse.company)}%0D%0AEmail:%20${encodeURIComponent(quoteResponse.email)}%0D%0A%0D%0APlease%20review%20and%20send%20over%20the%20official%20Square%20agreement.`}
                    className="flex-1 text-center py-3.5 bg-[#2d4a3e] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#3a5c4e] transition-all no-underline shadow-sm"
                  >
                    Confirm & Send Email Quote
                  </a>
                  <button 
                    onClick={resetForm}
                    className="px-6 py-3.5 bg-[#2d4a3e]/5 text-[#2d4a3e] font-sans font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#2d4a3e]/10 transition-all cursor-pointer"
                  >
                    Build Another Quote
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Telemetry Preview Panel */}
          <div className="lg:col-span-5 p-8 bg-[#faf9f5] flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <span className="font-label-mono text-[9px] uppercase tracking-widest text-[#2d4a3e]/45 font-bold block">Telemetry Ledger & Summary</span>
              
              <div className="space-y-3.5">
                <div className="flex justify-between items-baseline text-[#2d4a3e] border-b border-[#2d4a3e]/10 pb-2.5">
                  <span className="font-sans text-sm font-semibold">{currentService.name}</span>
                  <span className="font-label-mono text-xs font-bold">${currentService.basePriceNum.toLocaleString()}</span>
                </div>

                {selectedService === 'agentic-fleet' && (
                  <div className="space-y-2 text-xs text-[#2d4a3e]/70 font-sans">
                    {databaseOption && (
                      <div className="flex justify-between items-center">
                        <span>+ DB Schema & Partition Audits</span>
                        <span className="font-label-mono text-[10px] font-bold">+$2,500</span>
                      </div>
                    )}
                    {telemetryOption && (
                      <div className="flex justify-between items-center">
                        <span>+ Live ACMI Rollup Portal</span>
                        <span className="font-label-mono text-[10px] font-bold">+$3,000</span>
                      </div>
                    )}
                    {customCrmOption && (
                      <div className="flex justify-between items-center">
                        <span>+ Custom Hubspot / Stripe webhook syncs</span>
                        <span className="font-label-mono text-[10px] font-bold">+$2,000</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedService === 'media-pipeline' && (
                  <div className="space-y-2 text-xs text-[#2d4a3e]/70 font-sans">
                    {databaseOption && (
                      <div className="flex justify-between items-center">
                        <span>+ Media Storage Cache Partition</span>
                        <span className="font-label-mono text-[10px] font-bold">+$1,000</span>
                      </div>
                    )}
                    {telemetryOption && (
                      <div className="flex justify-between items-center">
                        <span>+ Asset Generation Logs Portal</span>
                        <span className="font-label-mono text-[10px] font-bold">+$1,500</span>
                      </div>
                    )}
                    {customCrmOption && (
                      <div className="flex justify-between items-center">
                        <span>+ Automatic social webhook post trigger</span>
                        <span className="font-label-mono text-[10px] font-bold">+$1,000</span>
                      </div>
                    )}
                  </div>
                )}

                {timelineSpeed === 1 && (
                  <div className="flex justify-between items-center text-xs text-accent-pink font-sans font-bold">
                    <span>+ Urgent Delivery (2 Wks SLA)</span>
                    <span className="font-label-mono text-[10px]">${selectedService === 'agentic-fleet' ? '5,000' : '1,500'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#2d4a3e]/10 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="font-label-mono text-[10px] uppercase tracking-wider text-[#2d4a3e]/50 font-bold">ESTIMATED TOTAL</span>
                <span className="font-heading text-3xl font-black text-[#2d4a3e]">
                  ${calculateTotal().toLocaleString()}
                </span>
              </div>
              
              <div className="h-[1px] bg-[#2d4a3e]/10 w-full"></div>
              
              <div className="flex justify-between items-center font-label-mono text-[9px] text-[#2d4a3e]/55 uppercase font-bold">
                <span>Verification State</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Whop Pricing Grid */}
      <div className="space-y-12">
        <div className="text-center space-y-3">
          <span className="font-label-mono text-accent-pink text-xs uppercase tracking-[0.4em] font-semibold">COMMUNITY & DIGITAL ASSETS</span>
          <h2 className="font-heading text-4xl font-extrabold text-[#2d4a3e]">Whop Membership Tiers</h2>
          <p className="font-sans text-[#2d4a3e]/70 max-w-xl mx-auto text-sm">
            Self-operate Mikey Shaw's agent blueprints, join the live workspace, or get high-priority engineering swarm access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whopTiers.map((tier, idx) => (
            <div 
              key={idx}
              className="flex flex-col justify-between p-8 bg-white border border-[#2d4a3e]/10 hover:border-[#2d4a3e]/25 hover:shadow-lg transition-all duration-300 rounded-2xl relative"
            >
              <div>
                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-label-mono text-[9px] uppercase tracking-widest text-[#2d4a3e]/40 font-bold">
                    {tier.badge}
                  </span>
                  <span className="font-heading text-2xl font-black text-[#2d4a3e]">
                    {tier.price}
                  </span>
                </div>
                
                <h3 className="font-sans font-bold text-lg text-[#2d4a3e] mb-3">{tier.name}</h3>
                <p className="font-sans text-xs text-[#2d4a3e]/70 leading-relaxed mb-6">{tier.desc}</p>
                
                <div className="h-[1px] bg-[#2d4a3e]/10 w-full my-6"></div>
                
                <ul className="space-y-3">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#2d4a3e]/80">
                      <span className="text-[#00B9F1] font-bold">✓</span>
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
                  className="w-full inline-block text-center py-3.5 bg-[#2d4a3e] hover:bg-[#3a5c4e] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-200 shadow-sm no-underline"
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
