"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  CornerDownLeft,
  MessageSquare,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { detectCoreLinks } from "../utils/previews";
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { trackEvent } from "@/lib/analytics";

interface Message {
  id: string;
  sender: "user" | "bentley";
  text: string;
  timestamp: Date;
}

const QUICK_REPLIES = [
  "How do engagements work?",
  "What is LogMem?",
  "Tell me about Mad EZ Voice",
  "How do I book a call?",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    sender: "bentley",
    text: "Hello! I am Bentley, the AI systems co-pilot for Mikey Shaw and Mad EZ Media.",
    timestamp: new Date(),
  },
  {
    id: "init-2",
    sender: "bentley",
    text: "Ask me about Fractional CTO engagements, LogMem shared agent memory, Mad EZ Voice for Charlotte trades, or how to book a discovery call.",
    timestamp: new Date(),
  },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [leadId, setLeadId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateAnonId = () =>
    "anon_" + Math.random().toString(36).substring(2, 15);

  useEffect(() => {
    setIsMounted(true);

    let currentLeadId = localStorage.getItem("bentley_lead_id");
    if (!currentLeadId) {
      currentLeadId = generateAnonId();
      localStorage.setItem("bentley_lead_id", currentLeadId);
    }
    setLeadId(currentLeadId);

    const handleIdentifiedLead = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.leadId) {
        const newLeadId = customEvent.detail.leadId;
        localStorage.setItem("bentley_lead_id", newLeadId);
        setLeadId(newLeadId);

        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "bentley",
            text: `[LogMem linked] Context merged. Reference: ${
              customEvent.detail.quoteId || "Active"
            }. I am synced with your architecture request.`,
            timestamp: new Date(),
          },
        ]);
      }
    };

    window.addEventListener("squareQuoteSubmitted", handleIdentifiedLead);
    return () => {
      window.removeEventListener("squareQuoteSubmitted", handleIdentifiedLead);
    };
  }, []);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [isOpen]);

  const getBentleyResponse = (input: string): string => {
    const query = input.toLowerCase();

    if (
      query.includes("price") ||
      query.includes("pricing") ||
      query.includes("cost") ||
      query.includes("engagement") ||
      query.includes("retainer") ||
      query.includes("quote")
    ) {
      return "Mikey structures Fractional CTO, AI Systems Architecture, and custom agent fleet engagements around your team's scope and roadmap rather than off-the-shelf tiers. Book a 30-minute discovery call in the scheduler on this page to map out fit and cadence.";
    }
    if (
      query.includes("logmem") ||
      query.includes("acmi") ||
      query.includes("memory") ||
      query.includes("protocol") ||
      query.includes("bus")
    ) {
      return "LogMem (logmem.si) is Mikey's shared memory layer for multi-agent teams. It tracks Who is on shift, Now (open work and handoffs), and the live Log so independent agents coordinate cleanly across sessions without dropping state.";
    }
    if (
      query.includes("voice") ||
      query.includes("trade") ||
      query.includes("plumber") ||
      query.includes("hvac") ||
      query.includes("madez") ||
      query.includes("mad ez")
    ) {
      return "Mad EZ Voice is our 24/7 AI receptionist and emergency dispatch system built for Charlotte plumbing, HVAC, and electrical teams. It answers missed calls, triages emergencies, and locks jobs directly onto the dispatch board at madezmedia.com.";
    }
    if (query.includes("ownerscout")) {
      return "OwnerScout is an AI lead discovery engine built with Google Places and Gemini. It inspects POS signals, qualifies local operators, and drafts tailored outreach at a fraction of manual prospecting cost.";
    }
    if (
      query.includes("folana") ||
      query.includes("journal") ||
      query.includes("creator")
    ) {
      return "Folana's Journal is an autonomous creator media pipeline on Next.js 16, Deepgram TTS, RunPod lip-sync, and scheduled dispatch loops that produce and publish video dispatches end to end.";
    }
    if (
      query.includes("contact") ||
      query.includes("hire") ||
      query.includes("meeting") ||
      query.includes("book") ||
      query.includes("schedule") ||
      query.includes("email") ||
      query.includes("call")
    ) {
      return "You can grab a 15-minute or 30-minute slot right inside the interactive scheduler on this page (Tue through Thu, 10 AM to 3 PM ET), or email Mikey directly at michael@madezmedia.com.";
    }
    if (query.includes("blog") || query.includes("medium") || query.includes("article") || query.includes("write")) {
      return "Mikey publishes system architecture dispatches on Medium at https://medium.com/@madezmedia covering shared agent memory, multi-agent fleets, and production voice AI.";
    }
    if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
      return "Hey! Ask me about Fractional CTO engagements, LogMem shared memory, Mad EZ Voice, or booking time with Mikey.";
    }

    return "I am Bentley, Mikey's AI co-pilot. I can walk you through Fractional CTO engagements, LogMem shared memory, Mad EZ Voice for trades, or how to book a discovery call.";
  };

  const requestBentleyReply = async (conversation: Message[], promptText: string) => {
    setIsTyping(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation, leadId }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      if (data.text) {
        if (data.leadId && data.leadId !== leadId) {
          localStorage.setItem("bentley_lead_id", data.leadId);
          setLeadId(data.leadId);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-bentley`,
            sender: "bentley",
            text: data.text,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch {
      const replyText = getBentleyResponse(promptText);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-bentley`,
          sender: "bentley",
          text: replyText,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    trackEvent("bentley_chat_send", { length: trimmed.length });

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");

    await requestBentleyReply(updatedMessages, trimmed);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((cur) => (cur === id ? null : cur));
      }, 1600);
    } catch {
      // Clipboard blocked in non-secure context
    }
  };

  const handleRegenerate = async (msgIndex: number) => {
    if (isTyping) return;
    // Find the nearest preceding user message
    let promptText = "";
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === "user") {
        promptText = messages[i].text;
        break;
      }
    }
    if (!promptText) return;
    const trimmedHistory = messages.slice(0, msgIndex);
    setMessages(trimmedHistory);
    await requestBentleyReply(trimmedHistory, promptText);
  };

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    trackEvent("bentley_chat_toggle", { open: next });
  };

  return (
    <div className="fixed right-4 bottom-4 z-[1000] font-sans sm:right-6 sm:bottom-6">
      {/* Expandable Chat Sheet */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Bentley AI Assistant"
          className="mb-3 flex h-[min(560px,calc(100dvh-108px))] w-[min(392px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[20px] border border-[var(--ms-border)] bg-[var(--ms-ground)] text-[var(--ms-text)] shadow-[0_24px_60px_-16px_rgba(18,14,36,0.45)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-[#3A2F6B] bg-[#120E24] px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ChatBubbleAvatar
                  src="/images/mikey-shaw-studio.jpg"
                  alt="Bentley AI Co-Pilot"
                  fallback="BN"
                  className="h-10 w-10 border-2 border-[#FF6A2B]"
                />
                <span
                  className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[#120E24] bg-[#1FB6FF]"
                  aria-hidden="true"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3
                    className="m-0 text-sm font-black tracking-tight text-white"
                    style={{ fontFamily: "var(--ms-font-head)" }}
                  >
                    Bentley
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1E1640] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#FF6A2B]">
                    <Sparkles className="size-2.5" aria-hidden="true" />
                    Live
                  </span>
                </div>
                <p className="m-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4BDE6]">
                  AI Co-Pilot · Mikey Shaw
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat window"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#C4BDE6] transition-colors hover:bg-[#1E1640] hover:text-white"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Message List using 21st.dev ChatBubble primitives */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              const variant = isUser ? "sent" : "received";
              const detectedLinks = detectCoreLinks(msg.text);
              const canRegenerate =
                !isUser &&
                index > 1 &&
                messages.slice(0, index).some((m) => m.sender === "user");

              return (
                <div key={msg.id} className="space-y-2">
                  <ChatBubble variant={variant} layout="ai">
                    <ChatBubbleAvatar
                      src={isUser ? undefined : "/images/mikey-shaw-studio.jpg"}
                      alt={isUser ? "You" : "Bentley"}
                      fallback={isUser ? "YOU" : "BN"}
                      className={
                        isUser
                          ? "border-[#FF6A2B]/40"
                          : "border-[var(--ms-border)]"
                      }
                    />

                    <div
                      className={`flex max-w-[82%] flex-col ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      <ChatBubbleMessage variant={variant}>
                        <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                      </ChatBubbleMessage>

                      <div
                        className={`mt-1 flex items-center gap-1.5 ${
                          isUser ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <span className="font-mono text-[10px] text-[var(--ms-muted)]">
                          {isMounted
                            ? msg.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>

                        {!isUser && (
                          <ChatBubbleActionWrapper className="mt-0">
                            <ChatBubbleAction
                              label={copiedId === msg.id ? "Copied" : "Copy message"}
                              onClick={() => handleCopy(msg.id, msg.text)}
                              icon={
                                copiedId === msg.id ? (
                                  <Check className="size-3 text-[#FF6A2B]" />
                                ) : (
                                  <Copy className="size-3" />
                                )
                              }
                            />
                            {canRegenerate && (
                              <ChatBubbleAction
                                label="Regenerate response"
                                onClick={() => handleRegenerate(index)}
                                icon={<RotateCcw className="size-3" />}
                              />
                            )}
                          </ChatBubbleActionWrapper>
                        )}
                      </div>
                    </div>
                  </ChatBubble>

                  {/* Rich Link Preview Cards */}
                  {detectedLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="ml-10 max-w-[272px] overflow-hidden rounded-xl border border-[var(--ms-border)] bg-[var(--ms-surface)] shadow-sm transition-colors hover:border-[var(--ms-accent-text)]"
                    >
                      <img
                        src={link.image}
                        alt={link.title}
                        className="h-24 w-full object-cover"
                      />
                      <div className="space-y-1.5 p-3">
                        <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ms-muted)]">
                          {link.domain}
                        </span>
                        <h4 className="m-0 font-sans text-xs font-bold leading-snug text-[var(--ms-text)]">
                          {link.title}
                        </h4>
                        <p className="m-0 line-clamp-2 font-sans text-[11px] leading-relaxed text-[var(--ms-muted)]">
                          {link.description}
                        </p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex min-h-[36px] w-full items-center justify-center rounded-[var(--ms-r-button)] bg-[var(--ms-btn-bg)] px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ms-btn-fg)] no-underline transition-opacity hover:opacity-90"
                        >
                          {link.ctaText}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {isTyping && (
              <ChatBubble variant="received" layout="ai">
                <ChatBubbleAvatar
                  src="/images/mikey-shaw-studio.jpg"
                  alt="Bentley"
                  fallback="BN"
                />
                <ChatBubbleMessage variant="received" isLoading />
              </ChatBubble>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-[var(--ms-border)] bg-[var(--ms-surface)] px-3 py-2.5">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                type="button"
                disabled={isTyping}
                onClick={() => handleSend(reply)}
                className="shrink-0 rounded-full border border-[var(--ms-border)] bg-[var(--ms-ground)] px-3 py-1.5 font-sans text-[11px] font-semibold text-[var(--ms-text)] transition-colors hover:border-[var(--ms-ember)] hover:text-[var(--ms-accent-text)] disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            className="flex items-center gap-2 border-t border-[var(--ms-border)] bg-[var(--ms-ground)] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Bentley about systems or calls..."
              aria-label="Message Bentley"
              className="min-h-[44px] flex-1 rounded-xl border border-[var(--ms-border)] bg-[var(--ms-surface)] px-3.5 text-sm text-[var(--ms-text)] placeholder:text-[var(--ms-muted)] focus:border-[var(--ms-ember)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
              className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#FF6A2B] text-[#120E24] transition-transform hover:-translate-y-0.5 disabled:opacity-45 disabled:hover:translate-y-0"
            >
              <CornerDownLeft className="size-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle FAB */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close Bentley chat" : "Open Bentley chat assistant"}
          className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-[#3A2F6B] bg-[#120E24] px-5 py-2.5 text-white shadow-[0_12px_32px_-8px_rgba(18,14,36,0.55)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#FF6A2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6A2B]"
        >
          {isOpen ? (
            <X className="size-4 text-[#FF6A2B]" aria-hidden="true" />
          ) : (
            <MessageSquare className="size-4 text-[#FF6A2B]" aria-hidden="true" />
          )}
          <span className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
            {isOpen ? "Close" : "Bentley"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ChatWidget;
