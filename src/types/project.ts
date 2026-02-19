export interface ProjectStatistic {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

export interface ProjectTechnology {
    name: string;
    icon: string;
}

export interface ProjectLink {
    type: 'github' | 'live' | 'demo';
    url: string;
}

export interface Project {
    id: string;
    name: string;
    shortDescription: string;
    fullDescription: string;
    category: string[];
    coverImage: string;
    technologies: ProjectTechnology[];
    statistics: ProjectStatistic[];
    links: ProjectLink[];
    featured?: boolean;
}

export const PROJECTS: Project[] = [
    {
        id: 'openclaw-restaurants',
        name: 'OpenClaw for Restaurants',
        shortDescription: 'AI Voice Assistant That Answers Phones So Restaurants Don\'t Lose Revenue',
        fullDescription: 'AI-powered phone answering system for restaurants. Handles missed calls, captures leads, takes messages, and answers common questions using VAPI + OpenClaw architecture. First customer launching with Cuzzo\'s Cuisine.',
        category: ['Voice AI', 'Restaurant Tech', 'SaaS'],
        coverImage: '/icons/openclaw.svg',
        technologies: [
            { name: 'VAPI', icon: '/icons/vapi.svg' },
            { name: 'OpenClaw', icon: '/icons/openclaw.svg' },
            { name: 'Supabase', icon: '/icons/supabase.svg' },
            { name: 'Next.js', icon: '/icons/nextjs.svg' },
            { name: 'Vercel', icon: '/icons/vercel.svg' }
        ],
        statistics: [
            { label: 'Revenue/Client', value: '$497/mo', icon: '💰', color: '#28A745' },
            { label: 'Build Time', value: '48hrs', icon: '⚡', color: '#D4AF37' },
            { label: 'Status', value: 'Launching', icon: '🚀', color: '#FF4D4D' }
        ],
        links: [
            { type: 'live', url: 'https://openclaw-restaurants-1dh0a6pgt-mad-ez-media.vercel.app' }
        ],
        featured: true
    },
    {
        id: 'sales-processing-agent',
        name: 'Sales Processing Agent',
        shortDescription: 'AI Agent Command Center for Automated Sales Workflows',
        fullDescription: 'Multi-agent orchestration system for sales automation with agent dashboard, pipeline health monitoring, task queue management, and live activity feeds. Handles prospecting, outreach, and follow-up automatically.',
        category: ['Agent Orchestration', 'Sales Automation', 'AI'],
        coverImage: '/icons/openai.svg',
        technologies: [
            { name: 'OpenAI', icon: '/icons/openai.svg' },
            { name: 'Next.js', icon: '/icons/nextjs.svg' },
            { name: 'TypeScript', icon: '/icons/typescript.svg' },
            { name: 'Node.js', icon: '/icons/nodejs.svg' }
        ],
        statistics: [
            { label: 'System Status', value: 'Live', icon: '🟢', color: '#28A745' },
            { label: 'Queue Processing', value: 'Active', icon: '⚙️', color: '#D4AF37' },
            { label: 'Agent Monitoring', value: 'Real-time', icon: '📡', color: '#708090' }
        ],
        links: [
            { type: 'live', url: 'https://sales-processing-agent.vercel.app/dashboard/agents' }
        ],
        featured: true
    },
    {
        id: 'sonicbrand-ai',
        name: 'SonicBrand AI',
        shortDescription: 'AI Audio Ad Platform — Professional Ads in Under 5 Minutes',
        fullDescription: 'Full SaaS platform for AI-generated audio advertising. Voice synthesis, music generation, jingle creation with multi-platform export to TikTok, Instagram, YouTube, Spotify, and radio. Complete with payment processing and user accounts.',
        category: ['SaaS', 'AI Audio', 'Full Stack'],
        coverImage: '/icons/elevenlabs.svg',
        technologies: [
            { name: 'ElevenLabs', icon: '/icons/elevenlabs.svg' },
            { name: 'Next.js', icon: '/icons/nextjs.svg' },
            { name: 'Stripe', icon: '/icons/stripe.svg' },
            { name: 'OpenAI', icon: '/icons/openai.svg' },
            { name: 'Vercel', icon: '/icons/vercel.svg' }
        ],
        statistics: [
            { label: 'Cost Reduction', value: '90%', icon: '📉', color: '#28A745' },
            { label: 'Speed', value: '<5 min', icon: '⚡', color: '#D4AF37' },
            { label: 'Market Size', value: '$7.08B', icon: '📊', color: '#708090' }
        ],
        links: [
            { type: 'live', url: 'https://www.sonicbrand.online' }
        ],
        featured: true
    },
    {
        id: 'ownerscout',
        name: 'OwnerScout',
        shortDescription: 'AI-Powered Lead Generation for Restaurants',
        fullDescription: 'Lead generation tool for finding independent restaurants with Google Places API integration, AI analysis, tech stack detection, and multi-tier caching achieving 80-95% API cost reduction with 9x faster search performance.',
        category: ['Lead Gen', 'API Integration', 'Performance'],
        coverImage: '/icons/openai.svg',
        technologies: [
            { name: 'Next.js', icon: '/icons/nextjs.svg' },
            { name: 'TypeScript', icon: '/icons/typescript.svg' },
            { name: 'OpenAI', icon: '/icons/openai.svg' },
            { name: 'Vercel', icon: '/icons/vercel.svg' }
        ],
        statistics: [
            { label: 'API Cost Reduction', value: '80-95%', icon: '💰', color: '#28A745' },
            { label: 'Search Speed', value: '9x Faster', icon: '⚡', color: '#D4AF37' },
            { label: 'Caching', value: 'Multi-tier', icon: '🗄️', color: '#708090' }
        ],
        links: [
            { type: 'live', url: 'https://ownerscout.vercel.app' }
        ],
        featured: true
    },
    {
        id: 'yao-social-media',
        name: 'YAO Social Media Team',
        shortDescription: 'Multi-Agent System for Restaurant Social Media Automation',
        fullDescription: 'Scout Agent discovers content from Google Drive, Email, and Events. Creator Agent uses GPT-4 for caption generation across Instagram, Facebook, and Twitter. Database-driven workflow with Supabase, confidence scoring, and brand voice adaptation.',
        category: ['Multi-Agent', 'Social Media', 'Automation'],
        coverImage: '/icons/openai.svg',
        technologies: [
            { name: 'OpenAI', icon: '/icons/openai.svg' },
            { name: 'Supabase', icon: '/icons/supabase.svg' },
            { name: 'TypeScript', icon: '/icons/typescript.svg' },
            { name: 'Node.js', icon: '/icons/nodejs.svg' }
        ],
        statistics: [
            { label: 'Build Time', value: '25 min', icon: '⏱️', color: '#28A745' },
            { label: 'Agent Speed', value: '4x Faster', icon: '🤖', color: '#D4AF37' },
            { label: 'MRR Potential', value: '$24.8K', icon: '📈', color: '#708090' }
        ],
        links: [
            { type: 'github', url: 'https://github.com/madezmedia' }
        ],
        featured: true
    },
    {
        id: 'ez-influencer-360',
        name: 'EZ Influencer 360',
        shortDescription: 'AI Music Influencer Platform with Character Creation',
        fullDescription: 'Complete influencer platform with character creation, music generation, voice synthesis, and video capabilities. Character experience engine with full production pipeline from concept to content.',
        category: ['Platform', 'Video AI', 'Music AI'],
        coverImage: '/icons/mux.svg',
        technologies: [
            { name: 'Next.js', icon: '/icons/nextjs.svg' },
            { name: 'React', icon: '/icons/react.svg' },
            { name: 'Supabase', icon: '/icons/supabase.svg' },
            { name: 'RunPod', icon: '/icons/runpod.svg' },
            { name: 'Mux', icon: '/icons/mux.svg' }
        ],
        statistics: [
            { label: 'Version', value: 'v1.0', icon: '📦', color: '#28A745' },
            { label: 'AI Models', value: '3+', icon: '🧠', color: '#D4AF37' },
            { label: 'Pipeline', value: 'Full Stack', icon: '🔄', color: '#708090' }
        ],
        links: [
            { type: 'github', url: 'https://github.com/madezmedia' }
        ],
        featured: true
    }
];
