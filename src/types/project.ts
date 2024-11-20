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
        id: 'favor-ai',
        name: 'Favor AI',
        shortDescription: 'Professional Sports Betting Analytics Platform',
        fullDescription: 'An AI-powered platform combining cutting-edge technology with comprehensive sports data to provide intelligent betting insights and recommendations.',
        category: ['AI', 'Sports Analytics', 'Machine Learning'],
        coverImage: '/images/favor-ai-preview.png',
        technologies: [
            { name: 'React', icon: '/icons/react.svg' },
            { name: 'TypeScript', icon: '/icons/typescript.svg' },
            { name: 'Node.js', icon: '/icons/nodejs.svg' },
            { name: 'GraphQL', icon: '/icons/graphql.svg' }
        ],
        statistics: [
            { 
                label: 'Prediction Accuracy', 
                value: '94%', 
                icon: '📊', 
                color: '#28A745' 
            },
            { 
                label: 'Active Users', 
                value: '10K+', 
                icon: '👥', 
                color: '#D4AF37' 
            },
            { 
                label: 'Daily Predictions', 
                value: '500+', 
                icon: '🔮', 
                color: '#708090' 
            }
        ],
        links: [
            { 
                type: 'github', 
                url: 'https://github.com/madezmedia/Favor-New' 
            },
            { 
                type: 'live', 
                url: 'https://astounding-fox-50fec6.netlify.app/' 
            }
        ],
        featured: true
    },
    {
        id: 'repubot',
        name: 'Repubot',
        shortDescription: 'Manage Your Online Reputation with AI',
        fullDescription: 'An advanced AI-powered platform designed to monitor, analyze, and improve business reputation across multiple online platforms using cutting-edge artificial intelligence technology.',
        category: ['AI', 'Reputation Management', 'Business Intelligence'],
        coverImage: '/images/repubot-logo-v1.png',
        technologies: [
            { name: 'React', icon: '/icons/react.svg' },
            { name: 'TypeScript', icon: '/icons/typescript.svg' },
            { name: 'Node.js', icon: '/icons/nodejs.svg' },
            { name: 'GraphQL', icon: '/icons/graphql.svg' }
        ],
        statistics: [
            { 
                label: 'Platforms Monitored', 
                value: '50+', 
                icon: '🌐', 
                color: '#28A745' 
            },
            { 
                label: 'Reputation Insights', 
                value: 'Real-time', 
                icon: '🔍', 
                color: '#D4AF37' 
            },
            { 
                label: 'AI Accuracy', 
                value: '92%', 
                icon: '📈', 
                color: '#708090' 
            }
        ],
        links: [
            { 
                type: 'github', 
                url: 'https://github.com/madezmedia/Repubot' 
            },
            { 
                type: 'live', 
                url: 'https://repubot.pro' 
            }
        ],
        featured: true
    }
];
