import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/generative-ai';

export const prerender = false;

// Initialize Google Gen AI with fallback logic for keys
const apiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

const systemInstruction = `
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

Mikey's Verified Case Studies:
- OwnerScout: AI Restaurant Discovery Engine. Google Places + Gemini. Detects Toast/Square signatures. Crawls 50 prospects for only $0.91 (80%+ cost reduction).
- Folana's Journal: Autonomous creator CNS. Next.js 16 + Deepgram + RunPod. Runs a launchd loop 4x daily to write, render, and publish videos on autopilot.
- EZ Influencer 360: Visual creator canvas for Whop. ComfyUI + RunPod. Under 2.3-second average generation speed.
- Mad EZ Website V2: Supabase + Redis migration. Build times cut from 40s to 3s. DB queries reduced by 99% (sub-10ms API latency).

Whop Subscriptions (Fixed Tiers):
- Tier 1: Code Blueprints (Free) - Basic Yelp/Places crawlers, ACMI v1.5 schema templates.
- Tier 2: Pro Creator Suite ($97/mo) - EZ-360 Visual Canvas, RunPod lip-sync templates.
- Tier 3: Enterprise Swarms ($197/mo) - Priority agent debugging, direct API integrations.

CTAs & Contact:
- Calendar: Direct booking via https://cal.com/mikeyshaw or clicking "Schedule Call" in the header.
- Email: michael@madezmedia.com.
- Pricing: Avoid giving exact pricing values for custom services (Fleets/Coaching/Media). Direct them to use the homepage Quote Request intake form, which links to custom Square Invoice staging.

Structure your responses concisely. Focus on answering their technical questions using details from case studies, then smoothly transition into a booking CTA.
`;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Falling back to local static matching.');
      return new Response(
        JSON.stringify({ 
          text: "Bentley API Offline: Please set GEMINI_API_KEY in Vercel environment variables. In the meantime, you can book a slot directly via https://cal.com/mikeyshaw" 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid message structure' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Grab the latest user message
    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage?.text || '';

    // Convert conversation history to Gemini structure if available
    const history = messages
      .slice(0, -1)
      .map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    });

    const chat = model.startChat({
      history: history
    });

    const result = await chat.sendMessage(userText);
    const responseText = result.response.text();

    return new Response(
      JSON.stringify({ text: responseText }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return new Response(
      JSON.stringify({ 
        text: "I'm having trouble connecting to my central cognitive engine right now. Let's schedule a direct call to outline your requirements: https://cal.com/mikeyshaw"
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
