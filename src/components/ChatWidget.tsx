import React, { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hi! I\'m Mikey\'s AI assistant. How can I help you today?', sender: 'bot', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { 
      text: input, 
      sender: 'user', 
      timestamp: Date.now() 
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulated AI response - replace with actual AI service
      const response = await simulateAIResponse(input);
      
      const botMessage: Message = {
        text: response,
        sender: 'bot',
        timestamp: Date.now()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: Date.now()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Simulated AI response function
  const simulateAIResponse = (userInput: string): Promise<string> => {
    const responses: { [key: string]: string } = {
      'hi': 'Hello! Welcome to Mikey\'s portfolio.',
      'hello': 'Hi there! How can I help you today?',
      'who are you': 'I\'m an AI assistant for Mikey Shaw\'s portfolio.',
      'what do you do': 'I can help you navigate Mikey\'s portfolio and answer questions about his work.',
      'portfolio': 'Mikey is a skilled developer with expertise in web technologies, 3D graphics, and interactive design.',
    };

    return new Promise((resolve) => {
      const lowercaseInput = userInput.toLowerCase().trim();
      const matchedResponse = Object.keys(responses).find(key => 
        lowercaseInput.includes(key)
      );

      resolve(matchedResponse 
        ? responses[matchedResponse] 
        : "That's an interesting point! Feel free to ask me more about Mikey's work."
      );
    });
  };

  return (
    <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
      <button 
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Chat" : "Open Chat"}
      >
        {isOpen ? '×' : '💬'}
      </button>
      
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>Chat with Mikey's AI</h3>
          </div>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div 
                key={msg.timestamp} 
                className={`message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              aria-label="Chat input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
