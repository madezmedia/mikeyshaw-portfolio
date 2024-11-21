import React, { useEffect, useState, useRef } from 'react';
import Cal from "@calcom/embed-react";
import { getCalApi } from "@calcom/embed-react";

interface CalEmbedProps {
    namespace?: string;
    calLink?: string;
}

const CalEmbed: React.FC<CalEmbedProps> = ({ 
    namespace = "ai-automation-discovery", 
    calLink = "mad-ez-media/ai-automation-discovery" 
}) => {
    const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const calContainerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const initialTheme = document.documentElement.getAttribute('data-theme') as 'dark' | 'light';
        setCurrentTheme(initialTheme || 'dark');

        const handleThemeChange = (event: CustomEvent<{theme: 'dark' | 'light'}>) => {
            setCurrentTheme(event.detail.theme);
        };

        const themeChangeListener = ((e: Event) => {
            handleThemeChange(e as CustomEvent<{theme: 'dark' | 'light'}>);
        }) as EventListener;

        document.addEventListener('theme-changed', themeChangeListener);

        return () => {
            document.removeEventListener('theme-changed', themeChangeListener);
        };
    }, []);

    useEffect(() => {
        // Intersection Observer for lazy loading
        if (calContainerRef.current) {
            observerRef.current = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observerRef.current?.disconnect();
                    }
                },
                { threshold: 0.1 }
            );
            observerRef.current.observe(calContainerRef.current);
        }

        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const initCalApi = async () => {
            try {
                setIsLoading(true);
                const cal = await getCalApi({"namespace": namespace});
                
                cal("ui", {
                    "theme": currentTheme,
                    "styles": {
                        "branding": {
                            "brandColor": currentTheme === 'dark' ? '#D4AF37' : '#28A745'
                        },
                        "colorScheme": currentTheme
                    },
                    "hideEventTypeDetails": false,
                    "layout": "column_view"
                });
                
                setTimeout(() => {
                    setIsLoading(false);
                    if (calContainerRef.current) {
                        calContainerRef.current.classList.add('loaded');
                    }
                }, 300);
            } catch (error) {
                console.error('Cal API initialization error:', error);
                setIsLoading(false);
            }
        };

        initCalApi();
    }, [currentTheme, namespace, isVisible]);

    const themeStyles = {
        dark: {
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            color: '#E0E0E0',
            borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        light: {
            backgroundColor: 'rgba(248, 249, 250, 0.9)',
            color: '#212529',
            borderColor: 'rgba(0, 0, 0, 0.1)'
        }
    };

    const currentStyles = themeStyles[currentTheme];

    return (
        <div 
            ref={calContainerRef}
            className={`cal-embed ${isLoading ? 'loading' : ''}`}
            style={{
                width: '100%', 
                height: 'auto', 
                minHeight: '800px',
                position: 'relative',
                overflow: 'visible',
                borderRadius: '8px',
                transition: 'all 0.5s ease',
                opacity: isLoading ? 0.5 : 1,
                transform: isLoading ? 'scale(0.98)' : 'scale(1)',
                backgroundColor: currentStyles.backgroundColor,
                color: currentStyles.color,
                border: `1px solid ${currentStyles.borderColor}`
            }}
        >
            {isLoading && (
                <div 
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        fontFamily: "'Inter', sans-serif"
                    }}
                >
                    <div 
                        style={{
                            width: '50px',
                            height: '50px',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTop: '3px solid #D4AF37',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 15px'
                        }}
                    />
                    <p>Loading Booking Calendar...</p>
                </div>
            )}
            {isVisible && (
                <Cal 
                    namespace={namespace}
                    calLink={calLink}
                    style={{
                        width: "100%", 
                        height: "100%", 
                        minHeight: '800px',
                        opacity: isLoading ? 0 : 1,
                        transition: 'opacity 0.5s ease',
                        overflow: "visible",
                        border: 'none',
                        borderRadius: '8px'
                    }}
                    config={{
                        layout: "column_view",
                        theme: currentTheme
                    }}
                />
            )}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .cal-embed.loading {
                    cursor: wait;
                }
                .cal-embed iframe {
                    min-height: 800px !important;
                    height: 100% !important;
                }
            `}</style>
        </div>
    );
};

export default CalEmbed;
