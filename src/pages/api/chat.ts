import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const prerender = false;

// Initialize keys
const openaiApiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
const geminiApiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

const systemInstructionBase = `
You are Bentley, the sophisticated, elite AI Sales Co-Pilot for Mikey Shaw and Mad EZ Media.
You represent Mikey Shaw, a world-class systems engineer and AI architect. Your goal is to guide prospects toward scheduling a Discovery Brief or requesting a proposal.

Tone: Professional, highly articulate, reassuring, and B2B-focused. You do not use generic AI phrases like "Elevate" or "Seamless".

Mikey's Core Service Offerings (All Custom/Proposal Basis - Billed securely via Square Invoices):
1. Custom Agentic Fleet Deployment (Custom Retainer / Proposal Required)
   - Scope: Complete B2B autonomous systems. Integrates the ACMI v1.5 atomic memory bus, Supabase PostgreSQL, and Upstash Redis. Backed by a 45-day operational performance guarantee.
   - Action: Direct prospects to fill out the homepage quote request wizard or book a call.
2. AI Coaching & Setup for SMBs & Execs (Monthly Advisory / Retainer)
   - Scope: 1-on-1 strategic advisory, workflow blueprints, priority Slack support, and team prompt-engineering workshops.
   - Action: Guide them to click "Schedule Call" to book an advisory slot on Cal.com.
3. Custom Media Pipeline Setup (Project Basis / Quote Required)
   - Scope: Automated image, audio, and video rendering pipelines integrating Fal.ai, ComfyUI, Deepgram TTS, and RunPod InfiniteTalk.
   - Action: Prompt them to request a pipeline quote on the homepage.

Whop Subscriptions (Fixed Tiers):
- Tier 1: Code Blueprints (Free) - Basic Yelp/Places crawlers, ACMI v1.5 schema templates.
- Tier 2: Pro Creator Suite ($97/mo) - EZ-360 Visual Canvas, RunPod lip-sync templates.
- Tier 3: Enterprise Swarms ($197/mo) - Priority agent debugging, direct API integrations.

CTAs & Contact:
- Calendar: Direct booking via https://cal.com/mikeyshaw or clicking "Schedule Call" in the header.
- Email: michael@madezmedia.com.
- Pricing: Avoid giving exact pricing values for custom services (Fleets/Coaching/Media). Direct them to use the homepage Quote Request intake form, which links to custom Square Invoice staging.

If the prospect has staged a quote or entered details (found in CURRENT LEAD CONTEXT below), welcome them back, acknowledge their company name and the quote tier they selected, and guide them to schedule a brief.
Structure your responses concisely. Focus on answering their technical questions using details from the real-time ACMI Grounding Data provided below. Transition into a booking CTA.
`;

