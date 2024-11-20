import React from 'react';
import './ChatWidget.css';

export interface ChatWidgetProps {}

export function ChatWidget(props: ChatWidgetProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return React.createElement(
        'div',
        {
            className: `chat-widget ${isOpen ? 'open' : ''}`,
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
                    background: '#D4AF37',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer'
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
                    background: '#1E1E1E',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    padding: '15px'
                }
            },
            [
                React.createElement(
                    'h3',
                    { style: { color: '#E0E0E0', marginBottom: '10px' } },
                    'Chat Widget'
                ),
                React.createElement(
                    'p',
                    { style: { color: '#C0C0C0' } },
                    'This is a simple chat widget placeholder.'
                )
            ]
        )
    );
}

export default ChatWidget;
