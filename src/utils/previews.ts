export interface LinkMetadata {
  title: string;
  description: string;
  url: string;
  domain: string;
  image: string;
  ctaText: string;
}

export const coreLinkPreviews: Record<string, LinkMetadata> = {
  'https://whop.com/checkout/plan_2Tz2QipTSn0O9': {
    title: 'Mad EZ Media — Developer Membership',
    description: 'Instantly unlock Mikey Shaw\'s ACMI v1.5 atomic memory bus, local Yelp/Places crawlers, and the EZ-360 Visual Creator Canvas.',
    url: 'https://whop.com/checkout/plan_2Tz2QipTSn0O9',
    domain: 'whop.com',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop',
    ctaText: 'Join Workspace'
  },
  'https://cal.com/mikeyshaw': {
    title: 'Schedule B2B Systems Architecture Brief',
    description: 'Book a direct 15-minute advisory call with Mikey Shaw to audit your current infrastructure and outline autonomous agent fleets.',
    url: 'https://cal.com/mikeyshaw',
    domain: 'cal.com',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=500&auto=format&fit=crop',
    ctaText: 'Book Strategy Slot'
  },
  'https://madezmedia.com': {
    title: 'Mad EZ Media Partners',
    description: 'Mikey Shaw\'s systems engineering studio. We build and operate high-density autonomous agents, custom databases, and media generation pipelines.',
    url: 'https://madezmedia.com',
    domain: 'madezmedia.com',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop',
    ctaText: 'Explore the Agency'
  }
};

// Helper to find pre-configured previews inside text
export function detectCoreLinks(text: string): LinkMetadata[] {
  const detected: LinkMetadata[] = [];
  Object.keys(coreLinkPreviews).forEach((url) => {
    if (text.includes(url)) {
      detected.push(coreLinkPreviews[url]);
    }
  });
  return detected;
}