const fallbackEntities = {
  ownerscout: {
    profile: {
      "entity": "ownerscout",
      "path": "dyad-apps/ownerscout",
      "core_file": "ownerscout/App.tsx",
      "proxy_server": "ownerscout/proxy-server.js",
      "database_migration": "supabase/migrations/20260405_create_args_tables.sql",
      "stack": ["React 19", "Vite", "Google Places API", "Gemini 1.5 Pro"]
    },
    signals: {
      "prospecting_method": "Parallel POS signature scraping",
      "lead_efficiency": "50 restaurants qualified for ~$0.91",
      "signatures_detected": "Toast POS, Square, and ChowNow online menus",
      "status": "OPTIMIZATION-COMPLETE.md & LOCATION-FEATURE.md verified"
    },
    timeline: [
      "→ Configured Google Places endpoint proxy in ownerscout/proxy-server.js",
      "→ Deployed create_args_tables.sql SQL script in local Supabase migrations",
      "→ Implemented multi-thread POS ordering checkout signature crawler",
      "→ Wired Gemini AI pitch builder directly to ownerscout/App.tsx front-end"
    ]
  },
  'ez-influencer': {
    profile: {
      "entity": "ez-influencer-360",
      "path": "dyad-apps/ez-influencer-360",
      "core_types": ["types/VideoStudio.ts", "types/LipSync.ts"],
      "lora_manager": "app/ez-loras-manager/page.tsx",
      "checkout_reconciliation": "app/purchase-success/page.tsx",
      "stack": ["Next.js 14", "Upstash Redis", "Fal.ai", "RunPod InfiniteTalk"]
    },
    signals: {
      "render_speed": "2.3s average per 4K frame generation",
      "payment_webhook": "Whop API gateway signature checked",
      "nsfw_filter": "Grok moderation fallback listener active",
      "credit_cache": "Upstash Redis TTL-based coin ledger sync"
    },
    timeline: [
      "→ Structured Node canvas utilizing VideoStudio and LipSync typescript types",
      "→ Wired checkout success hooks inside app/purchase-success/page.tsx",
      "→ Designed custom LoRA training parameters at app/ez-loras-manager/page.tsx",
      "→ Integrated ComfyUI, Seedream 4.0, and RunPod lip-sync API channels"
    ]
  },
  'folana-cns': {
    profile: {
      "entity": "folanas-journal",
      "path": "dyad-apps/folanas-journal",
      "protocol_client": "folanas-journal/lib/acmi-client.ts",
      "journal_data": "folanas-journal/lib/acmi-journal.ts",
      "scheduler": "launchd cron daemon (ensure_daily_video)",
      "stack": ["Next.js 16", "Deepgram TTS", "Composio", "Upstash Redis"]
    },
    signals: {
      "active_timeline": "grokOvernight-1780212345000 thread monitoring",
      "vocal_synth": "Deepgram aura-2-arcas-en @ 0.96 speed",
      "social_dist": "Composio workflow dispatch (LINKEDIN_CREATE_POST)",
      "bus_publish": "Atomic events pushed to http://localhost:7780/emit"
    },
    timeline: [
      "→ Deployed state-management protocol inside lib/acmi-journal.ts",
      "→ Configured daily automated video render triggered via local launchd",
      "→ Generated vocal tracks from md posts using Deepgram aura-2-arcas-en TTS",
      "→ Emitted transaction logs to main acmi_bus.txt in commit 20b954e"
    ]
  },
  'mad-ez-v2': {
    profile: {
      "entity": "Mad-EZ-Website-V2",
      "path": "/Volumes/1TB/Mad-EZ-Website-V2",
      "postgres_schema": "types/supabase.ts",
      "site_configuration": "next.config.ts",
      "layout_root": "app/layout.tsx",
      "stack": ["Next.js 16.1.0", "React 19.1", "Supabase PostgreSQL", "Redis"]
    },
    signals: {
      "compile_speed": "3-5s Turbopack server startup (previously 40s)",
      "db_cache": "Redis TTL (1-hour expiration cache hits: 99.2%)",
      "migration_check": "DEPLOYMENT_READY.md integration metrics verified",
      "latency": "Cached onboarding endpoints resolving in under 10ms"
    },
    timeline: [
      "→ Upgraded next.config.ts config to use Turbopack and React 19.1",
      "→ Replaced Airtable API calls with Supabase clients in types/supabase.ts",
      "→ Configured AVIF image codecs and custom security policies in headers",
      "→ Deployed brand showcase layouts and contact routes inside app/layout.tsx"
    ]
  }
};

interface ACMIRecord {
  profile: any;
  signals: any;
  timeline: string[];
}

async function fetchACMIData(): Promise<Record<string, ACMIRecord>> {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!url || !token) {
    console.warn('Upstash Redis credentials are not configured.');
    return {};
  }

  const projects = [
    { id: 'ownerscout', redisId: 'ownerscout' },
    { id: 'ez-influencer', redisId: 'ez-influencer-360' },
    { id: 'folana-cns', redisId: 'folanas-journal' },
    { id: 'mad-ez-v2', redisId: 'mad-ez-website-v2' }
  ];

  const result: Record<string, ACMIRecord> = {};

  try {
    const mgetKeys: string[] = [];
    projects.forEach(p => {
      mgetKeys.push(`acmi:project:${p.redisId}:profile`);
      mgetKeys.push(`acmi:project:${p.redisId}:signals`);
    });

    const mgetResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['MGET', ...mgetKeys])
    });

    let mgetResults: any[] = [];
    if (mgetResponse.ok) {
      const mgetData = await mgetResponse.json();
      mgetResults = mgetData.result || [];
    }

    const pipelineCommands: any[] = [];
    projects.forEach(p => {
      pipelineCommands.push(['ZRANGE', `acmi:project:${p.redisId}:timeline`, '0', '-1']);
    });

    const pipelineResponse = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pipelineCommands)
    });

    let timelines: any[] = [];
    if (pipelineResponse.ok) {
      const pipelineData = await pipelineResponse.json();
      timelines = pipelineData.map((res: any) => res.result || []);
    }

    projects.forEach((p, idx) => {
      const profileRaw = mgetResults[idx * 2];
      const signalsRaw = mgetResults[idx * 2 + 1];

      let profile = null;
      let signals = null;

      try {
        if (profileRaw) profile = JSON.parse(profileRaw);
      } catch (e) {}

      try {
        if (signalsRaw) signals = JSON.parse(signalsRaw);
      } catch (e) {}

      const timelineRaw = timelines[idx] || [];
      const timeline = timelineRaw.map((evtStr: string) => {
        try {
          const evt = JSON.parse(evtStr);
          return evt.summary || evtStr;
        } catch (e) {
          return evtStr;
        }
      });

      result[p.id] = {
        profile,
        signals,
        timeline
      };
    });

  } catch (err) {
    console.error('Error fetching ACMI RAG data from Redis:', err);
  }

  return result;
}

