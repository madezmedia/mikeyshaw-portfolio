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
        id: 'folanas-journal',
        name: 'Folana Lanez Journal',
        shortDescription: 'Cyber-Realistic Interactive Journal & Player Interface for Virtual Music Influencer',
        fullDescription: 'Production-ready cyber-realistic journal and showcase platform for virtual music influencer Folana Lanez. Built with Next.js 15, custom media player elements, neon branding guidelines, and automated scheduling via Postiz.',
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
            { label: 'Commits', value: '4', icon: '📝', color: '#00BCD4' },          // Cyan
            { label: 'Assets', value: 'Postiz', icon: '🔄', color: '#FFCC00' },       // Yellow
            { label: 'Status', value: 'Active', icon: '🚀', color: '#CC6688' }        // Pink
        ],
        links: [
            { type: 'github', url: 'https://github.com/madezmedia/folanas-journal' }
        ],
        featured: true
    },
    {
        id: 'acmi-memory-interface',
        name: 'Agentic Context Memory Interface (ACMI)',
        shortDescription: 'Open-Source Persistent Memory & State Protocol for Autonomous AI Agents',
        fullDescription: 'The open-source state protocol (MIT) giving AI agents persistent Profile, Signals, and Timeline memory slots. Features a TypeScript SDK, CLI commands, and a model context protocol (acmi-mcp) server for cross-agent coordination.',
        category: ['Protocol', 'AI Memory', 'TypeScript SDK'],
        coverImage: '/placeholders/project-placeholder.svg',
        technologies: [
            { name: 'TypeScript', icon: '/icons/typescript.svg' },
            { name: 'Node.js', icon: '/icons/nodejs.svg' },
            { name: 'Redis', icon: '/icons/openclaw.svg' },
            { name: 'Vercel', icon: '/icons/vercel.svg' }
        ],
        statistics: [
            { label: 'Spec Version', value: 'v1.4.0', icon: '📄', color: '#FFCC00' }, // Yellow
            { label: 'SDK', value: 'TS/Node', icon: '📦', color: '#00BCD4' },        // Cyan
            { label: 'License', value: 'MIT', icon: '🔐', color: '#ffffff' }         // White
        ],
        links: [
            { type: 'github', url: 'https://github.com/madezmedia/acmi' }
        ],
        featured: true
    },
    {
        id: 'ez-influencer-360',
        name: 'EZ Influencer 360',
        shortDescription: 'Autonomous AI Creator & Music Influencer Showcase Platform',
        fullDescription: 'Production creator platform hosting automated video generation pipelines, Fanvue subscription automation, content dispatchers, and multi-agent coordination hooks powered by ACMI memory layers.',
        category: ['SaaS', 'AI Video', 'Influencer Tech'],
        coverImage: '/images/favor-ai-preview.png',
        technologies: [
            { name: 'Next.js', icon: '/icons/nextjs.svg' },
            { name: 'React', icon: '/icons/react.svg' },
            { name: 'RunPod', icon: '/icons/runpod.svg' },
            { name: 'Mux', icon: '/icons/mux.svg' },
            { name: 'Supabase', icon: '/icons/supabase.svg' }
        ],
        statistics: [
            { label: 'Commits', value: '421', icon: '💻', color: '#CC6688' },        // Pink
            { label: 'Integrations', value: 'Fanvue', icon: '🔌', color: '#00BCD4' }, // Cyan
            { label: 'Owner Agent', value: 'Claude', icon: '🤖', color: '#FFCC00' }  // Yellow
        ],
        links: [
            { type: 'github', url: 'https://github.com/madezmedia/ez-influencer-360' }
        ],
        featured: true
    },
    {
        id: 'mad-ez-media',
        name: 'Mad EZ Media Solutions',
        shortDescription: 'Enterprise Voice AI Answering Systems & Multi-Agent Restaurant Tech',
        fullDescription: 'Production deployments of conversational voice AI bots and autonomous multi-agent content generators for local businesses and restaurant networks. Features OpenClaw + VAPI integrations and custom Clerk authentication.',
        category: ['Voice AI', 'Business Tech', 'Agency Work'],
        coverImage: '/images/mad-ez-media-logo.png',
        technologies: [
            { name: 'VAPI', icon: '/icons/vapi.svg' },
            { name: 'OpenClaw', icon: '/icons/openclaw.svg' },
            { name: 'Supabase', icon: '/icons/supabase.svg' },
            { name: 'Stripe', icon: '/icons/stripe.svg' },
            { name: 'Next.js', icon: '/icons/nextjs.svg' }
        ],
        statistics: [
            { label: 'Apps Live', value: '6', icon: '📱', color: '#FFCC00' },         // Yellow
            { label: 'Revenue/Client', value: '$497/mo', icon: '💰', color: '#00BCD4' },// Cyan
            { label: 'Cost Cut', value: '90%', icon: '📉', color: '#CC6688' }         // Pink
        ],
        links: [
            { type: 'live', url: 'https://openclaw-restaurants-1dh0a6pgt-mad-ez-media.vercel.app' }
        ],
        featured: true
    }
];
