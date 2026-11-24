"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageLoading } from "@/components/ui/message-loading";

export interface ChatBubbleProps {
  variant?: "sent" | "received";
  layout?: "default" | "ai";
  className?: string;
  children: React.ReactNode;
}

export function ChatBubble({
  variant = "received",
  layout = "default",
  className,
  children,
}: ChatBubbleProps) {
  return (
    <div
      data-variant={variant}
      data-layout={layout}
      className={cn(
        "flex items-start gap-2.5",
        layout === "ai" ? "w-full items-start" : "max-w-full",
        variant === "sent" && "flex-row-reverse",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface ChatBubbleMessageProps {
  variant?: "sent" | "received";
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ChatBubbleMessage({
  variant = "received",
  isLoading,
  className,
  children,
}: ChatBubbleMessageProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed break-words",
        variant === "sent"
          ? "rounded-br-sm bg-[var(--ms-ember)] text-[#120E24] font-medium"
          : "rounded-bl-sm border border-[var(--ms-border)] bg-[var(--ms-surface)] text-[var(--ms-text)]",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2 py-0.5">
          <MessageLoading className="text-[var(--ms-accent-text)]" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export interface ChatBubbleAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export function ChatBubbleAvatar({
  src,
  alt = "Chat participant",
  fallback = "AI",
  className,
}: ChatBubbleAvatarProps) {
  return (
    <Avatar
      className={cn(
        "h-8 w-8 shrink-0 border border-[var(--ms-border)]",
        className
      )}
    >
      {src && <AvatarImage src={src} alt={alt} className="object-cover object-top" />}
      <AvatarFallback className="bg-[#120E24] font-mono text-[10px] font-bold text-[#FF6A2B]">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}

export interface ChatBubbleActionProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export function ChatBubbleAction({
  icon,
  onClick,
  label,
  className,
}: ChatBubbleActionProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      className={cn(
        "h-7 w-7 rounded-md text-[var(--ms-muted)] hover:bg-[var(--ms-surface)] hover:text-[var(--ms-text)]",
        className
      )}
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}

export function ChatBubbleActionWrapper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mt-1 flex items-center gap-1", className)}>
      {children}
    </div>
  );
}