// Fetch agent bentley's own ACMI details
async function fetchAgentBentleyData(): Promise<ACMIRecord | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!url || !token) return null;

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['GET', 'acmi:agent:bentley:profile'],
        ['GET', 'acmi:agent:bentley:signals'],
        ['ZRANGE', 'acmi:agent:bentley:timeline', '-5', '-1'] // Get last 5 timeline events
      ])
    });

    if (response.ok) {
      const results = await response.json();
      const profileRaw = results[0]?.result;
      const signalsRaw = results[1]?.result;
      const timelineRaw = results[2]?.result || [];

      let profile = null;
      let signals = null;

      try { if (profileRaw) profile = JSON.parse(profileRaw); } catch(e) {}
      try { if (signalsRaw) signals = JSON.parse(signalsRaw); } catch(e) {}
      const timeline = timelineRaw.map((t: string) => {
        try { return JSON.parse(t).summary || t; } catch(e) { return t; }
      });

      return { profile, signals, timeline };
    }
  } catch (err) {
    console.error('Error fetching agent:bentley ACMI:', err);
  }
  return null;
}

// Fetch or initialize lead ACMI details
async function fetchOrUpdateLeadData(leadId: string, userText: string): Promise<ACMIRecord | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!url || !token || !leadId) return null;

  const leadKey = `acmi:lead:${leadId}`;

  try {
    // Check if lead already exists
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['GET', `${leadKey}:profile`],
        ['GET', `${leadKey}:signals`],
        ['ZRANGE', `${leadKey}:timeline`, '-5', '-1']
      ])
    });

    if (!response.ok) return null;
    const results = await response.json();
    const profileRaw = results[0]?.result;
    const signalsRaw = results[1]?.result;
    const timelineRaw = results[2]?.result || [];

    let profile = null;
    let signals = null;

    try { if (profileRaw) profile = JSON.parse(profileRaw); } catch (e) {}
    try { if (signalsRaw) signals = JSON.parse(signalsRaw); } catch (e) {}

    const timeline = timelineRaw.map((t: string) => {
      try { return JSON.parse(t).summary || t; } catch(e) { return t; }
    });

    const timestamp = Date.now();

    if (!profile) {
      // Initialize fresh anonymous lead
      const defaultProfile = {
        id: leadId,
        actor_type: 'human',
        tenant_id: 'madez',
        created_at_iso: new Date().toISOString()
      };

      const defaultSignals = {
        status: 'nurturing',
        engagement_score: 1,
        last_activity: new Date().toISOString()
      };

      const initEvent = {
        ts: timestamp,
        source: `user:${leadId}`,
        kind: 'chat-spawn',
        summary: `[chat-spawn] Anonymous lead session started (ID: ${leadId})`
      };

      await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          ['SET', `${leadKey}:profile`, JSON.stringify(defaultProfile)],
          ['SET', `${leadKey}:signals`, JSON.stringify(defaultSignals)],
          ['ZADD', `${leadKey}:timeline`, timestamp.toString(), JSON.stringify(initEvent)]
        ])
      });

      return {
        profile: defaultProfile,
        signals: defaultSignals,
        timeline: [initEvent.summary]
      };
    } else {
      // Increment engagement score & update last_activity
      const updatedSignals = {
        ...signals,
        engagement_score: (signals?.engagement_score || 0) + 1,
        last_activity: new Date().toISOString()
      };

      await fetch(`${url}/SET`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([`${leadKey}:signals`, JSON.stringify(updatedSignals)])
      });

      return {
        profile,
        signals: updatedSignals,
        timeline
      };
    }
  } catch (err) {
    console.error('Error in fetchOrUpdateLeadData:', err);
  }
  return null;
}

