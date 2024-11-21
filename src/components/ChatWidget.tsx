import React, { useEffect, useState } from 'react';
import './ChatWidget.css';

export interface ChatWidgetProps {}

export function ChatWidget(props: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        // Safely get theme from document attribute
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

    const themeColors = {
        dark: {
            toggleBackground: '#D4AF37',
            containerBackground: 'rgba(30, 30, 30, 0.95)',
            border: '#333',
            headerColor: '#E0E0E0',
            textColor: '#C0C0C0'
        },
        light: {
            toggleBackground: '#28A745',
            containerBackground: 'rgba(248, 249, 250, 0.95)',
            border: '#DEE2E6',
            headerColor: '#212529',
            textColor: '#495057'
        }
    };

    const colors = themeColors[currentTheme];

    return React.createElement(
        'div',
        {
            className: `chat-widget ${isOpen ? 'open' : ''} theme-${currentTheme}`,
            style: { 
                position: 'fixed', 
                bottom: '20px', 
                right: '20px', 
                zIndex: 1000 
            }
        },
        React.createElement(
            'div',
            {
                className: 'chat-toggle',
                onClick: () => setIsOpen(!isOpen),
                style: {
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: colors.toggleBackground,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }
            },
            '💬'
        ),
        isOpen && React.createElement(
            'div',
            {
                className: 'chat-container',
                style: {
                    position: 'absolute',
                    bottom: '80px',
                    right: '0',
                    width: '300px',
                    background: colors.containerBackground,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '10px',
                    padding: '15px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                }
            },
            [
                React.createElement(
                    'h3',
                    { 
                        style: { 
                            color: colors.headerColor, 
                            marginBottom: '10px',
                            fontFamily: "'Orbitron', sans-serif",
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        } 
                    },
                    'Chat Widget'
                ),
                React.createElement(
                    'p',
                    { 
                        style: { 
                            color: colors.textColor,
                            fontFamily: "'Inter', sans-serif"
                        } 
                    },
                    'This is a simple chat widget placeholder.'
                )
            ]
        )
    );
}

export default ChatWidget;
