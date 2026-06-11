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
        fullDescription: 'AI-powered phone answering system for restaurants. Handles missed calls, captures leads, takes messages, and answers common questions using VAPI + OpenClaw architecture. Launching with Cuzzo\'s Cuisine.',
        category: ['Voice AI', 'Restaurant Tech', 'SaaS'],
        coverImage: '/images/favor-ai-preview.png',
        technologies: [
            { name: 'VAPI', icon: '/icons/vapi.svg' },
            { name: 'OpenClaw', icon: '/icons/openclaw.svg' },
            { name: 'Supabase', icon: '/icons/supabase.svg' },
            { name: 'Next.js', icon: '/icons/nextjs.svg' },
            { name: 'Vercel', icon: '/icons/vercel.svg' }
        ],
        statistics: [
            { label: 'Revenue/Client', value: '$497/mo', icon: '💰', color: '#FFCC00' }, // Yellow
            { label: 'Build Time', value: '48hrs', icon: '⚡', color: '#00BCD4' },   // Cyan
            { label: 'Status', value: 'Active', icon: '🚀', color: '#CC6688' }       // Pink
        ],
        links: [
            { type: 'live', url: 'https://openclaw-restaurants-1dh0a6pgt-mad-ez-media.vercel.app' }
        ],
        featured: true
    },

    {
        id: 'folanas-journal',
        name: 'Folana Lanez Journal',
        shortDescription: 'Cyber-Realistic Interactive Journal & Player Interface for Virtual Music Influencer',
        fullDescription: 'Front-end experience for virtual music influencer Folana Lanez. Features a custom audio/video player, neon cyber-brutalist theme aesthetics, locked character traits signature, and automatic content scheduling using Postiz.',
        category: ['Web Design', 'Music AI', 'Cyber Branding'],
        coverImage: '/images/repubot-logo-v1.png',
        technologies: [
            { name: 'Next.js', icon: '/icons/nextjs.svg' },
            { name: 'React', icon: '/icons/react.svg' },
            { name: 'Supabase', icon: '/icons/supabase.svg' },
            { name: 'Mux', icon: '/icons/mux.svg' },
            { name: 'ElevenLabs', icon: '/icons/elevenlabs.svg' }
        ],
        statistics: [
            { label: 'Margins', value: '88%', icon: '📉', color: '#00BCD4' },        // Cyan
            { label: 'Assets Sync', value: 'Postiz', icon: '🔄', color: '#FFCC00' }, // Yellow
            { label: 'Character', value: 'Locked', icon: '🔐', color: '#CC6688' }   // Pink
        ],
        links: [
            { type: 'github', url: 'https://github.com/madezmedia/folanas-journal' }
        ],
        featured: true
    },

    {
        id: 'core-pumping',
        name: 'Core Pumping Solutions',
        shortDescription: 'Heavy Concrete Pumping Lead Engine & Showcase Marketing Platform',
        fullDescription: 'Production concrete pumping service engine for Core Pumping Solutions, LLC in Mint Hill / Harrisburg, NC (Charlotte metro). Showcases boom-pump operations (28m-42m) with live dispatcher lead capture. Optimized for 100% Core Web Vitals.',
        category: ['Heavy Industry', 'Marketing Engine', 'Next.js'],
        coverImage: '/placeholders/project-placeholder.svg',
        technologies: [
            { name: 'Astro', icon: '/icons/astro.svg' },
            { name: 'React', icon: '/icons/react.svg' },
            { name: 'Tailwind CSS', icon: '/icons/tailwindcss.svg' },
            { name: 'Vercel', icon: '/icons/vercel.svg' }
        ],
        statistics: [
            { label: 'Lighthouse', value: '100%', icon: '📊', color: '#FFCC00' },    // Yellow
            { label: 'Lead Gen', value: 'Active', icon: '⚡', color: '#00BCD4' },    // Cyan
            { label: 'USDOT', value: '4269996', icon: '🚚', color: '#ffffff' }     // White
        ],
        links: [
            { type: 'github', url: 'https://github.com/madezmedia/mikeyshaw-portfolio' }
        ],
        featured: true
    },

    {
        id: 'ownerscout-leadgen',
        name: 'OwnerScout Lead Engine',
        shortDescription: 'Autonomous Business Metadata Batch Scanner & Lead Database Caching System',
        fullDescription: 'Autonomous lead scouting engine that discovers and parses business metadata, manages outreach pipeline states, integrates with Supabase for data caching, uses Drizzle ORM schemas, and runs Clerk auth.',
        category: ['Lead Generation', 'Automation', 'Database'],
        coverImage: '/placeholders/project-placeholder.svg',
        technologies: [
            { name: 'Supabase', icon: '/icons/supabase.svg' },
            { name: 'TypeScript', icon: '/icons/typescript.svg' },
            { name: 'Node.js', icon: '/icons/nodejs.svg' },
            { name: 'OpenAI', icon: '/icons/openai.svg' }
        ],
        statistics: [
            { label: 'Scan Rate', value: 'Batch', icon: '⏱️', color: '#CC6688' },    // Pink
            { label: 'Auth System', value: 'Clerk', icon: '🤖', color: '#00BCD4' },   // Cyan
            { label: 'Data Cache', value: 'Drizzle', icon: '💾', color: '#FFCC00' }  // Yellow
        ],
        links: [
            { type: 'github', url: 'https://github.com/madezmedia' }
        ],
        featured: true
    }
];