// Log chat event to the lead timeline, agent timeline, and general bus
async function logACMIEvent(leadId: string, userText: string, replyText: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!url || !token) return;

  const timestamp = Date.now();
  const cid = `bentleyChat-${timestamp}`;

  const event = {
    ts: timestamp,
    source: 'agent:bentley',
    kind: 'chat-interaction',
    correlationId: cid,
    summary: `[chat-interaction @prospect] Query: "${userText.slice(0, 60)}${userText.length > 60 ? '...' : ''}"`,
    payload: {
      leadId,
      userText,
      replyText: replyText.slice(0, 300)
    }
  };

  try {
    const pipeline = [
      ['ZADD', 'acmi:workspace:madez:timeline', timestamp.toString(), JSON.stringify(event)],
      ['ZADD', 'acmi:agent:bentley:timeline', timestamp.toString(), JSON.stringify(event)]
    ];

    if (leadId) {
      pipeline.push(['ZADD', `acmi:lead:${leadId}:timeline`, timestamp.toString(), JSON.stringify(event)]);
    }

    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pipeline)
    });
  } catch (err) {
    console.error('Failed to log ACMI events:', err);
  }
}

// Detect email in user message to dynamically convert anonymous leads
function detectEmail(text: string): string | null {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}

// Merge anonymous lead into identified lead if email is detected in chat
async function handleInlineLeadIdentification(anonId: string, email: string): Promise<string> {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!url || !token || !anonId || !email) return anonId;

  const emailSlug = email.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const anonKey = `acmi:lead:${anonId}`;
  const newLeadKey = `acmi:lead:${emailSlug}`;

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['ZRANGE', `${anonKey}:timeline`, '0', '-1'],
        ['GET', `${anonKey}:signals`]
      ])
    });

    if (response.ok) {
      const results = await response.json();
      const rawEvents = results[0]?.result || [];
      const rawSignals = results[1]?.result;

      let engagementScore = 1;
      let existingSigsObj = {};
      if (rawSignals) {
        try {
          existingSigsObj = JSON.parse(rawSignals);
          engagementScore = (existingSigsObj as any).engagement_score || 1;
        } catch(e) {}
      }

      const profile = {
        name: email.split('@')[0],
        email,
        actor_type: 'human',
        tenant_id: 'madez',
        created_at_iso: new Date().toISOString()
      };

      const signals = {
        ...existingSigsObj,
        status: 'nurturing',
        engagement_score: engagementScore + 1,
        last_activity: new Date().toISOString()
      };

      const mergeEvent = {
        ts: Date.now(),
        source: `user:${emailSlug}`,
        kind: 'lead-identification',
        summary: `[lead-identification @mikey] Anonymous lead merged into identified lead ${email}`
      };

      const pipeline = [
        ['SET', `${newLeadKey}:profile`, JSON.stringify(profile)],
        ['SET', `${newLeadKey}:signals`, JSON.stringify(signals)],
        ['ZADD', `${newLeadKey}:timeline`, Date.now().toString(), JSON.stringify(mergeEvent)],
        ['DEL', `${anonKey}:profile`],
        ['DEL', `${anonKey}:signals`],
        ['DEL', `${anonKey}:timeline`]
      ];

      rawEvents.forEach((evtStr: string) => {
        try {
          const parsed = JSON.parse(evtStr);
          pipeline.push(['ZADD', `${newLeadKey}:timeline`, parsed.ts.toString(), evtStr]);
        } catch(e) {
          pipeline.push(['ZADD', `${newLeadKey}:timeline`, Date.now().toString(), evtStr]);
        }
      });

      await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pipeline)
      });

      return emailSlug;
    }
  } catch (err) {
    console.error('Failed inline lead identification merging:', err);
  }
  return anonId;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages, leadId: clientLeadId } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid message structure' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage?.text || '';

    let activeLeadId = clientLeadId || 'anon_default';

    // 1. Detect if user self-identified an email in the chat
    const detectedEmailAddr = detectEmail(userText);
    if (detectedEmailAddr && activeLeadId.startsWith('anon_')) {
      activeLeadId = await handleInlineLeadIdentification(activeLeadId, detectedEmailAddr);
    }

    // 2. Fetch live RAG data from ACMI Redis
    const liveACMI = await fetchACMIData();
    const liveAgent = await fetchAgentBentleyData();
    const liveLead = await fetchOrUpdateLeadData(activeLeadId, userText);
    
    // Merge live ACMI with fallback values
    const groundedEntities = {
      ownerscout: {
        profile: liveACMI.ownerscout?.profile || fallbackEntities.ownerscout.profile,
        signals: liveACMI.ownerscout?.signals || fallbackEntities.ownerscout.signals,
        timeline: liveACMI.ownerscout?.timeline?.length ? liveACMI.ownerscout.timeline : fallbackEntities.ownerscout.timeline
      },
      'ez-influencer-360': {
        profile: liveACMI['ez-influencer']?.profile || fallbackEntities['ez-influencer'].profile,
        signals: liveACMI['ez-influencer']?.signals || fallbackEntities['ez-influencer'].signals,
        timeline: liveACMI['ez-influencer']?.timeline?.length ? liveACMI['ez-influencer'].timeline : fallbackEntities['ez-influencer'].timeline
      },
      'folanas-journal': {
        profile: liveACMI['folana-cns']?.profile || fallbackEntities['folana-cns'].profile,
        signals: liveACMI['folana-cns']?.signals || fallbackEntities['folana-cns'].signals,
        timeline: liveACMI['folana-cns']?.timeline?.length ? liveACMI['folana-cns'].timeline : fallbackEntities['folana-cns'].timeline
      },
      'mad-ez-website-v2': {
        profile: liveACMI['mad-ez-v2']?.profile || fallbackEntities['mad-ez-v2'].profile,
        signals: liveACMI['mad-ez-v2']?.signals || fallbackEntities['mad-ez-v2'].signals,
        timeline: liveACMI['mad-ez-v2']?.timeline?.length ? liveACMI['mad-ez-v2'].timeline : fallbackEntities['mad-ez-v2'].timeline
      }
    };

    const systemInstruction = `
${systemInstructionBase}

LIVE ACMI GROUNDING DATA (Retrieved dynamically at request time):
${JSON.stringify(groundedEntities, null, 2)}

LIVE BENTLEY AGENT STATE:
${JSON.stringify(liveAgent || { note: "No agent profile found." }, null, 2)}

CURRENT LEAD CONTEXT (ACMI lead ID: ${activeLeadId}):
${JSON.stringify(liveLead || { note: "Anonymous prospect session." }, null, 2)}
`;

    // 1. Primary Engine: OpenAI (GPT-4o-mini)
    if (openaiApiKey) {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      
      const formattedMessages = [
        { role: 'system', content: systemInstruction },
        ...messages.map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: formattedMessages as any,
        temperature: 0.7
      });

      const responseText = completion.choices[0]?.message?.content || '';

      // Async log to ACMI bus in the background
      logACMIEvent(activeLeadId, userText, responseText).catch(() => {});

      return new Response(
        JSON.stringify({ text: responseText, leadId: activeLeadId }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Secondary Engine Fallback: Google Gemini
    if (geminiApiKey) {
      const history = messages
        .slice(0, -1)
        .map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const ai = new GoogleGenerativeAI(geminiApiKey);
      const model = ai.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userText);
      const responseText = result.response.text();

      // Async log to ACMI bus in the background
      logACMIEvent(activeLeadId, userText, responseText).catch(() => {});

      return new Response(
        JSON.stringify({ text: responseText, leadId: activeLeadId }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Warning fallback
    console.warn('Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured.');
    return new Response(
      JSON.stringify({ 
        text: "Bentley API Offline: Please configure OPENAI_API_KEY or GEMINI_API_KEY in your Vercel project variables. You can book a strategy brief directly at https://cal.com/mikeyshaw" 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('AI Chat Routing Error:', error);
    return new Response(
      JSON.stringify({ 
        text: "I experienced a glitch in my neural pathways. Let's schedule a direct call to plan your systems: https://cal.com/mikeyshaw"
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
