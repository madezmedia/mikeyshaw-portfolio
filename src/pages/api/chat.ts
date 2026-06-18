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
    console.warn('Upstash Redis credentials are not configured in environment variables.');
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

async function logACMIEvent(userText: string, replyText: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!url || !token) return;

  const timestamp = Date.now();
  const event = {
    ts: timestamp,
    source: 'agent:bentley',
    kind: 'chat-interaction',
    summary: `[chat-interaction @prospect] User queried Bentley: "${userText.slice(0, 60)}${userText.length > 60 ? '...' : ''}"`,
    payload: {
      userText,
      replyText: replyText.slice(0, 300)
    }
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['ZADD', 'acmi:workspace:madez:timeline', timestamp.toString(), JSON.stringify(event)])
    });
  } catch (err) {
    console.error('Failed to log ACMI event:', err);
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid message structure' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage?.text || '';

    // Fetch live RAG data from ACMI Redis
    const liveACMI = await fetchACMIData();
    
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

    const systemInstruction = `${systemInstructionBase}\n\nLIVE ACMI GROUNDING DATA (Retrieved dynamically at request time):\n${JSON.stringify(groundedEntities, null, 2)}`;

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
      logACMIEvent(userText, responseText).catch(() => {});

      return new Response(
        JSON.stringify({ text: responseText }),
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
      logACMIEvent(userText, responseText).catch(() => {});

      return new Response(
        JSON.stringify({ text: responseText }),
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
