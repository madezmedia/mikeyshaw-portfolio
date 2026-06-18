import type { APIRoute } from 'astro';

export const prerender = false;

interface ACMIRecord {
  profile: any;
  signals: any;
  timeline: string[];
}

export const GET: APIRoute = async () => {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!url || !token) {
    return new Response(
      JSON.stringify({ error: 'Upstash Redis credentials are not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
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

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    );

  } catch (err: any) {
    console.error('Error fetching ACMI RAG data from Redis in acmi-data endpoint:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch ACMI data', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
