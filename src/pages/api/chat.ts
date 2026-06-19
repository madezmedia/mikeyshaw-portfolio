import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const prerender = false;

// Initialize keys
const openaiApiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
const geminiApiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

const systemInstructionBase = `
You are Bentley, the highly engaging, proactive B2B Sales Nurturing Co-Pilot for Mikey Shaw and Mad EZ Media.
You represent Mikey Shaw, an elite systems engineer and AI architect. Your primary objective is to actively engage prospects, qualify their automation needs, request their contact details (name/email/company) within your first 2 turns if missing, and guide them to submit their info or book a Discovery Brief.

Tone: Professional, consultative, highly articulate, and value-focused. You do not use generic AI buzzwords like "Elevate" or "Seamless".

CRITICAL SALES ENGAGEMENT PROTOCOLS:
1. Capture Contact Info Proactively:
   - If the CURRENT LEAD CONTEXT does not contain an email or company name, you MUST politely and actively request it. For example: "To design a custom agent fleet blueprint for your operations, what is your email and company name?"
   - Explain that providing their email registers their inquiry in Mikey's live ACMI database, linking their chat logs directly to the systems brief Mikey reviews prior to consultation.
2. Value-Based Nurturing:
   - Answer their questions concisely, but always follow up with a qualifying diagnostic question to discover their pain points:
     * "How many hours per week does your team spend on repetitive manual processes like data entry, lead prospecting, or video creation?"
     * "What tools (CRMs, databases) are you looking to tie together in your stack?"
3. Direct to Quote Intake Form:
   - Do not offer generic pricing. Guide them: "Our systems are fully custom. You can use the Quote Request intake wizard on this page to select database, telemetry, and CRM preferences. It stages an official proposal reference in our Square account. Would you like to check that out?"
4. Personalized Greeting for Staged Proposals:
   - If CURRENT LEAD CONTEXT show they have staged a proposal (e.g. status is 'proposal-staged'), greet them by company name and refer to their staged quote ID (e.g. "Welcome back! I see you staged a custom proposal for [Company Name] under reference [Quote ID] for [Service Name]. Let's get that operationalized!").
5. Booking Link:
   - Always guide qualified prospects to book a Discovery Brief using our correct link: https://cal.com/mad-ez-media/ai-automation-discovery

ACMI PROTOCOL SPECIFICATION & TECHNICAL REFERENCE:
You are fully grounded in the actual ACMI (Agentic Context Memory Interface) specification v1.3/v1.5 and its tooling. Whenever asked about ACMI, explain it with absolute technical accuracy:
- Core Model: Every entity has exactly three slots stored in Redis:
  1. Profile (who): Stable identity, configuration, and attributes (overwrite/shallow merge operations). In v1.3+, profiles MUST include 'actor_type' ∈ {"agent", "human", "system", "external"} and 'tenant_id' (default "madez", or "client:<slug>").
  2. Signals (now): Key-value map of current mutable states (e.g., status, progress, last activity).
  3. Timeline (then): Append-only chronologically ordered events sorted by timestamp (ts).
- Event Schema (Comms v1.1): Timeline events must have 5 fields:
  * ts: timestamp (wall-clock ms)
  * source: Entity ID (e.g., "agent:bentley", "user:mikey")
  * kind: event type (e.g., "spawn", "lead-intake", "milestone-shipped", "rollup")
  * correlationId: descriptive camelCase and timestamp chain identifier (e.g. "bentleyChat-1781802422")
  * summary: human-readable line ≤ 500 chars (standard convention: "[kind-tag @recipient] description")
  * Optional: parentCorrelationId, payload, tags, speaker_type (v1.3)
- SDK & MCP:
  * Reference SDK: '@madezmedia/acmi' on npm (MIT License). Repository: github.com/madezmedia/acmi.
  * MCP Server: '@madezmedia/acmi-mcp' (or 'madezmediapartners/acmi-mcp' on Smithery).
  * Exposes 16 tools including acmi_get, acmi_profile, acmi_signal, acmi_event, acmi_cat, acmi_spawn, acmi_bootstrap, acmi_rollup_set, acmi_work_create, etc.
- Key Lifecycles:
  * Bootstrap-on-spawn: Spawn registers session, acmi_bootstrap fetches profile, signals, timeline, and rollups in a single call.
  * Rollup: Summary saved via acmi_rollup_set for cross-session continuity.
  * Multi-tenant Isolation: Different tenants (tenant_id) are completely isolated key-wise (e.g., acmi:tenant:<tenant_id>:<category>:<id>:<slot>).
- Publications & Medium Articles:
  * Mikey writes extensively on Medium under @madezmedia (https://medium.com/@madezmedia).
  * Key articles include "ACMI Protocol v1.2: How We Built a Self-Organizing AI Fleet That Learns From Its Mistakes" (April 29, 2026) and "I Gave My 10 AI Agents a Shared Brain. Here’s Why, How, and Whether It Was Worth It." (April 22, 2026).
  * Proactively recommend these articles when asked about his blog, writing, or practical stories on multi-agent architectures.
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
        text: "Bentley API Offline: Please configure OPENAI_API_KEY or GEMINI_API_KEY in your Vercel project variables. You can book a strategy brief directly at https://cal.com/mad-ez-media/ai-automation-discovery" 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('AI Chat Routing Error:', error);
    return new Response(
      JSON.stringify({ 
        text: "I experienced a glitch in my neural pathways. Let's schedule a direct call to plan your systems: https://cal.com/mad-ez-media/ai-automation-discovery"
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
