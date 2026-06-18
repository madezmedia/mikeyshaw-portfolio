import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!url || !token) {
    return new Response(
      JSON.stringify({ error: 'Upstash Redis credentials are not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const {
      leadId, // Current anonymous lead ID (e.g. anon_123456)
      company,
      email,
      service,
      complexityScore,
      complexityTier,
      timelineWeeks,
      addons,
      invoiceId,
      quoteId
    } = body;

    if (!email || !company) {
      return new Response(
        JSON.stringify({ error: 'Email and company name are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format identified lead slug
    const emailSlug = email.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newLeadKey = `acmi:lead:${emailSlug}`;

    // 1. Fetch anonymous timeline events for merging if appropriate
    let mergedEvents: any[] = [];
    if (leadId && leadId.startsWith('anon_')) {
      try {
        const anonTimelineResponse = await fetch(`${url}/pipeline`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([
            ['ZRANGE', `acmi:lead:${leadId}:timeline`, '0', '-1'],
            ['GET', `acmi:lead:${leadId}:signals`]
          ])
        });

        if (anonTimelineResponse.ok) {
          const pipelineRes = await anonTimelineResponse.json();
          const rawEvents = pipelineRes[0]?.result || [];
          const rawSignals = pipelineRes[1]?.result;

          let engagementCount = 0;
          if (rawSignals) {
            try {
              const sigs = JSON.parse(rawSignals);
              engagementCount = sigs.engagement_score || 0;
            } catch (e) {}
          }

          // Format anonymous events
          mergedEvents = rawEvents.map((evtStr: string) => {
            try {
              return JSON.parse(evtStr);
            } catch (e) {
              return {
                ts: Date.now(),
                source: 'user:anonymous',
                kind: 'chat-interaction',
                summary: evtStr
              };
            }
          });
        }
      } catch (err) {
        console.error('Failed to retrieve anonymous lead timeline for merging:', err);
      }
    }

    // 2. Prepare Lead Profile
    const profile = {
      name: email.split('@')[0],
      email,
      company,
      actor_type: 'human',
      tenant_id: 'madez',
      created_at_iso: new Date().toISOString()
    };

    // 3. Prepare Lead Signals
    const signals = {
      status: 'proposal-staged',
      service,
      complexity_score: complexityScore,
      complexity_tier: complexityTier,
      timeline_weeks: timelineWeeks,
      invoice_id: invoiceId,
      quote_id: quoteId,
      addons,
      engagement_score: (mergedEvents.length > 0 ? mergedEvents.length : 1),
      last_activity: new Date().toISOString()
    };

    // 4. Create timeline events to write
    const timestamp = Date.now();
    const intakeEvent = {
      ts: timestamp,
      source: `user:${emailSlug}`,
      kind: 'lead-intake',
      correlationId: quoteId,
      summary: `[lead-intake @mikey] ${company} (${email}) staged a quote request for ${service} (Complexity: ${complexityTier})`,
      payload: {
        complexityScore,
        complexityTier,
        invoiceId,
        quoteId,
        addons
      }
    };

    // 5. Build pipeline commands for Redis
    const pipelineCommands: any[] = [
      ['SET', `${newLeadKey}:profile`, JSON.stringify(profile)],
      ['SET', `${newLeadKey}:signals`, JSON.stringify(signals)],
      ['ZADD', `${newLeadKey}:timeline`, timestamp.toString(), JSON.stringify(intakeEvent)],
      ['ZADD', 'acmi:workspace:madez:timeline', timestamp.toString(), JSON.stringify(intakeEvent)],
      ['ZADD', 'acmi:agent:bentley:timeline', timestamp.toString(), JSON.stringify(intakeEvent)]
    ];

    // Write merged anonymous timeline events to the new lead timeline
    mergedEvents.forEach(evt => {
      pipelineCommands.push(['ZADD', `${newLeadKey}:timeline`, evt.ts.toString(), JSON.stringify(evt)]);
    });

    // If merging from anonymous lead, clear the old keys
    if (leadId && leadId.startsWith('anon_')) {
      pipelineCommands.push(['DEL', `acmi:lead:${leadId}:profile`]);
      pipelineCommands.push(['DEL', `acmi:lead:${leadId}:signals`]);
      pipelineCommands.push(['DEL', `acmi:lead:${leadId}:timeline`]);
    }

    // Execute pipeline in Upstash
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pipelineCommands)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upstash pipeline failed: ${errText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailSlug,
        leadId: emailSlug,
        message: 'Lead and opportunity successfully ingested into ACMI.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Lead ingestion failed:', err);
    return new Response(
      JSON.stringify({ error: 'Lead ingestion failed', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
