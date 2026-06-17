import React, { useEffect, useState, useRef } from 'react';
import './ChatWidget.css';

interface Message {
    id: string;
    sender: 'user' | 'bentley';
    text: string;
    timestamp: Date;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init-1',
            sender: 'bentley',
            text: "Hello! I am Bentley, the AI Sales Co-Pilot for Mikey Shaw and Mad EZ Media.",
            timestamp: new Date()
        },
        {
            id: 'init-2',
            sender: 'bentley',
            text: "I coordinate our autonomous agentic fleets. Ask me about Mikey's pricing, his ACMI protocol, or custom integrations like OwnerScout and Folana's CNS.",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const getBentleyResponse = (input: string): string => {
        const query = input.toLowerCase();

        if (query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('money') || query.includes('investment') || query.includes('retainer')) {
            return "Mikey's B2B services—such as Custom Agentic Fleet Deployments, Executive AI Coaching, and Custom Media Pipelines—are priced on a custom proposal basis rather than transactional rates. Solutions are tailored to your architecture (Supabase, Next.js, Redis, and ACMI memory bus) and billed securely via Square Invoices. You can request a custom quote or scope complexity estimate directly on the homepage, or book a strategy brief!";
        }
        if (query.includes('acmi') || query.includes('bus') || query.includes('memory') || query.includes('correlation') || query.includes('protocol')) {
            return "ACMI (Agentic Context Memory Interface) is Mikey's custom v1.5 atomic memory bus. It synchronizes states, profiles, telemetry signals, and event timelines across independent AI subagents. This avoids fragile API links and ensures 100% state-consistency across systems like Folana.";
        }
        if (query.includes('ownerscout')) {
            return "OwnerScout is an AI Restaurant Discovery Engine built by Mikey. It uses Google Places API + Gemini to crawl and qualify leads. It aggregates Square/Toast POS signatures and writes custom cold pitches. Mikey optimized it to prospect 50 restaurants for only ~$0.91 (an 80%+ cost cut).";
        }
        if (query.includes('folana') || query.includes('journal') || query.includes('cns') || query.includes('creator')) {
            return "Folana's Journal is an autonomous creator CNS built on Next.js 16, Deepgram (aura-2-arcas TTS), RunPod lip-sync, and Composio. It runs a launchd cron loop 4x daily to draft, narrate, render, and publish high-retention video dispatches with zero human clicks.";
        }
        if (query.includes('ez') || query.includes('influencer') || query.includes('canvas') || query.includes('360')) {
            return "EZ Influencer 360 is a visual creator workspace built for Whop communities. It integrates ComfyUI, Bytedance Seedream 4.0, and RunPod InfiniteTalk. Mikey structured it with an Upstash Redis credits gateway, yielding a 2.3-second average generation speed.";
        }
        if (query.includes('madez') || query.includes('mad ez') || query.includes('migration') || query.includes('supabase')) {
            return "For Mad EZ Website V2, Mikey upgraded Airtable to Supabase PostgreSQL with Redis TTL caching. Using Next.js 16 with Turbopack, he cut build times from 40s to 3s and reduced DB queries by 99% (API latency under 10ms).";
        }
        if (query.includes('contact') || query.includes('hire') || query.includes('meeting') || query.includes('book') || query.includes('schedule') || query.includes('email') || query.includes('call')) {
            return "You can book a meeting with Mikey directly via the calendar widget on this page, or email him at michael@madezmedia.com to initiate a System Architecture Brief.";
        }
        if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
            return "Hello! How can I assist you with Mikey's autonomous fleet deployments or technical integrations today?";
        }

        return "I'm Bentley, Mikey's sales co-pilot. I can detail his Custom Agentic Fleet deployments, explain ACMI, or share metrics on OwnerScout and Folana. Try asking: 'How do I request a quote?' or 'What is OwnerScout?'";
    };

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: `msg-${Date.now()}-user`,
            sender: 'user',
            text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const replyText = getBentleyResponse(text);
            const bentleyMsg: Message = {
                id: `msg-${Date.now()}-bentley`,
                sender: 'bentley',
                text: replyText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, bentleyMsg]);
            setIsTyping(false);
        }, 800);
    };

    const quickReplies = [
        "How do I request a quote?",
        "Explain the ACMI protocol",
        "Tell me about OwnerScout",
        "How do I book a meeting?"
    ];

    return (
        <div className={`bentley-chat-widget ${isOpen ? 'is-open' : ''}`}>
            <button 
                className="bentley-chat-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle chat assistant"
            >
                <span className="toggle-icon">💬</span>
                <span className="toggle-badge">Bentley</span>
            </button>

            {isOpen && (
                <div className="bentley-chat-window">
                    <div className="bentley-chat-header">
                        <div className="bentley-avatar-container">
                            <span className="bentley-avatar">🤵</span>
                            <span className="status-indicator online"></span>
                        </div>
                        <div className="bentley-header-info">
                            <h3 className="bentley-name">Bentley</h3>
                            <p className="bentley-role">AI Sales Co-Pilot • Mad EZ</p>
                        </div>
                        <button 
                            className="bentley-close-btn"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat window"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="bentley-messages-container">
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                                <div className="chat-bubble">
                                    <p className="bubble-text">{msg.text}</p>
                                    <span className="bubble-time">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-bubble-wrapper bentley typing">
                                <div className="chat-bubble">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bentley-quick-replies">
                        {quickReplies.map((reply, index) => (
                            <button 
                                key={index} 
                                className="quick-reply-btn"
                                onClick={() => handleSend(reply)}
                            >
                                {reply}
                            </button>
                        ))}
                    </div>

                    <form 
                        className="bentley-input-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend(inputValue);
                        }}
                    >
                        <input 
                            type="text" 
                            className="bentley-chat-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask Bentley about services or case studies..."
                        />
                        <button type="submit" className="bentley-send-btn">
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ChatWidget;
