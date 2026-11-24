"use client"

import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"

/*
 * OpenSlotBooking: a "book a call" section. A two-tone display headline, then a
 * working scheduler in a quiet window that sits on a tilted colour slab: host card,
 * durations, a timezone-aware week of open slots, an "Overlay my calendar" switch
 * that hatches the visitor's own busy blocks across the grid, and a slot that grows
 * into a confirm card and flips into a ticket with an .ics download.
 *
 * Self-contained: one file, scoped CSS, no dependencies beyond React.
 */

// #region schedule
export type OsbWeekly = { weekday: number; from: string; to: string; title?: string }
export type OsbDated = { start: string | number | Date; end: string | number | Date; title?: string }
export type OsbBusy = OsbWeekly | OsbDated
export type OsbHours = { days: number[]; from: string; to: string }
export type OsbState = "open" | "taken" | "past" | "clash"
export type OsbSlot = { start: number; end: number; col: number; min: number; state: OsbState; clash: string }
export type OsbBlock = { col: number; from: number; to: number; title: string }
export type OsbWall = { y: number; m: number; d: number; dow: number; min: number; key: number }
export type OsbSpan = { start: number; end: number; title: string }
export type OsbPlan = {
  weekKey: number
  displayTz: string
  hostTz: string
  hours: OsbHours
  duration: number
  step: number
  now: number
  noticeMin: number
  hostBusy: OsbBusy[]
  visitor: OsbBusy[]
  overlay: boolean
  /** The zone the visitor's weekly rules are written in (their own). Defaults to displayTz. */
  visitorTz?: string
}

export const OSB_DAY = 86400000

/** "09:30" → 570. Anything unreadable is midnight. */
export function osbMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm).trim())
  return m ? Math.min(1440, Number(m[1]) * 60 + Number(m[2])) : 0
}

const osbFmt: { [tz: string]: Intl.DateTimeFormat } = {}

/** Minutes the wall clock in `tz` is ahead of UTC at instant `ms`. */
export function osbOffset(ms: number, tz: string): number {
  let f = osbFmt[tz]
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
    osbFmt[tz] = f
  }
  const t = Math.floor(ms / 1000) * 1000
  const p: { [k: string]: number } = {}
  for (const part of f.formatToParts(new Date(t))) if (part.type !== "literal") p[part.type] = Number(part.value)
  return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second) - t) / 60000)
}

/** The wall clock in `tz` at instant `ms`; `key` is the calendar day as days since 1970-01-01. */
export function osbWall(ms: number, tz: string): OsbWall {
  const w = new Date(ms + osbOffset(ms, tz) * 60000)
  const y = w.getUTCFullYear()
  const m = w.getUTCMonth() + 1
  const d = w.getUTCDate()
  return { y, m, d, dow: w.getUTCDay(), min: w.getUTCHours() * 60 + w.getUTCMinutes(), key: Math.floor(Date.UTC(y, m - 1, d) / OSB_DAY) }
}

/** The instant at which the wall clock in `tz` reads `min` minutes into calendar day `key`. */
export function osbAt(key: number, min: number, tz: string): number {
  const guess = key * OSB_DAY + min * 60000
  let t = guess - osbOffset(guess, tz) * 60000
  const again = guess - osbOffset(t, tz) * 60000
  if (again !== t) t = again
  return t
}

/** First calendar day of the week holding `ms`, read in `tz`. */
export function osbWeekKey(ms: number, tz: string, weekStartsOn: number): number {
  const w = osbWall(ms, tz)
  return w.key - ((w.dow - weekStartsOn + 7) % 7)
}

function osbTime(v: string | number | Date): number {
  return v instanceof Date ? v.getTime() : typeof v === "number" ? v : Date.parse(v)
}

/** Busy entries as absolute spans. Weekly entries repeat on days [fromKey, toKey], read in `tz`. */
export function osbSpans(list: OsbBusy[], fromKey: number, toKey: number, tz: string): OsbSpan[] {
  const out: OsbSpan[] = []
  for (const b of list) {
    if ("weekday" in b) {
      for (let k = fromKey; k <= toKey; k++) {
        if (new Date(k * OSB_DAY).getUTCDay() !== b.weekday) continue
        const s = osbAt(k, osbMinutes(b.from), tz)
        const e = osbAt(k, osbMinutes(b.to), tz)
        if (e > s) out.push({ start: s, end: e, title: b.title || "Busy" })
      }
    } else {
      const s = osbTime(b.start)
      const e = osbTime(b.end)
      if (Number.isFinite(s) && Number.isFinite(e) && e > s) out.push({ start: s, end: e, title: b.title || "Busy" })
    }
  }
  return out
}

/**
 * Every slot of the display week. Hours and host busy time are the host's; the week,
 * the columns and the visitor's own calendar are the visitor's.
 */
export function osbSlots(p: OsbPlan): OsbSlot[] {
  const from = osbMinutes(p.hours.from)
  const to = osbMinutes(p.hours.to)
  const step = Math.max(5, p.step)
  const dur = Math.max(5, p.duration)
  const busy = osbSpans(p.hostBusy, p.weekKey - 2, p.weekKey + 8, p.hostTz)
  const mine = p.overlay ? osbSpans(p.visitor, p.weekKey - 2, p.weekKey + 8, p.visitorTz || p.displayTz) : []
  const out: OsbSlot[] = []
  for (let k = p.weekKey - 1; k <= p.weekKey + 7; k++) {
    if (p.hours.days.indexOf(new Date(k * OSB_DAY).getUTCDay()) < 0) continue
    for (let t = from; t + dur <= to; t += step) {
      const start = osbAt(k, t, p.hostTz)
      const end = start + dur * 60000
      const w = osbWall(start, p.displayTz)
      const col = w.key - p.weekKey
      if (col < 0 || col > 6) continue
      let state: OsbState = "open"
      let clash = ""
      if (start < p.now + p.noticeMin * 60000) state = "past"
      else if (busy.some((b) => b.start < end && b.end > start)) state = "taken"
      else {
        const c = mine.find((b) => b.start < end && b.end > start)
        if (c) {
          state = "clash"
          clash = c.title
        }
      }
      out.push({ start, end, col, min: w.min, state, clash })
    }
  }
  return out.sort((a, b) => a.start - b.start)
}

/** The visitor's busy spans cut into per-column blocks for the display week. Weekly rules are read in `srcTz`. */
export function osbBlocks(list: OsbBusy[], weekKey: number, tz: string, srcTz?: string): OsbBlock[] {
  const out: OsbBlock[] = []
  for (const s of osbSpans(list, weekKey - 2, weekKey + 8, srcTz || tz)) {
    let a = s.start
    let guard = 0
    while (a < s.end && guard++ < 14) {
      const w = osbWall(a, tz)
      const b = Math.min(s.end, osbAt(w.key + 1, 0, tz))
      const col = w.key - weekKey
      if (col >= 0 && col <= 6) out.push({ col, from: w.min, to: w.min + Math.round((b - a) / 60000), title: s.title })
      a = b
    }
  }
  return out
}

/** The minute range the grid shows: whole hours around every slot of the week. */
export function osbRange(slots: OsbSlot[], duration: number): [number, number] {
  let lo = Infinity
  let hi = -Infinity
  for (const s of slots) {
    lo = Math.min(lo, s.min)
    hi = Math.max(hi, s.min + duration)
  }
  if (!Number.isFinite(lo)) return [540, 1020]
  return [Math.floor(lo / 60) * 60, Math.min(1500, Math.ceil(hi / 60) * 60)]
}

/** The first week (from the current one) with at least `want` open slots, so frame one is never empty. */
export function osbFirstWeek(p: OsbPlan, weeksAhead: number, want: number): number {
  for (let w = 0; w <= weeksAhead; w++) {
    const key = p.weekKey + w * 7
    const open = osbSlots({ ...p, weekKey: key, overlay: false }).filter((s) => s.state === "open")
    const days = new Set(open.map((s) => s.col)).size
    if (open.length >= want && (days >= 2 || p.hours.days.length < 2)) return key
  }
  return p.weekKey
}

/** White text on `hex` when it reads at 4:1 or better, otherwise near-black. */
export function osbInk(hex: string): string {
  let h = String(hex).replace("#", "").trim()
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return "#0B0D14"
  const ch = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
  // white wins whenever it still clears 4:1, the way designers set text on a saturated blue
  return 1.05 / (L + 0.05) >= 4 ? "#FFFFFF" : "#0B0D14"
}

export function osbEmailOk(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
}

/** A one-event calendar file any calendar app imports. */
export function osbIcs(e: { start: number; end: number; title: string; description: string; location: string; uid: string; stamp?: number }): string {
  const z = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1")
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//open-slot-booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + e.uid,
    "DTSTAMP:" + z(e.stamp ?? Date.now()),
    "DTSTART:" + z(e.start),
    "DTEND:" + z(e.end),
    "SUMMARY:" + esc(e.title),
    "DESCRIPTION:" + esc(e.description),
    "LOCATION:" + esc(e.location),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}
// #endregion

export type OsbPresetName = "mikey" | "postmark" | "sunrise" | "lagoon" | "graphite" | "berry"

export type OsbColors = {
  /** The tilted slab behind the window. */
  slab: string
  /** The accent line of the headline, light and dark. */
  from: string
  to: string
  fromDark: string
  toDark: string
  /** Buttons, the picked day and the hovered slot. */
  action: string
  /** The window. */
  window: string
}

export const OSB_PRESETS: { [name: string]: OsbColors } = {
  mikey: { slab: "#FF6A2B", from: "#B2410E", to: "#FF6A2B", fromDark: "#FF6A2B", toDark: "#FFC93C", action: "#FF6A2B", window: "#120E24" },
  postmark: { slab: "#FF5A36", from: "#FF5A36", to: "#D81B7A", fromDark: "#FF6B47", toDark: "#FF4FA3", action: "#FF5A36", window: "#14161B" },
  sunrise: { slab: "#FFC629", from: "#FFB21A", to: "#FF5B2E", fromDark: "#FFC629", toDark: "#FF6A3D", action: "#2F6BFF", window: "#0E1426" },
  lagoon: { slab: "#3FE0B5", from: "#0FB58A", to: "#1D8CFF", fromDark: "#3FE0B5", toDark: "#45A6FF", action: "#3FE0B5", window: "#062228" },
  graphite: { slab: "#FF4F2B", from: "#141414", to: "#8C8C8C", fromDark: "#FFFFFF", toDark: "#8C8C8C", action: "#FF4F2B", window: "#151515" },
  berry: { slab: "#FF8CC0", from: "#FF3D7F", to: "#FF9A3D", fromDark: "#FF6B9D", toDark: "#FFB061", action: "#FF3D7F", window: "#1C0F1E" },
}

export type OsbHost = {
  name: string
  role?: string
  /** Photo URL. Without one the host gets a stamped monogram. */
  avatar?: string
  initials?: string
  /** The words that run around the stamp. */
  stamp?: string
  /** Shown next to the host's local time, e.g. "Lisbon". Defaults to the timezone's city. */
  city?: string
}

/** Anything with a `then`: a promise from your calendar API. */
export type OsbThenable = { then: (ok: (events: OsbBusy[]) => unknown, fail?: (err: unknown) => unknown) => unknown }

export type OsbLabels = {
  pick: string
  overlay: string
  overlayShort: string
  connecting: string
  overlayError: string
  howLong: string
  minutes: string
  showTimesIn: string
  today: string
  copyLink: string
  copied: string
  name: string
  email: string
  note: string
  optional: string
  nameError: string
  emailError: string
  bookError: string
  back: string
  confirm: string
  sending: string
  booked: string
  /** "{email}" is replaced with the visitor's address. Null hides the sentence. */
  invite: string | null
  addToCalendar: string
  another: string
  open: string
  busy: string
  yours: string
  yourCalendar: string
  timesIn: string
  checking: string
  empty: string
  nextWeek: string
}

export const OSB_LABELS: OsbLabels = {
  pick: "Choose a time",
  overlay: "Check against my calendar",
  overlayShort: "My calendar",
  connecting: "Connecting your calendar…",
  overlayError: "Couldn't reach your calendar. Retry",
  howLong: "How long",
  minutes: "min",
  showTimesIn: "Show times in",
  today: "Today",
  copyLink: "Copy link",
  copied: "Copied",
  name: "Your name",
  email: "Work email",
  note: "Anything to read first?",
  optional: "(optional)",
  nameError: "Add your name so we know who to expect.",
  emailError: "That email doesn't look complete.",
  bookError: "That slot couldn't be booked. Try again, or pick another time.",
  back: "Back",
  confirm: "Confirm booking",
  sending: "Booking…",
  booked: "You're booked.",
  invite: "The invite is on its way to {email}.",
  addToCalendar: "Add to calendar",
  another: "Pick another time",
  open: "Open",
  busy: "Busy",
  yours: "Booked",
  yourCalendar: "Your calendar",
  timesIn: "Times in",
  checking: "Checking availability…",
  empty: "No open slots this week.",
  nextWeek: "See next week",
}

export type OsbBooking = {
  start: Date
  end: Date
  duration: number
  timeZone: string
  name: string
  email: string
  note: string
}

export type OpenSlotBookingProps = {
  /** Null (with no description or altContact) renders the scheduler alone, for pages with their own heading. */
  headline?: string | null
  headlineAccent?: string
  description?: string | null
  /** A quieter way to reach you, under the description. Omit to hide. */
  altContact?: { label: string; href: string } | null
  host?: OsbHost
  meetingTitle?: string
  /** One or two first-person sentences about the call. */
  agenda?: string
  location?: string
  responseNote?: string
  /** Shown in the window's address pill; the copy button copies `bookingHref` or this. */
  bookingUrl?: string
  bookingHref?: string
  durations?: number[]
  defaultDuration?: number
  /** Minutes between slot starts. */
  step?: number
  hostTimeZone?: string
  /** Options for the visitor's timezone. Their detected zone is added when missing. */
  timeZones?: string[]
  hours?: OsbHours
  /** Hours of notice the host needs before a slot can be booked. */
  noticeHours?: number
  weeksAhead?: number
  weekStartsOn?: 0 | 1
  clock?: "12h" | "24h"
  /** The host's busy time: weekly rules in the host's zone, or dated spans. */
  hostBusy?: OsbBusy[]
  /** Called once per shown week with its bounds; resolve to the host's busy spans (a free/busy API). */
  loadHostBusy?: (weekStart: Date, weekEnd: Date) => OsbBusy[] | OsbThenable
  /** Every string in the UI. */
  labels?: { [K in keyof OsbLabels]?: OsbLabels[K] }
  /** The visitor's own calendar for the overlay, if you already have it: weekly rules in their zone, or dated spans. */
  visitorEvents?: OsbBusy[]
  /**
   * Called the first time the visitor turns the overlay on, when `visitorEvents` is empty: connect their
   * calendar (OAuth, your API) and resolve to their busy time. Without this or `visitorEvents` the switch is hidden.
   */
  loadVisitorEvents?: () => OsbBusy[] | OsbThenable
  onOverlayChange?: (on: boolean) => void
  /** Start with the overlay on when `visitorEvents` is given. */
  defaultOverlay?: boolean
  /** "plain" is a header with the booking link; "browser" adds window dots. */
  chrome?: "plain" | "browser"
  onBook?: (booking: OsbBooking) => unknown
  /** Optional external confirmation link rendered on the booked ticket (e.g. pre-filled Cal.com URL). */
  getTicketHref?: (booking: OsbBooking) => string
  ticketCtaLabel?: string
  preset?: OsbPresetName
  colors?: { [K in keyof OsbColors]?: string }
  theme?: "auto" | "light" | "dark"
  /** Display face for the headline and numbers. */
  fontFamily?: string
  /** Minimum height of the section. */
  height?: string
  /** Maximum height of the scrolling slot grid. */
  gridHeight?: number
  className?: string
}

const DISPLAY_STACK =
  '"Inter Display", "Inter", -apple-system, "SF Pro Display", "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif'

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

function cityOf(tz: string): string {
  const last = tz.split("/").pop() || tz
  return last.replace(/_/g, " ")
}

function gmt(tz: string, at: number): string {
  const o = osbOffset(at, tz)
  const sign = o < 0 ? "-" : "+"
  const a = Math.abs(o)
  return "GMT" + sign + Math.floor(a / 60) + (a % 60 ? ":" + String(a % 60).padStart(2, "0") : "")
}

function localZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

function useReducedMotion(): boolean {
  const [r, setR] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const m = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => setR(m.matches)
    on()
    m.addEventListener?.("change", on)
    return () => m.removeEventListener?.("change", on)
  }, [])
  return r
}

const CSS = `
.osb{--osb-ground:transparent;--osb-ink:var(--ms-text,var(--color-foreground,#120E24));--osb-muted:var(--ms-muted,var(--color-muted-foreground,#5A5278));
  --osb-from:var(--osb-from-l);--osb-to:var(--osb-to-l);
  --osb-win-ink:#eef1f8;--osb-win-muted:rgba(238,241,248,.74);--osb-win-faint:rgba(238,241,248,.62);--osb-win-line:rgba(238,241,248,.09);
  --osb-paper:#ffffff;--osb-paper-ink:#10131c;--osb-paper-muted:#5a5f6e;--osb-paper-line:#e4e6ec;
  position:relative;display:flex;flex-direction:column;justify-content:center;width:100%;box-sizing:border-box;
  background:var(--osb-ground);color:var(--osb-ink);padding:clamp(28px,7vw,88px) clamp(16px,4vw,48px) clamp(56px,8vw,104px);overflow:hidden;
  -webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.osb *,.osb *::before,.osb *::after{box-sizing:border-box}
.dark .osb,[data-theme="dark"] .osb,.osb[data-theme=dark]{--osb-from:var(--osb-from-d);--osb-to:var(--osb-to-d)}
.osb[data-theme=light]{--osb-ground:#ffffff;--osb-ink:#0d1020;--osb-muted:#5b6070;--osb-from:var(--osb-from-l);--osb-to:var(--osb-to-l)}
.osb[data-theme=dark]{--osb-ground:#0a0c14;--osb-ink:#f1f3f9;--osb-muted:#9aa0b2}
.osb img{max-width:none}
.osb :where(button,input,textarea,select){font:inherit;color:inherit}
.osb :where(button){cursor:pointer;-webkit-tap-highlight-color:transparent}
.osb :focus-visible{outline:2px solid var(--osb-action);outline-offset:2px}

.osb-head{max-width:980px;margin:0 auto;text-align:center}
.osb-h{font-family:var(--osb-display);font-weight:800;font-size:clamp(2.4rem,1.05rem + 4.3vw,5rem);line-height:1.02;letter-spacing:-.04em;margin:0;text-wrap:balance}
.osb-h span{display:block}
.osb-h .osb-accent{background:linear-gradient(92deg,var(--osb-from),var(--osb-to));-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.06em}
.osb-sub{margin:clamp(14px,2vw,20px) auto 0;max-width:34rem;font-size:clamp(1rem,.95rem + .25vw,1.15rem);line-height:1.55;color:var(--osb-muted);text-wrap:pretty}
.osb-alt{display:inline-block;margin-top:14px;font-size:.92rem;color:var(--osb-ink);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px;text-decoration-color:color-mix(in srgb,var(--osb-ink) 35%,transparent);transition:text-decoration-color .2s ease}
.osb-alt:hover{text-decoration-color:var(--osb-ink)}

.osb-stage{position:relative;width:100%;max-width:1120px;margin:clamp(26px,5vw,60px) auto 0}
.osb-stage:first-of-type{margin-top:12px}
.osb-slab{position:absolute;inset:-20px -24px -28px -16px;border-radius:26px;background:var(--osb-slab);transform:rotate(-2deg);transform-origin:50% 60%}
.osb-win{position:relative;border-radius:18px;background:var(--osb-window);color:var(--osb-win-ink);overflow:hidden;
  box-shadow:0 1px 0 rgba(255,255,255,.06) inset,0 40px 70px -40px rgba(8,10,24,.55),0 10px 24px -14px rgba(8,10,24,.35)}
.osb-bar{display:flex;align-items:center;gap:14px;height:46px;padding:0 14px 0 18px;border-bottom:1px solid var(--osb-win-line)}
.osb-dots{display:flex;gap:7px}
.osb-dots i{width:11px;height:11px;border-radius:50%;background:rgba(238,241,248,.16)}
.osb-url{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:8px;height:28px;margin:0 auto;max-width:460px;border-radius:999px;background:rgba(238,241,248,.06);font-size:12.5px;color:var(--osb-win-muted)}
.osb-url b{font-weight:600;color:var(--osb-win-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.osb-copy{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border:0;border-radius:999px;background:transparent;color:var(--osb-win-muted);font-size:12.5px;transition:background-color .2s ease,color .2s ease,transform .16s ease}
.osb-copy:hover{background:rgba(238,241,248,.08);color:var(--osb-win-ink)}
.osb-copy:active{transform:scale(.97)}

.osb-body{display:grid;grid-template-columns:300px minmax(0,1fr)}
.osb-host{padding:28px 26px 30px;border-right:1px solid var(--osb-win-line);display:flex;flex-direction:column;gap:22px}
.osb-who{display:flex;align-items:center;gap:14px}
.osb-stamp{position:relative;flex:none;width:76px;height:76px}
.osb-stamp svg{display:block;width:100%;height:100%}
.osb-stamp img{position:absolute;left:14%;top:14%;width:72%;height:72%;border-radius:50%;object-fit:cover}
.osb-stamp .osb-ring{transform-origin:60px 60px;animation:osb-spin 40s linear infinite}
.osb-name{font-weight:700;font-size:15.5px;line-height:1.25}
.osb-role{font-size:13px;color:var(--osb-win-muted);margin-top:2px;line-height:1.35}
.osb-live{display:flex;align-items:center;gap:7px;margin-top:6px;font-size:12px;color:var(--osb-win-muted)}
.osb-live i{position:relative;width:7px;height:7px;border-radius:50%;background:#3ddc84;flex:none}
.osb-live i::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:1.5px solid #3ddc84;opacity:0;animation:osb-ping 2.4s ease-out infinite}
.osb-meet{font-family:var(--osb-display);font-weight:800;font-size:25px;letter-spacing:-.025em;line-height:1.1;margin:0}
.osb-agenda{margin:8px 0 0;font-size:14px;line-height:1.55;color:var(--osb-win-muted)}
.osb-label{display:block;font-size:12px;color:var(--osb-win-faint);margin-bottom:8px}
.osb-seg{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:3px;border-radius:12px;background:rgba(238,241,248,.06)}
.osb-seg-pill{position:absolute;top:3px;bottom:3px;left:3px;border-radius:9px;background:var(--osb-win-ink);transition:transform .28s cubic-bezier(.22,1,.36,1)}
.osb-seg button{position:relative;z-index:1;height:34px;border:0;background:transparent;border-radius:9px;font-size:13.5px;font-weight:600;color:var(--osb-win-muted);transition:color .2s ease}
.osb-seg button[aria-pressed=true]{color:var(--osb-window)}
.osb-seg button:disabled{cursor:default}
.osb-opts{display:flex;flex-direction:column;gap:22px}
.osb-meta{order:1;display:flex;flex-direction:column;gap:10px;font-size:13.5px;color:var(--osb-win-muted)}
.osb-meta div{display:flex;align-items:center;gap:10px}
.osb-meta svg{flex:none;opacity:.8}
.osb-tz{position:relative;display:flex;align-items:center;gap:10px}
.osb-tz select{appearance:none !important;-webkit-appearance:none !important;-moz-appearance:none !important;background-image:none !important;width:100%;height:36px;padding:0 30px 0 34px;border-radius:10px;border:1px solid var(--osb-win-line);background-color:rgba(238,241,248,.04);font-size:13px;line-height:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--osb-win-ink);cursor:pointer;transition:border-color .2s ease}
.osb-tz select::picker-icon{display:none}
.osb-tz select:hover{border-color:rgba(238,241,248,.24)}
.osb-tz select option{color:#10131c;background:#fff}
.osb-tz .osb-globe{position:absolute;left:11px;pointer-events:none;opacity:.7}
.osb-tz .osb-chev{position:absolute;right:11px;pointer-events:none;opacity:.6}

.osb-cal{position:relative;padding:22px 24px 24px;min-width:0}
.osb-calhead{display:flex;align-items:center;flex-wrap:wrap;gap:12px 16px;margin-bottom:16px}
.osb-pick{display:flex;align-items:center;gap:10px;font-weight:650;font-size:15px;margin-right:auto}
.osb-pick-ico{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--osb-slab);color:var(--osb-slab-ink)}
.osb-switch > svg{display:none;flex:none}
.osb-switch{display:inline-flex;align-items:center;gap:10px;border:0;background:transparent;padding:4px 2px;font-size:13.5px;color:var(--osb-win-muted);transition:color .2s ease}
.osb-switch:hover{color:var(--osb-win-ink)}
.osb-track{position:relative;width:38px;height:22px;border-radius:999px;background:rgba(238,241,248,.16);transition:background-color .25s ease}
.osb-track i{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .32s cubic-bezier(.34,1.36,.64,1)}
.osb-switch[aria-checked=true] .osb-track{background:var(--osb-action)}
.osb-switch[aria-checked=true] .osb-track i{transform:translateX(16px)}
.osb-switch[data-linking=loading]{cursor:progress}
.osb-switch[data-linking=loading] .osb-track i{animation:osb-breathe 1s ease-in-out infinite alternate}
.osb-switch[data-linking=error]{color:#ff8f7a}
.osb-weeknav{display:flex;align-items:center;gap:8px;width:100%}
.osb-month{font-family:var(--osb-display);font-weight:800;font-size:20px;letter-spacing:-.02em;margin-right:auto}
.osb-btn{display:inline-grid;place-items:center;height:32px;min-width:32px;padding:0 12px;border-radius:9px;border:1px solid var(--osb-win-line);background:rgba(238,241,248,.04);font-size:13px;font-weight:600;color:var(--osb-win-ink);transition:background-color .2s ease,border-color .2s ease,transform .16s ease,opacity .2s ease}
.osb-btn.osb-icon{padding:0}
.osb-btn:hover:not(:disabled){background:rgba(238,241,248,.1);border-color:rgba(238,241,248,.22)}
.osb-btn:active:not(:disabled){transform:scale(.96)}
.osb-btn:disabled{opacity:.35;cursor:default}

.osb-grid{position:relative;border:1px solid var(--osb-win-line);border-radius:14px;overflow:hidden}
.osb-grid[data-checking=true] .osb-col{animation:osb-check 1.1s ease-in-out infinite alternate;pointer-events:none}
.osb-days{display:grid;grid-template-columns:52px repeat(7,minmax(0,1fr));border-bottom:1px solid var(--osb-win-line);background:rgba(238,241,248,.025)}
.osb-day{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0 9px;font-size:12px;color:var(--osb-win-muted)}
.osb-day b{display:grid;place-items:center;min-width:30px;height:30px;padding:0 6px;border-radius:999px;font-family:var(--osb-display);font-size:16px;font-weight:800;color:var(--osb-win-ink)}
.osb-day[data-today=true] b{color:var(--osb-slab);border:1.5px dashed var(--osb-slab);box-shadow:0 0 0 3px var(--osb-window),0 0 0 4.5px color-mix(in srgb,var(--osb-slab) 55%,transparent)}
.osb-day[data-past=true]{opacity:.45}
.osb-scroll{position:relative;overflow-y:auto;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 9px,#000 calc(100% - 34px),transparent);mask-image:linear-gradient(to bottom,transparent 0,#000 9px,#000 calc(100% - 34px),transparent);overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(238,241,248,.2) transparent}
.osb-rows{position:relative;display:grid;grid-template-columns:52px repeat(7,minmax(0,1fr))}
.osb-gutter{position:relative}
.osb-hour{position:absolute;right:10px;transform:translateY(-50%);font-size:11px;color:var(--osb-win-faint);white-space:nowrap}
.osb-lines{position:absolute;inset:0 0 0 52px;pointer-events:none}
.osb-lines i{position:absolute;left:0;right:0;height:1px;background:var(--osb-win-line)}
.osb-col{position:relative;border-left:1px solid var(--osb-win-line);animation:osb-col-in .3s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--c) * 30ms)}
.osb-col[data-past=true]{background:repeating-linear-gradient(135deg,transparent 0 9px,rgba(238,241,248,.025) 9px 10px)}
.osb-slot{position:absolute;left:5px;right:5px;max-width:176px;margin:0 auto;z-index:2;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid rgba(238,241,248,.16);background:rgba(238,241,248,.06);font-size:12.5px;font-weight:600;color:var(--osb-win-ink);white-space:nowrap;overflow:visible;
  transition:background-color .18s ease,border-color .18s ease,color .18s ease,opacity .24s ease,transform .16s ease;transition-delay:0s,0s,0s,calc(var(--i,0) * 22ms),0s}
.osb-slot .osb-end{display:none}
.osb-slot[data-state=open],.osb-slot[data-state=picked],.osb-legend i.osb-lg-open{
  -webkit-mask:radial-gradient(circle 4px at 0 50%,transparent 94%,#000 100%) left/51% 100% no-repeat,radial-gradient(circle 4px at 100% 50%,transparent 94%,#000 100%) right/51% 100% no-repeat;
  mask:radial-gradient(circle 4px at 0 50%,transparent 94%,#000 100%) left/51% 100% no-repeat,radial-gradient(circle 4px at 100% 50%,transparent 94%,#000 100%) right/51% 100% no-repeat}
.osb-slot[data-state=open]::before,.osb-slot[data-state=picked]::before{content:"";position:absolute;left:13px;top:5px;bottom:5px;border-left:1px dashed currentColor;opacity:.3}
@media (hover:hover) and (pointer:fine){
  .osb-slot[data-state=open]:hover{z-index:3;background:var(--osb-action);border-color:var(--osb-action);color:var(--osb-action-ink);border-radius:8px 8px 0 0}
  .osb-slot[data-state=open]:hover .osb-end{display:inline}
  .osb-slot[data-state=open]:hover + .osb-tail{opacity:1;transform:none}
  .osb-slot[data-state=open][data-tail="0"]:hover{border-radius:8px}
}
.osb-slot[data-state=open]:focus-visible{z-index:3;outline:none;background:var(--osb-action);border-color:var(--osb-action);color:var(--osb-action-ink);box-shadow:inset 0 0 0 2px var(--osb-action-ink)}
.osb-slot[data-state=open]:focus-visible + .osb-tail{opacity:1;transform:none}
.osb-slot[data-state=open]:active{transform:scale(.97)}
.osb-slot[data-state=clash]{z-index:1;cursor:not-allowed;background:transparent;border-style:dashed;border-color:rgba(238,241,248,.2);color:var(--osb-win-faint);text-decoration:line-through;text-decoration-color:rgba(238,241,248,.45)}
.osb-slot[data-state=picked]{z-index:3;background:var(--osb-action);border-color:var(--osb-action);color:var(--osb-action-ink)}
.osb-busy,.osb-booked{position:absolute;left:5px;right:5px;max-width:176px;margin:0 auto;z-index:1;border-radius:8px;padding:5px 9px}
.osb-busy{background:rgba(238,241,248,.045)}
.osb-busy span,.osb-booked span{position:sticky;top:10px;display:block;font-size:10.5px;font-weight:650;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.osb-busy span{color:var(--osb-win-faint)}
.osb-booked{background:var(--osb-slab);color:var(--osb-slab-ink);z-index:2}
.osb-tail{position:absolute;left:5px;right:5px;max-width:176px;margin:0 auto;z-index:4;border-radius:0 0 8px 8px;background:color-mix(in srgb,var(--osb-action) 24%,var(--osb-window));border:1px dashed color-mix(in srgb,var(--osb-action) 60%,transparent);border-top:0;opacity:0;transform:scaleY(.6);transform-origin:top;transition:opacity .16s ease,transform .2s cubic-bezier(.22,1,.36,1);pointer-events:none}
.osb-block{position:absolute;left:3px;right:3px;max-width:190px;margin:0 auto;z-index:2;pointer-events:none;border-radius:9px;border:1px dashed rgba(238,241,248,.28);
  background:repeating-linear-gradient(135deg,rgba(238,241,248,.13) 0 1.5px,transparent 1.5px 7px),color-mix(in srgb,var(--osb-window) 70%,#ffffff 4%);
  padding:0 7px;animation:osb-wipe .3s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i,0) * 40ms)}
.osb-block span{position:sticky;top:10px;z-index:3;display:block;margin-top:-8px;font-size:10px;font-weight:700;line-height:14px;color:var(--osb-win-ink);background:var(--osb-window);border:1px dashed rgba(238,241,248,.34);border-radius:5px;padding:0 5px;width:max-content;max-width:calc(100% - 4px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.osb-now{position:absolute;left:-1px;right:0;height:2px;z-index:4;background:var(--osb-slab);pointer-events:none}
.osb-now::before{content:"";position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:var(--osb-slab)}
.osb-empty{padding:42px 20px;text-align:center;font-size:14px;color:var(--osb-win-muted)}
.osb-none{position:absolute;inset:0;z-index:5;display:grid;place-items:center;align-content:center;gap:12px;text-align:center;font-size:14px;color:var(--osb-win-muted);background:color-mix(in srgb,var(--osb-window) 60%,transparent)}
.osb-legend{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:12px;font-size:12px;color:var(--osb-win-faint)}
.osb-legend span{display:inline-flex;align-items:center;gap:7px}
.osb-legend i{width:16px;height:10px;border-radius:3px;border:1px solid rgba(238,241,248,.22);background:rgba(238,241,248,.06)}
.osb-legend i.osb-lg-open{width:20px}
.osb-legend i.osb-lg-taken{border:0;background:rgba(238,241,248,.12)}
.osb-legend i.osb-lg-busy{border-style:dashed;background:repeating-linear-gradient(135deg,rgba(238,241,248,.2) 0 1.5px,transparent 1.5px 5px)}

.osb-scrim{position:absolute;inset:0;z-index:20;background:color-mix(in srgb,var(--osb-window) 72%,transparent);animation:osb-fade .24s ease both}
.osb-card{position:absolute;z-index:21;left:50%;top:24px;width:min(400px,calc(100% - 32px));margin-left:calc(min(400px,calc(100% - 32px)) / -2);border-radius:18px;background:var(--osb-paper);color:var(--osb-paper-ink);
  box-shadow:0 30px 60px -24px rgba(0,0,0,.55),0 0 0 1px rgba(0,0,0,.04);transform-origin:50% 50%;will-change:transform}
.osb-form{padding:22px 22px 20px}
.osb-cardtop{display:flex;align-items:flex-start;gap:12px}
.osb-when{flex:1;min-width:0}
.osb-when small{display:block;font-size:12.5px;color:var(--osb-paper-muted)}
.osb-when strong{display:block;margin-top:4px;font-family:var(--osb-display);font-weight:800;font-size:23px;letter-spacing:-.025em;line-height:1.15}
.osb-when em{display:block;font-style:normal;margin-top:3px;font-size:14px;color:var(--osb-paper-muted)}
.osb-when i{display:flex;align-items:center;gap:7px;font-style:normal;margin-top:8px;font-size:13px;color:var(--osb-paper-muted)}
.osb-x{flex:none;display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:50%;background:#f1f2f6;color:var(--osb-paper-ink);transition:background-color .2s ease,transform .16s ease}
.osb-x:hover{background:#e5e7ee}
.osb-x:active{transform:scale(.94)}
.osb-fields{display:grid;gap:12px;margin-top:18px}
.osb-field label{display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;color:var(--osb-paper-ink)}
.osb-field label span{font-weight:400;color:var(--osb-paper-muted)}
.osb-field input,.osb-field textarea{display:block;width:100%;border:1px solid var(--osb-paper-line);border-radius:10px;background:#fbfbfd;padding:10px 12px;font-size:14.5px;color:var(--osb-paper-ink);outline:none;resize:none;transition:border-color .2s ease,box-shadow .2s ease}
.osb-field input::placeholder,.osb-field textarea::placeholder{color:#7d8291}
.osb-field input:focus,.osb-field textarea:focus{border-color:var(--osb-action);box-shadow:0 0 0 3px color-mix(in srgb,var(--osb-action) 22%,transparent)}
.osb-field[data-error=true] input,.osb-field[data-error=true] input:focus{border-color:#d93a3a}
.osb-field[data-error=true] input:focus{box-shadow:0 0 0 3px rgba(217,58,58,.2)}
.osb-err{margin-top:6px;font-size:12.5px;color:#c62f2f}
.osb-actions{display:flex;gap:10px;margin-top:18px}
.osb-primary{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border:0;border-radius:999px;background:var(--osb-action);color:var(--osb-action-ink);font-weight:700;font-size:14.5px;transition:transform .16s ease,filter .2s ease}
.osb-primary:hover{filter:brightness(1.06)}
.osb-primary:active{transform:scale(.97)}
.osb-primary:disabled{cursor:progress;filter:saturate(.7)}
.osb-primary svg{transition:transform .24s cubic-bezier(.22,1,.36,1)}
.osb-primary:hover svg{transform:translateX(3px)}
.osb-ghost{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 18px;border-radius:999px;border:1px solid var(--osb-paper-line);background:transparent;color:var(--osb-paper-ink);font-weight:600;font-size:14.5px;transition:background-color .2s ease,transform .16s ease}
.osb-ghost:hover{background:#f3f4f7}
.osb-ghost:active{transform:scale(.97)}
.osb-shake{animation:osb-shake .32s cubic-bezier(.36,.07,.19,.97)}

.osb-ticket{position:relative;display:grid;grid-template-columns:104px minmax(0,1fr);border-radius:18px;
  -webkit-mask:radial-gradient(circle 10px at 104px 0,transparent 97%,#000 100%) top/100% 51% no-repeat,radial-gradient(circle 10px at 104px 100%,transparent 97%,#000 100%) bottom/100% 51% no-repeat;
  mask:radial-gradient(circle 10px at 104px 0,transparent 97%,#000 100%) top/100% 51% no-repeat,radial-gradient(circle 10px at 104px 100%,transparent 97%,#000 100%) bottom/100% 51% no-repeat}
.osb-stub{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:22px 8px;background:var(--osb-slab);color:var(--osb-slab-ink);border-radius:18px 0 0 18px;border-right:2px dashed color-mix(in srgb,var(--osb-slab-ink) 30%,transparent)}
.osb-stub small{font-size:12px;font-weight:700;letter-spacing:.12em}
.osb-stub strong{font-family:var(--osb-display);font-weight:800;font-size:52px;line-height:1;letter-spacing:-.04em}
.osb-tbody{position:relative;padding:22px 20px 20px}
.osb-tbody > p:first-of-type{padding-right:64px}
.osb-press{position:absolute;right:8px;top:6px;width:92px;height:92px;color:var(--osb-action);opacity:.92;transform:rotate(-12deg);mix-blend-mode:multiply;pointer-events:none}
.osb-tbody h3{margin:0;font-family:var(--osb-display);font-weight:800;font-size:24px;letter-spacing:-.025em}
.osb-tbody p{margin:6px 0 0;font-size:14px;line-height:1.5;color:var(--osb-paper-muted)}
.osb-tbody p b{color:var(--osb-paper-ink);font-weight:650}
.osb-tbody .osb-actions{margin-top:16px;flex-wrap:wrap}
.osb-tbody .osb-primary,.osb-tbody .osb-ghost{flex:none;height:40px;font-size:13.5px;padding:0 15px;white-space:nowrap}
.osb-card[data-phase=done]{width:min(470px,calc(100% - 24px));margin-left:calc(min(470px,calc(100% - 24px)) / -2)}
.osb-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}

.osb[data-compact=true] .osb-body{grid-template-columns:1fr}
.osb[data-compact=true] .osb-host{border-right:0;border-bottom:1px solid var(--osb-win-line);padding:20px 18px;gap:16px}
.osb[data-compact=true] .osb-stamp{width:60px;height:60px}
.osb[data-compact=true] .osb-meet{font-size:21px}
.osb[data-compact=true] .osb-agenda{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.osb[data-compact=true] .osb-meta{font-size:13px}
.osb[data-compact=true] .osb-meta div + div{display:none}
.osb[data-compact=true] .osb-calhead{flex-wrap:nowrap}
.osb[data-compact=true] .osb-weeknav{order:1;width:auto;flex:1;min-width:0}
.osb[data-compact=true] .osb-calhead .osb-switch{order:2;gap:6px;padding:4px 0}
.osb[data-compact=true] .osb-switch > svg{display:block;color:var(--osb-win-muted)}
.osb[data-compact=true] .osb-switch-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.osb[data-compact=true] .osb-tz select{text-overflow:ellipsis}
.osb[data-compact=true] .osb-opts{display:grid;grid-template-columns:1fr;gap:10px;align-items:stretch}
.osb[data-compact=true] .osb-strip{justify-content:center;gap:10px}
.osb[data-compact=true] .osb-seg button{height:36px;font-size:13px}
.osb[data-compact=true] .osb-tz select{height:42px;padding-right:24px;padding-left:30px;font-size:12.5px}
.osb[data-compact=true] .osb-tz .osb-globe{left:9px}
.osb[data-compact=true] .osb-tz .osb-chev{right:8px}
.osb[data-compact=true] .osb-who{gap:12px}
.osb[data-compact=true] .osb-pick{display:none}
.osb[data-compact=true] .osb-opts .osb-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.osb[data-compact=true] .osb-bar{height:42px}
.osb[data-compact=true] .osb-who + div{margin-top:-2px}
.osb[data-compact=true] .osb-calhead{gap:10px 12px;margin-bottom:12px}
.osb[data-compact=true] .osb-host{gap:12px;padding:16px 16px 18px}
.osb[data-compact=true] .osb-chip{padding:6px 0 5px}
.osb[data-compact=true] .osb-month{font-size:18px}
.osb[data-compact=true] .osb-list{margin-top:8px}
.osb[data-compact=true] .osb-mine{margin-bottom:8px}
.osb[data-compact=true] .osb-cal{padding:18px 14px 18px}
.osb[data-compact=true] .osb-url{justify-content:flex-start;padding:0 12px}
.osb[data-compact=true] .osb-dots{display:none}
.osb-strip{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;justify-content:space-between}
.osb-chip{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0 7px;border-radius:12px;border:1px solid transparent;background:transparent;color:var(--osb-win-muted);font-size:11.5px;transition:background-color .2s ease,color .2s ease,border-color .2s ease,transform .16s ease}
.osb-chip b{font-family:var(--osb-display);font-weight:800;font-size:17px;color:var(--osb-win-ink)}
.osb-chip i{width:5px;height:5px;border-radius:50%;background:var(--osb-slab);opacity:var(--o,1)}
.osb-chip:disabled{opacity:.35;cursor:default}
.osb-chip[aria-pressed=true]{background:var(--osb-action);color:var(--osb-action-ink);border-color:var(--osb-action)}
.osb-chip[aria-pressed=true] b{color:var(--osb-action-ink)}
.osb-chip[aria-pressed=true] i{background:var(--osb-action-ink)}
.osb-chip:active:not(:disabled){transform:scale(.96)}
.osb-list{margin-top:14px;min-height:180px;touch-action:pan-y;animation:osb-list-in .25s cubic-bezier(.22,1,.36,1) both}
.osb-list-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}
.osb-list .osb-slot{position:relative;left:auto;right:auto;height:44px;font-size:14px}
.osb-list .osb-slot .osb-end{display:none}
.osb-list .osb-slot{max-width:none;margin:0;width:100%;-webkit-mask:none;mask:none}
.osb-mine{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-bottom:12px}
.osb-mine .osb-switch{font-size:13px;gap:8px;padding:2px 0;margin-right:2px}
.osb-mine span{font-size:12px;padding:5px 9px;border-radius:8px;border:1px dashed rgba(238,241,248,.28);color:var(--osb-win-muted);background:repeating-linear-gradient(135deg,rgba(238,241,248,.12) 0 1.5px,transparent 1.5px 6px)}
.osb[data-compact=true] .osb-card{top:12px}
.osb[data-compact=true] .osb-ticket{grid-template-columns:84px minmax(0,1fr);-webkit-mask:radial-gradient(circle 9px at 84px 0,transparent 97%,#000 100%) top/100% 51% no-repeat,radial-gradient(circle 9px at 84px 100%,transparent 97%,#000 100%) bottom/100% 51% no-repeat;mask:radial-gradient(circle 9px at 84px 0,transparent 97%,#000 100%) top/100% 51% no-repeat,radial-gradient(circle 9px at 84px 100%,transparent 97%,#000 100%) bottom/100% 51% no-repeat}
.osb[data-compact=true] .osb-stub strong{font-size:42px}

.osb[data-in="0"] .osb-rise{opacity:0}
.osb[data-in="1"] .osb-rise{animation:osb-rise .7s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--r,0) * 90ms)}
.osb[data-in="1"] .osb-slab{animation:osb-settle .9s cubic-bezier(.22,1,.36,1) both .15s}

@keyframes osb-rise{from{opacity:0;transform:translateY(14px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
@keyframes osb-settle{from{transform:rotate(0deg) translateY(10px)}to{transform:rotate(-2deg)}}
@keyframes osb-col-in{from{opacity:0;transform:translateX(calc(var(--dir,1) * 8px));filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
@keyframes osb-list-in{from{opacity:0;transform:translateX(calc(var(--dir,1) * 8px));filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
@keyframes osb-wipe{from{clip-path:inset(-12px -6px 100% -6px)}to{clip-path:inset(-12px -6px 0 -6px)}}
@keyframes osb-check{from{opacity:.35}to{opacity:.6}}
@keyframes osb-breathe{from{transform:translateX(0)}to{transform:translateX(8px)}}
@keyframes osb-fade{from{opacity:0}to{opacity:1}}
@keyframes osb-spin{to{transform:rotate(360deg)}}
@keyframes osb-ping{0%{opacity:.7;transform:scale(.6)}80%,100%{opacity:0;transform:scale(1.6)}}
@keyframes osb-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}


.osb[data-compact=true]{padding:clamp(12px,3vw,24px) 0 clamp(24px,4vw,36px)}
.osb[data-compact=true] .osb-slab{inset:-10px -6px -14px -6px;border-radius:20px;transform:rotate(-1.2deg)}
.osb[data-compact=true] .osb-chip{min-height:54px;padding:7px 2px 6px}
.osb[data-compact=true] .osb-seg button{min-height:40px}
.osb[data-compact=true] .osb-tz select{min-height:44px}
.osb[data-compact=true] .osb-btn{min-height:40px;min-width:40px}
.osb[data-compact=true] .osb-copy{min-height:36px}
.osb[data-compact=true] .osb-list-grid{grid-template-columns:repeat(auto-fill,minmax(102px,1fr));gap:10px}
.osb-ticket .osb-primary{text-decoration:none}
@media (max-width: 680px){
  .osb{padding:12px 0 28px}
  .osb-stage,.osb-win{max-width:100%}
  .osb-body{grid-template-columns:minmax(0,1fr)}
  .osb-host{border-right:0;border-bottom:1px solid var(--osb-win-line)}
  .osb-slab{inset:-10px -4px -14px -4px;transform:rotate(-1deg)}
}

@media (prefers-reduced-motion: reduce){
  .osb *,.osb *::before,.osb *::after{animation:none !important;transition-duration:.01ms !important;transition-delay:0s !important}
  .osb .osb-slab{transform:rotate(-2deg)}
}
`

const Icon = {
  pointer: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
    </svg>
  ),
  left: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  right: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  close: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="M15.5 10.5l6-3.5v10l-6-3.5" />
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  globe: (
    <svg className="osb-globe" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
    </svg>
  ),
  chev: (
    <svg className="osb-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  cal: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  ),
  link: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M10 14a5 5 0 007.07 0l3-3a5 5 0 00-7.07-7.07l-1.5 1.5M14 10a5 5 0 00-7.07 0l-3 3a5 5 0 007.07 7.07l1.5-1.5" />
    </svg>
  ),
}

function Stamp({ host, uid }: { host: OsbHost; uid: string }) {
  const initials =
    host.initials ||
    host.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("")
  const words = (host.stamp || "Open slots · book a call · ").toUpperCase()
  const ring = words.repeat(Math.max(1, Math.ceil(46 / words.length)))
  return (
    <div className="osb-stamp" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <path id={uid + "-ring"} d="M60,60 m-49,0 a49,49 0 1,1 98,0 a49,49 0 1,1 -98,0" />
        </defs>
        <circle cx="60" cy="60" r="59" fill="var(--osb-slab)" />
        <g className="osb-ring">
          <text fontSize="9.6" fontWeight="800" letterSpacing="1.6" fill="var(--osb-slab-ink)" style={{ fontFamily: "var(--osb-display)" }}>
            <textPath href={"#" + uid + "-ring"} textLength="300" lengthAdjust="spacing">
              {ring.slice(0, 46)}
            </textPath>
          </text>
        </g>
        <circle cx="60" cy="60" r="41" fill="var(--osb-window)" />
        <circle cx="60" cy="60" r="36.5" fill="none" stroke="var(--osb-slab)" strokeWidth="1.2" strokeDasharray="2 3" opacity=".7" />
        {!host.avatar && (
          <text
            x="60"
            y="61"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={initials.length > 1 ? 30 : 36}
            fontWeight="800"
            letterSpacing="-1"
            fill="var(--osb-slab)"
            style={{ fontFamily: "var(--osb-display)" }}
          >
            {initials}
          </text>
        )}
      </svg>
      {host.avatar && <img src={host.avatar} alt="" width={55} height={55} />}
    </div>
  )
}

/** The ink impression the host's stamp leaves on the ticket. */
function Impression({ words, uid }: { words: string; uid: string }) {
  const ring = words.toUpperCase().repeat(3).slice(0, 40)
  return (
    <svg className="osb-press" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <path id={uid + "-press"} d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        <filter id={uid + "-ink"} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.25 1.45" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </defs>
      <g filter={"url(#" + uid + "-ink)"} fill="none" stroke="currentColor">
        <circle cx="60" cy="60" r="56" strokeWidth="4" />
        <circle cx="60" cy="60" r="34" strokeWidth="2.6" />
        <text fontSize="12" fontWeight="900" letterSpacing="1.2" fill="currentColor" stroke="none" style={{ fontFamily: "var(--osb-display)" }}>
          <textPath href={"#" + uid + "-press"} textLength="276" lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
        <path d="M44 61l11 11 22-24" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

type Picked = { slot: OsbSlot; key: string }

export default function OpenSlotBooking({
  headline = "Skip the pitch deck.",
  headlineAccent = "Talk to a person.",
  description = "Pick an open slot and bring one real workflow. You leave with a plan, even if you never buy.",
  altContact = { label: "Rather write? maya@tallyho.app", href: "mailto:maya@tallyho.app" },
  host = { name: "Maya Lindqvist", role: "Head of Solutions, Tallyho", stamp: "Open slots · intro call · " },
  meetingTitle = "Intro call",
  agenda = "I'll walk through your current setup with you and sketch what we would change first. Bring the messy version.",
  location = "Video call, link sent after booking",
  responseNote = "Usually replies within 2 hours",
  bookingUrl = "tallyho.app/maya/partnership",
  bookingHref,
  durations = [15, 30, 45],
  defaultDuration = 30,
  step = 30,
  hostTimeZone = "Europe/Lisbon",
  timeZones = ["Europe/Lisbon", "Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles", "Asia/Kolkata", "Asia/Singapore"],
  hours = { days: [1, 2, 3, 4, 5], from: "09:00", to: "17:00" },
  noticeHours = 4,
  weeksAhead = 6,
  weekStartsOn = 1,
  clock = "24h",
  hostBusy = [],
  loadHostBusy,
  labels,
  visitorEvents = [],
  loadVisitorEvents,
  onOverlayChange,
  defaultOverlay = true,
  chrome = "plain",
  onBook,
  getTicketHref,
  ticketCtaLabel,
  preset = "postmark",
  colors,
  theme = "auto",
  fontFamily,
  height = "100svh",
  gridHeight = 444,
  className,
}: OpenSlotBookingProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const reduced = useReducedMotion()
  const L: OsbLabels = { ...OSB_LABELS }
  if (labels) for (const k of Object.keys(labels) as (keyof OsbLabels)[]) if (labels[k] !== undefined) (L as { [k: string]: unknown })[k] = labels[k]
  const c: OsbColors = { ...(OSB_PRESETS[preset] || OSB_PRESETS.postmark) }
  if (colors) for (const k of Object.keys(colors) as (keyof OsbColors)[]) if (colors[k]) c[k] = colors[k] as string

  const rootRef = useRef(null as HTMLElement | null)
  const winRef = useRef(null as HTMLDivElement | null)
  const calRef = useRef(null as HTMLDivElement | null)
  const scrollRef = useRef(null as HTMLDivElement | null)
  const cardRef = useRef(null as HTMLDivElement | null)
  const originRef = useRef(null as HTMLElement | null)
  const slabRef = useRef(null as HTMLDivElement | null)
  const swipeRef = useRef(null as null | { x: number; y: number; id: number })

  const [now, setNow] = useState(() => Date.now())
  const [tz, setTz] = useState(hostTimeZone)
  const [duration, setDuration] = useState(durations.indexOf(defaultDuration) >= 0 ? defaultDuration : durations[0] || 30)
  const [overlay, setOverlay] = useState(defaultOverlay && visitorEvents.length > 0)
  const [loadedEvents, setLoadedEvents] = useState(null as OsbBusy[] | null)
  const [linking, setLinking] = useState("idle" as "idle" | "loading" | "error")
  const [visitorTz, setVisitorTz] = useState(hostTimeZone)
  const [dir, setDir] = useState(1)
  const [compact, setCompact] = useState(false)
  const [inView, setInView] = useState(false)
  const [booked, setBooked] = useState([] as OsbSpan[])
  const [picked, setPicked] = useState(null as Picked | null)
  const [lastBooking, setLastBooking] = useState(null as OsbBooking | null)
  const [phase, setPhase] = useState("form" as "form" | "sending" | "done")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")
  const [errors, setErrors] = useState({} as { name?: string; email?: string; form?: string })
  const [copied, setCopied] = useState(false)
  const [live, setLive] = useState("")
  const [rove, setRove] = useState(0)

  // the visitor's own zone, after mount so the server and first client render agree
  useEffect(() => {
    const z = localZone()
    try {
      osbOffset(Date.now(), z)
      setTz(z)
      setVisitorTz(z)
    } catch {
      /* unknown zone: stay on the host's */
    }
  }, [])

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const el = winRef.current
    const checkCompact = (w?: number) => {
      const vw = typeof window !== "undefined" ? window.innerWidth : 1024
      const measured = w ?? el?.getBoundingClientRect().width ?? vw
      setCompact(Math.min(measured, vw) < 640)
    }
    checkCompact()
    if (!el || typeof ResizeObserver === "undefined") {
      const onResize = () => checkCompact()
      window.addEventListener("resize", onResize)
      return () => window.removeEventListener("resize", onResize)
    }
    const ro = new ResizeObserver((e) => checkCompact(e[0].contentRect.width))
    ro.observe(el)
    const onResize = () => checkCompact()
    window.addEventListener("resize", onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", onResize)
    }
  }, [])

  useLayoutEffect(() => {
    const el = rootRef.current
    const r = el?.getBoundingClientRect()
    if (!el || typeof IntersectionObserver === "undefined" || (r && r.top < window.innerHeight * 0.85 && r.bottom > 0)) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const zones = useMemo(() => {
    const list = timeZones.slice()
    if (list.indexOf(tz) < 0) list.unshift(tz)
    if (list.indexOf(hostTimeZone) < 0) list.unshift(hostTimeZone)
    return list
  }, [timeZones, tz, hostTimeZone])

  const myEvents = visitorEvents.length ? visitorEvents : loadedEvents || []
  const canOverlay = visitorEvents.length > 0 || !!loadVisitorEvents
  const toggleOverlay = () => {
    if (linking === "loading") return
    if (overlay) {
      setOverlay(false)
      onOverlayChange?.(false)
      return
    }
    if (myEvents.length || !loadVisitorEvents) {
      setOverlay(true)
      onOverlayChange?.(true)
      return
    }
    setLinking("loading")
    let r: OsbBusy[] | OsbThenable
    try {
      r = loadVisitorEvents()
    } catch {
      setLinking("error")
      return
    }
    Promise.resolve(r as OsbBusy[]).then(
      (list) => {
        setLoadedEvents(Array.isArray(list) ? list : [])
        setLinking("idle")
        setOverlay(true)
        onOverlayChange?.(true)
        setLive("Your calendar is overlaid on the open slots")
      },
      () => setLinking("error"),
    )
  }

  // the host's free/busy, fetched per shown week when loadHostBusy is given
  const [remote, setRemote] = useState({} as { [week: string]: OsbBusy[] })
  const loadRef = useRef(loadHostBusy)
  loadRef.current = loadHostBusy
  const remoteAll = useMemo(() => Object.keys(remote).reduce((acc, k) => acc.concat(remote[k]), [] as OsbBusy[]), [remote])

  const busyAll = useMemo(
    () => hostBusy.concat(remoteAll, booked.map((b) => ({ start: b.start, end: b.end, title: b.title }))),
    [hostBusy, remoteAll, booked],
  )

  const basePlan: OsbPlan = {
    weekKey: osbWeekKey(now, tz, weekStartsOn),
    displayTz: tz,
    hostTz: hostTimeZone,
    hours,
    duration,
    step,
    now,
    noticeMin: noticeHours * 60,
    hostBusy: busyAll,
    visitor: myEvents,
    visitorTz,
    overlay,
  }
  const thisWeek = basePlan.weekKey
  const firstWeek = useMemo(
    () => osbFirstWeek(basePlan, weeksAhead, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thisWeek, tz, hostTimeZone, duration, step, noticeHours, weeksAhead, hostBusy, hours],
  )
  const [weekKey, setWeekKey] = useState(firstWeek)
  const touched = useRef(false)
  useEffect(() => {
    if (!touched.current) setWeekKey(firstWeek)
  }, [firstWeek])
  const lastWeek = thisWeek + weeksAhead * 7
  const checking = !!loadHostBusy && !remote[weekKey]
  useEffect(() => {
    const load = loadRef.current
    if (!load || remote[weekKey]) return
    let alive = true
    const done = (list: OsbBusy[]) => {
      if (alive) setRemote((m) => ({ ...m, [weekKey]: Array.isArray(list) ? list : [] }))
    }
    let r: OsbBusy[] | OsbThenable
    try {
      r = load(new Date(osbAt(weekKey, 0, tz)), new Date(osbAt(weekKey + 7, 0, tz)))
    } catch {
      done([])
      return
    }
    Promise.resolve(r as OsbBusy[]).then(done, () => done([]))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey, !!loadHostBusy])

  const slots = useMemo(
    () => osbSlots({ ...basePlan, weekKey }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekKey, tz, hostTimeZone, hours, duration, step, now, noticeHours, busyAll, myEvents, visitorTz, overlay],
  )
  const rangeSlots = useMemo(
    () => osbSlots({ ...basePlan, weekKey, overlay: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekKey, tz, hostTimeZone, hours, duration, step],
  )
  const blocks = useMemo(() => (overlay ? osbBlocks(myEvents, weekKey, tz, visitorTz) : []), [overlay, myEvents, weekKey, tz, visitorTz])
  const [lo, hi] = osbRange(rangeSlots, duration)
  const stepPx = 36
  const ppm = stepPx / Math.max(5, step)
  const bodyPx = Math.max(60, (hi - lo) * ppm)

  const todayKey = osbWall(now, tz).key
  const nowMin = osbWall(now, tz).min

  // compact: one day at a time
  const openByCol = useMemo(() => {
    const n = [0, 0, 0, 0, 0, 0, 0]
    for (const s of slots) if (s.state === "open") n[s.col]++
    return n
  }, [slots])
  const [day, setDay] = useState(0)
  useEffect(() => {
    const first = openByCol.findIndex((n) => n > 0)
    setDay(first < 0 ? 0 : first)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey, tz])

  const hour12 = clock === "12h"
  const fmt = useCallback(
    (ms: number, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, ...opts }).format(new Date(ms)),
    [tz],
  )
  // one clock style everywhere: "09:30" or "9:30am", "9am" on the hour
  const timeLabel = useCallback(
    (ms: number, zone?: string) => {
      const s = new Intl.DateTimeFormat(hour12 ? "en-US" : "en-GB", { timeZone: zone || tz, hour: hour12 ? "numeric" : "2-digit", minute: "2-digit", hour12 }).format(new Date(ms))
      return hour12 ? s.replace(/\s?([AP])M/, (_, x: string) => x.toLowerCase() + "m").replace(":00", "") : s
    },
    [tz, hour12],
  )
  const hourLabel = (min: number) => {
    const h = Math.floor(min / 60) % 24
    if (!hour12) return String(h).padStart(2, "0") + ":00"
    return (h % 12 || 12) + (h < 12 ? "am" : "pm")
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const key = weekKey + i
    const ms = osbAt(key, 720, tz)
    return { key, i, wd: fmt(ms, { weekday: "short" }), wdLong: fmt(ms, { weekday: "long" }), d: fmt(ms, { day: "numeric" }), long: fmt(ms, { weekday: "long", day: "numeric", month: "long" }) }
  })
  const monthLabel = (() => {
    const a = osbAt(weekKey, 720, tz)
    const b = osbAt(weekKey + 6, 720, tz)
    const ma = fmt(a, { month: "long" })
    const mb = fmt(b, { month: "long" })
    const y = fmt(b, { year: "numeric" })
    return ma === mb ? ma + " " + y : fmt(a, { month: "short" }) + " – " + fmt(b, { month: "short" }) + " " + y
  })()

  const goWeek = (to: number) => {
    const next = Math.max(thisWeek, Math.min(lastWeek, to))
    if (next === weekKey) return
    touched.current = true
    setDir(next > weekKey ? 1 : -1)
    setWeekKey(next)
    setLive("Week of " + fmt(osbAt(next, 720, tz), { day: "numeric", month: "long" }))
  }

  // scroll the grid to the first open slot whenever the week or duration changes
  useLayoutEffect(() => {
    const sc = scrollRef.current
    if (!sc) return
    const first = slots.find((s) => s.state === "open")
    const target = first ? Math.max(0, Math.floor((first.min - lo) / 60) * 60 * ppm) : 0
    sc.scrollTo({ top: target, behavior: "auto" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey, duration, tz, compact])

  // ---------- the pick → confirm → ticket sequence ----------
  const zoneName = (z: string) => (z === hostTimeZone && host.city ? host.city : cityOf(z))
  const slotWords = (s: OsbSlot) => fmt(s.start, { weekday: "long", day: "numeric", month: "long" }) + ", " + timeLabel(s.start) + " to " + timeLabel(s.end)

  const pick = (s: OsbSlot, el: HTMLElement) => {
    if (s.state !== "open" || picked) return
    originRef.current = el
    setErrors({})
    setPhase("form")
    setPicked({ slot: s, key: String(s.start) })
  }

  useLayoutEffect(() => {
    const card = cardRef.current
    const cal = calRef.current
    if (!picked || !card || !cal) return
    rootRef.current?.querySelectorAll("[data-under]").forEach((n) => n.setAttribute("inert", ""))
    const from = originRef.current?.getBoundingClientRect()
    const to = card.getBoundingClientRect()
    if (!reduced && from && from.width > 0 && to.width > 0) {
      const dx = from.left + from.width / 2 - (to.left + to.width / 2)
      const dy = from.top + from.height / 2 - (to.top + to.height / 2)
      card.animate(
        [
          { transform: "translate(" + dx + "px," + dy + "px) scale(" + from.width / to.width + "," + from.height / to.height + ")", opacity: 0.6 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 280, easing: EASE },
      )
      const inner = card.firstElementChild as HTMLElement | null
      inner?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }], { duration: 280, easing: "ease-out" })
    }
    card.querySelector("input")?.focus({ preventScroll: true })
    const r = card.getBoundingClientRect()
    if (r.bottom > window.innerHeight || r.top < 0) window.scrollBy({ top: r.top < 0 ? r.top - 16 : Math.min(r.top - 16, r.bottom - window.innerHeight + 24), behavior: reduced ? "auto" : "smooth" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked?.key])

  const finish = () => {
    rootRef.current?.querySelectorAll("[data-under]").forEach((n) => n.removeAttribute("inert"))
    setPicked(null)
    setPhase("form")
    const o = originRef.current
    requestAnimationFrame(() => {
      if (o && o.isConnected && !o.hasAttribute("disabled")) o.focus({ preventScroll: true })
      else (calRef.current?.querySelector("button[data-slot]:not([disabled])") as HTMLElement | null)?.focus({ preventScroll: true })
    })
  }

  const close = () => {
    const card = cardRef.current
    const o = originRef.current
    if (!card || reduced) return finish()
    const from = card.getBoundingClientRect()
    const to = o && o.isConnected && phase !== "done" ? o.getBoundingClientRect() : null
    const frames =
      to && to.width > 0
        ? [
            { transform: "none", opacity: 1 },
            {
              transform:
                "translate(" +
                (to.left + to.width / 2 - (from.left + from.width / 2)) +
                "px," +
                (to.top + to.height / 2 - (from.top + from.height / 2)) +
                "px) scale(" +
                to.width / from.width +
                "," +
                to.height / from.height +
                ")",
              opacity: 0,
            },
          ]
        : [
            { transform: "none", opacity: 1 },
            { transform: "translateY(8px) scale(.97)", opacity: 0 },
          ]
    const a = card.animate(frames, { duration: 200, easing: EASE, fill: "forwards" })
    a.onfinish = finish
  }

  const validate = () => {
    const e: { name?: string; email?: string } = {}
    if (!name.trim()) e.name = L.nameError
    if (!osbEmailOk(email)) e.email = L.emailError
    return e
  }

  const shake = () => {
    const card = cardRef.current
    if (!card || reduced) return
    card.classList.remove("osb-shake")
    void card.offsetWidth
    card.classList.add("osb-shake")
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!picked || phase !== "form") return
    const e = validate()
    setErrors(e)
    if (e.name || e.email) {
      shake()
      ;(cardRef.current?.querySelector(e.name ? "#" + uid + "-name" : "#" + uid + "-email") as HTMLInputElement | null)?.focus()
      return
    }
    const s = picked.slot
    const booking: OsbBooking = { start: new Date(s.start), end: new Date(s.end), duration, timeZone: tz, name: name.trim(), email: email.trim(), note: note.trim() }
    setPhase("sending")
    try {
      await Promise.resolve(onBook ? onBook(booking) : null)
    } catch {
      setPhase("form")
      setErrors({ form: L.bookError })
      shake()
      return
    }
    const card = cardRef.current
    if (card && !reduced) {
      await card
        .animate([{ transform: "perspective(1000px) rotateX(0deg)" }, { transform: "perspective(1000px) rotateX(90deg)" }], {
          duration: 170,
          easing: "cubic-bezier(.55,0,.75,.2)",
          fill: "forwards",
        })
        .finished.catch(() => null)
    }
    setBooked((b) => b.concat([{ start: s.start, end: s.end, title: name.trim() }]))
    setLastBooking(booking)
    setPhase("done")
    setLive("Booked " + slotWords(s))
  }

  useLayoutEffect(() => {
    const card = cardRef.current
    if (phase !== "done" || !card) return
    card.getAnimations().forEach((a) => a.cancel())
    if (!reduced) {
      card.animate(
        [
          { transform: "perspective(1000px) rotateX(-90deg)" },
          { transform: "perspective(1000px) rotateX(9deg)", offset: 0.68 },
          { transform: "perspective(1000px) rotateX(0deg)" },
        ],
        { duration: 460, easing: "cubic-bezier(.2,.8,.3,1)" },
      )
      // the host's stamp comes down on the ticket; card and slab take the hit
      card.querySelector(".osb-press")?.animate(
        [
          { transform: "rotate(-26deg) scale(1.8)", opacity: 0 },
          { transform: "rotate(-12deg) scale(.9)", opacity: 0.95, offset: 0.62 },
          { transform: "rotate(-12deg) scale(1)", opacity: 0.92 },
        ],
        { duration: 360, delay: 420, easing: "cubic-bezier(.3,0,.25,1)", fill: "backwards" },
      )
      card.querySelector(".osb-ticket")?.animate(
        [{ transform: "none" }, { transform: "translateY(3px) scale(.994)" }, { transform: "none" }],
        { duration: 240, delay: 640, easing: EASE },
      )
      slabRef.current?.animate(
        [{ transform: "rotate(-2deg)" }, { transform: "rotate(-3.4deg) translateY(6px)", offset: 0.35 }, { transform: "rotate(-2deg)" }],
        { duration: 700, delay: 620, easing: EASE },
      )
    }
    ;(card.querySelector(".osb-primary") as HTMLElement | null)?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const another = () => {
    setName("")
    setEmail("")
    setNote("")
    close()
  }

  const downloadIcs = () => {
    if (!picked) return
    const s = picked.slot
    const ics = osbIcs({
      start: s.start,
      end: s.end,
      title: meetingTitle + " with " + host.name,
      description: (agenda ? agenda + "\n\n" : "") + (note ? "Notes: " + note : ""),
      location,
      uid: s.start + "-" + uid + "@open-slot-booking",
    })
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }))
    const a = document.createElement("a")
    a.href = url
    a.download = meetingTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".ics"
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const copyLink = async () => {
    const text = bookingHref || (bookingUrl.indexOf("://") > 0 ? bookingUrl : "https://" + bookingUrl)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard blocked: the label still shows the link */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  // arrow keys move between open slots: up/down in a day, left/right across days
  const onGridKey = (e: React.KeyboardEvent) => {
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]
    if (keys.indexOf(e.key) < 0) return
    const cur = (e.target as HTMLElement).closest("[data-slot]") as HTMLElement | null
    const all = Array.from(calRef.current?.querySelectorAll("button[data-slot]:not([disabled])") || []) as HTMLElement[]
    if (!cur || !all.length) return
    e.preventDefault()
    const col = Number(cur.dataset.col)
    const min = Number(cur.dataset.min)
    let next: HTMLElement | undefined
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const same = all.filter((b) => Number(b.dataset.col) === col).sort((a, b) => Number(a.dataset.min) - Number(b.dataset.min))
      const i = same.indexOf(cur)
      next = same[i + (e.key === "ArrowDown" ? 1 : -1)]
    } else {
      const d = e.key === "ArrowRight" ? 1 : -1
      for (let cc = col + d; cc >= 0 && cc <= 6 && !next; cc += d) {
        const cands = all.filter((b) => Number(b.dataset.col) === cc)
        if (cands.length) next = cands.reduce((best, b) => (Math.abs(Number(b.dataset.min) - min) < Math.abs(Number(best.dataset.min) - min) ? b : best))
      }
    }
    next?.focus()
  }

  const onListKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!d) return
    const all = Array.from((e.currentTarget as HTMLElement).querySelectorAll("button[data-slot]:not([disabled])")) as HTMLElement[]
    const i = all.indexOf(e.target as HTMLElement)
    if (i < 0) return
    e.preventDefault()
    all[Math.max(0, Math.min(all.length - 1, i + d))].focus()
  }

  const onCardKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation()
      close()
    }
  }

  const onSwipeDown = (e: React.PointerEvent) => {
    swipeRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }
  const onSwipeUp = (e: React.PointerEvent) => {
    const s = swipeRef.current
    swipeRef.current = null
    if (!s || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(e.clientY - s.y) * 1.4) return
    const d = dx < 0 ? 1 : -1
    let n = day + d
    while (n >= 0 && n <= 6 && openByCol[n] === 0) n += d
    if (n >= 0 && n <= 6) {
      setDir(d)
      setDay(n)
    } else if (d > 0 && weekKey < lastWeek) goWeek(weekKey + 7)
    else if (d < 0 && weekKey > thisWeek) goWeek(weekKey - 7)
  }

  const vars = {
    "--osb-display": fontFamily || DISPLAY_STACK,
    "--osb-slab": c.slab,
    "--osb-slab-ink": osbInk(c.slab),
    "--osb-from-l": c.from,
    "--osb-to-l": c.to,
    "--osb-from-d": c.fromDark,
    "--osb-to-d": c.toDark,
    "--osb-action": c.action,
    "--osb-action-ink": osbInk(c.action),
    "--osb-window": c.window,
    minHeight: height,
  } as React.CSSProperties

  const durIndex = Math.max(0, durations.indexOf(duration))
  const tail = (Math.max(0, duration - step) * ppm) | 0
  const picking = !!picked
  const pickedSlot = picked?.slot
  const dayIsPast = (i: number) => weekKey + i < todayKey
  // days already gone are left out; working days without a single slot stay as quiet narrow columns
  const cols = [0, 1, 2, 3, 4, 5, 6].filter((col) => {
    const dow = new Date((weekKey + col) * OSB_DAY).getUTCDay()
    return weekKey + col >= todayKey && (hours.days.indexOf(dow) >= 0 || rangeSlots.some((s) => s.col === col))
  })
  const colTrack = cols.map((col) => (rangeSlots.some((s) => s.col === col) ? "minmax(0, 1fr)" : "minmax(0, .5fr)")).join(" ")
  const PAD = 12
  const colTemplate = { gridTemplateColumns: "52px " + colTrack }
  const stripTemplate = { gridTemplateColumns: "repeat(" + cols.length + ", minmax(0, 88px))" }
  const hoursMarks: number[] = []
  for (let m = lo; m <= hi; m += 60) hoursMarks.push(m)

  // the host's busy time as one quiet bar per run, and the visitor's own bookings in slab colour
  const busyRuns = (col: number) => {
    const out: { from: number; to: number; who: string }[] = []
    for (const s of slots) {
      if (s.col !== col || s.state !== "taken") continue
      const mine = booked.find((b) => b.start < s.end && b.end > s.start)
      const who = mine ? mine.title : ""
      const last = out[out.length - 1]
      if (last && last.to === s.min && last.who === who) last.to = s.min + step
      else out.push({ from: s.min, to: s.min + step, who })
    }
    return out
  }

  // one Tab stop for the whole grid; the arrow keys move between slots
  const shown = compact ? slots.filter((s) => s.col === day) : slots
  const roveTarget = shown.some((s) => s.start === rove && s.state === "open") ? rove : shown.find((s) => s.state === "open")?.start

  const slotButton = (s: OsbSlot, i: number, inList: boolean) => {
    const isPicked = pickedSlot && pickedSlot.start === s.start
    if (s.state === "taken" || s.state === "past") {
      if (inList || s.state === "past") return null
      return null
    }
    const label = s.state === "clash" ? slotWords(s) + ", clashes with " + s.clash : slotWords(s)
    const btn = (
      <button
        key={s.start}
        type="button"
        className="osb-slot"
        data-slot=""
        data-col={s.col}
        data-min={s.min}
        data-tail={tail}
        data-state={isPicked ? "picked" : s.state}
        disabled={s.state === "clash"}
        tabIndex={s.state === "open" && s.start !== roveTarget ? -1 : undefined}
        onFocus={() => setRove(s.start)}
        aria-label={label}
        style={
          inList
            ? ({ "--i": i } as React.CSSProperties)
            : ({ top: (s.min - lo) * ppm + 3, height: stepPx - 6, "--i": i } as React.CSSProperties)
        }
        onClick={(e) => pick(s, e.currentTarget)}
      >
        {timeLabel(s.start)}
        <span className="osb-end">–{timeLabel(s.end)}</span>
      </button>
    )
    if (inList || !tail || s.state !== "open") return btn
    return (
      <React.Fragment key={s.start}>
        {btn}
        <i className="osb-tail" style={{ top: (s.min - lo) * ppm + stepPx - 3, height: tail } as React.CSSProperties} aria-hidden="true" />
      </React.Fragment>
    )
  }

  const card = picked ? (
    <>
      <div className="osb-scrim" onClick={phase === "form" ? close : undefined} aria-hidden="true" />
      <div
        ref={cardRef}
        className="osb-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={uid + "-when"}
        data-phase={phase}
        onKeyDown={onCardKey}
        style={phase === "done" ? { background: "transparent", boxShadow: "0 30px 60px -24px rgba(0,0,0,.55)" } : undefined}
      >
        {phase !== "done" ? (
          <form className="osb-form" onSubmit={submit} noValidate>
            <div className="osb-cardtop">
              <div className="osb-when" id={uid + "-when"}>
                <small>
                  {meetingTitle} · {duration} min
                </small>
                <strong>{fmt(picked.slot.start, { weekday: "short", day: "numeric", month: "short" })}</strong>
                <em>
                  {timeLabel(picked.slot.start)} – {timeLabel(picked.slot.end)}, <span style={{ whiteSpace: "nowrap" }}>{zoneName(tz)} time</span>
                </em>
                <i>
                  {Icon.video}
                  {location}
                </i>
              </div>
              <button type="button" className="osb-x" onClick={close} aria-label="Back to the calendar">
                {Icon.close}
              </button>
            </div>
            <div className="osb-fields">
              <div className="osb-field" data-error={!!errors.name}>
                <label htmlFor={uid + "-name"}>{L.name}</label>
                <input
                  id={uid + "-name"}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? uid + "-name-err" : undefined}
                />
                {errors.name && (
                  <div className="osb-err" id={uid + "-name-err"}>
                    {errors.name}
                  </div>
                )}
              </div>
              <div className="osb-field" data-error={!!errors.email}>
                <label htmlFor={uid + "-email"}>{L.email}</label>
                <input
                  id={uid + "-email"}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? uid + "-email-err" : undefined}
                />
                {errors.email && (
                  <div className="osb-err" id={uid + "-email-err"}>
                    {errors.email}
                  </div>
                )}
              </div>
              <div className="osb-field">
                <label htmlFor={uid + "-note"}>
                  {L.note} <span>{L.optional}</span>
                </label>
                <textarea id={uid + "-note"} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
            {errors.form && (
              <div className="osb-err" role="alert">
                {errors.form}
              </div>
            )}
            <div className="osb-actions">
              <button type="button" className="osb-ghost" onClick={close}>
                {L.back}
              </button>
              <button type="submit" className="osb-primary" disabled={phase === "sending"}>
                {phase === "sending" ? L.sending : L.confirm}
                {phase !== "sending" && Icon.arrow}
              </button>
            </div>
          </form>
        ) : (
          <div className="osb-ticket" style={{ background: "var(--osb-paper)" }}>
            <div className="osb-stub" aria-hidden="true">
              <small>{fmt(picked.slot.start, { month: "short" }).toUpperCase()}</small>
              <strong>{fmt(picked.slot.start, { day: "numeric" })}</strong>
              <small>{fmt(picked.slot.start, { weekday: "short" }).toUpperCase()}</small>
            </div>
            <div className="osb-tbody">
              <Impression uid={uid} words={"Booked · " + fmt(picked.slot.start, { day: "numeric", month: "short" }) + " · "} />
              <h3 id={uid + "-when"}>{L.booked}</h3>
              <p>
                <b>
                  {fmt(picked.slot.start, { weekday: "long", day: "numeric", month: "long" })}, {timeLabel(picked.slot.start)} – {timeLabel(picked.slot.end)}
                </b>{" "}
                <span style={{ whiteSpace: "nowrap" }}>({zoneName(tz)} time)</span>
              </p>
              <p>
                {meetingTitle} with {host.name}.{L.invite ? " " + L.invite.replace("{email}", email.trim()) : ""}
              </p>
              <div className="osb-actions">
                {getTicketHref && lastBooking ? (
                  <>
                    <a
                      className="osb-primary"
                      href={getTicketHref(lastBooking)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ticketCtaLabel || "Confirm on Cal.com"}
                      {Icon.arrow}
                    </a>
                    <button type="button" className="osb-ghost" onClick={downloadIcs}>
                      {L.addToCalendar}
                    </button>
                  </>
                ) : (
                  <button type="button" className="osb-primary" onClick={downloadIcs}>
                    {L.addToCalendar}
                  </button>
                )}
                <button type="button" className="osb-ghost" onClick={another}>
                  {L.another}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  ) : null

  const listDay = compact ? slots.filter((s) => s.col === day && s.state !== "taken" && s.state !== "past") : []
  const listMine = compact ? blocks.filter((b) => b.col === day) : []

  return (
    <section
      ref={rootRef}
      className={"osb" + (className ? " " + className : "")}
      data-theme={theme === "auto" ? undefined : theme}
      data-compact={compact}
      data-in={inView ? "1" : "0"}
      style={vars}
      aria-labelledby={headline ? uid + "-h" : undefined}
      aria-label={headline ? undefined : meetingTitle}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {(headline || description || altContact) && (
      <div className="osb-head" data-under="">
        {headline && (
        <h2 className="osb-h" id={uid + "-h"}>
          <span className="osb-rise" style={{ "--r": 0 } as React.CSSProperties}>
            {headline}
          </span>
          {headlineAccent && (
            <span className="osb-accent osb-rise" style={{ "--r": 1 } as React.CSSProperties}>
              {headlineAccent}
            </span>
          )}
        </h2>
        )}
        {description && (
          <p className="osb-sub osb-rise" style={{ "--r": 2 } as React.CSSProperties}>
            {description}
          </p>
        )}
        {altContact && (
          <a className="osb-alt osb-rise" href={altContact.href} style={{ "--r": 3 } as React.CSSProperties}>
            {altContact.label}
          </a>
        )}
      </div>
      )}

      <div className="osb-stage osb-rise" style={{ "--r": 3 } as React.CSSProperties}>
        <div ref={slabRef} className="osb-slab" aria-hidden="true" />
        <div ref={winRef} className="osb-win">
          <div className="osb-bar" data-under="">
            {chrome === "browser" && (
              <div className="osb-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            )}
            <div className="osb-url">
              {Icon.link}
              <b>{bookingUrl}</b>
            </div>
            <button type="button" className="osb-copy" onClick={copyLink} aria-label={copied ? "Link copied" : "Copy booking link"}>
              {copied ? L.copied : L.copyLink}
            </button>
          </div>

          <div className="osb-body">
            <aside className="osb-host" data-under="" aria-label={"About the call with " + host.name}>
              <div className="osb-who">
                <Stamp host={host} uid={uid} />
                <div>
                  <div className="osb-name">{host.name}</div>
                  {host.role && <div className="osb-role">{host.role}</div>}
                  <div className="osb-live">
                    <i aria-hidden="true" />
                    {zoneName(hostTimeZone)}, {timeLabel(now, hostTimeZone)} now
                  </div>
                </div>
              </div>
              <div>
                <h3 className="osb-meet">{meetingTitle}</h3>
                {agenda && <p className="osb-agenda">{agenda}</p>}
              </div>
              <div className="osb-opts">
              {durations.length > 1 && (
                <div>
                  <span className="osb-label" id={uid + "-dur"}>
                    {L.howLong}
                  </span>
                  <div className="osb-seg" role="group" aria-labelledby={uid + "-dur"}>
                    <span
                      className="osb-seg-pill"
                      aria-hidden="true"
                      style={{ width: "calc((100% - 6px) / " + durations.length + ")", transform: "translateX(" + durIndex * 100 + "%)" }}
                    />
                    {durations.map((d) => (
                      <button key={d} type="button" aria-pressed={d === duration} disabled={picking} onClick={() => setDuration(d)}>
                        {d} {L.minutes}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="osb-tzwrap">
                <label className="osb-label" htmlFor={uid + "-tz"}>
                  {L.showTimesIn}
                </label>
                <div className="osb-tz">
                  {Icon.globe}
                  <select id={uid + "-tz"} value={tz} onChange={(e) => setTz(e.target.value)} disabled={picking}>
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {compact ? cityOf(z) : cityOf(z) + " (" + gmt(z, now) + ")"}
                      </option>
                    ))}
                  </select>
                  {Icon.chev}
                </div>
              </div>
              </div>
              <div className="osb-meta">
                <div>
                  {Icon.video}
                  {location}
                </div>
                {responseNote && (
                  <div>
                    {Icon.clock}
                    {responseNote}
                  </div>
                )}
              </div>
            </aside>

            <div ref={calRef} className="osb-cal">
              <div data-under="">
                <div className="osb-calhead">
                  <div className="osb-pick">
                    <span className="osb-pick-ico">{Icon.pointer}</span>
                    {L.pick}
                  </div>
                  {canOverlay && !compact && (
                    <button
                      type="button"
                      className="osb-switch"
                      role="switch"
                      aria-checked={overlay}
                      aria-busy={linking === "loading"}
                      data-linking={linking}
                      onClick={toggleOverlay}
                    >
                      {Icon.cal}
                      <span className="osb-track" aria-hidden="true">
                        <i />
                      </span>
                      <span className="osb-switch-label">{linking === "loading" ? L.connecting : linking === "error" ? L.overlayError : L.overlay}</span>
                    </button>
                  )}
                  <div className="osb-weeknav">
                    <div className="osb-month" aria-live="off">
                      {monthLabel}
                    </div>
                    {!(compact && weekKey === thisWeek) && (
                      <button type="button" className="osb-btn" onClick={() => goWeek(thisWeek)} disabled={weekKey === thisWeek}>
                        {L.today}
                      </button>
                    )}
                    <button type="button" className="osb-btn osb-icon" onClick={() => goWeek(weekKey - 7)} disabled={weekKey <= thisWeek} aria-label="Previous week">
                      {Icon.left}
                    </button>
                    <button type="button" className="osb-btn osb-icon" onClick={() => goWeek(weekKey + 7)} disabled={weekKey >= lastWeek} aria-label="Next week">
                      {Icon.right}
                    </button>
                  </div>
                </div>

                {!compact ? (
                  <div className="osb-grid" onKeyDown={onGridKey} data-checking={checking} aria-busy={checking}>
                    <div className="osb-days" style={colTemplate}>
                      <span />
                      {cols.map((i) => days[i]).map((d) => (
                        <div key={weekKey + "-" + d.i} className="osb-day" data-today={d.key === todayKey} data-past={dayIsPast(d.i)}>
                          {d.wd}
                          <b>{d.d}</b>
                        </div>
                      ))}
                    </div>
                    <div ref={scrollRef} className="osb-scroll" style={{ maxHeight: gridHeight }}>
                      <div className="osb-rows" style={{ height: bodyPx + PAD + 10, ...colTemplate }}>
                        <div className="osb-gutter" aria-hidden="true">
                          {hoursMarks.map((m) => (
                            <span key={m} className="osb-hour" style={{ top: (m - lo) * ppm + PAD }}>
                              {m === hi ? "" : hourLabel(m)}
                            </span>
                          ))}
                        </div>
                        <div className="osb-lines" aria-hidden="true">
                          {hoursMarks.map((m) => (
                            <i key={m} style={{ top: (m - lo) * ppm + PAD }} />
                          ))}
                        </div>
                        {cols.map((col) => {
                          const colSlots = slots.filter((s) => s.col === col)
                          const showNow = weekKey + col === todayKey && nowMin >= lo && nowMin <= hi
                          return (
                            <div
                              key={weekKey + "-" + col}
                              className="osb-col"
                              data-past={dayIsPast(col)}
                              role="group"
                              aria-label={days[col].long}
                              style={{ "--c": cols.indexOf(col), "--dir": dir, marginTop: PAD } as React.CSSProperties}
                            >
                              {blocks
                                .filter((b) => b.col === col && b.to > lo && b.from < hi)
                                .map((b, i) => {
                                  const top = (Math.max(b.from, lo) - lo) * ppm
                                  const h = (Math.min(b.to, hi) - Math.max(b.from, lo)) * ppm
                                  return (
                                    <div key={"b" + col + "-" + i} className="osb-block" style={{ top: top + 1, height: h - 2, "--i": col + i } as React.CSSProperties} aria-hidden="true">
                                      <span>{b.title}</span>
                                    </div>
                                  )
                                })}
                              {busyRuns(col).map((r) => (
                                <div
                                  key={"r" + r.from}
                                  className={r.who ? "osb-booked" : "osb-busy"}
                                  style={{ top: (r.from - lo) * ppm + 3, height: (r.to - r.from) * ppm - 6 }}
                                  aria-hidden="true"
                                >
                                  <span>{r.who ? L.yours + " · " + r.who : L.busy}</span>
                                </div>
                              ))}
                              {colSlots.map((s, i) => slotButton(s, i, false))}
                              {showNow && <i className="osb-now" style={{ top: (nowMin - lo) * ppm }} aria-hidden="true" />}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {!slots.some((s) => s.state === "open") && (
                      <div className="osb-none">
                        {L.empty}
                        {weekKey < lastWeek && (
                          <button type="button" className="osb-btn" onClick={() => goWeek(weekKey + 7)}>
                            {L.nextWeek}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="osb-strip" role="group" aria-label="Days this week" style={stripTemplate}>
                      {cols.map((i) => days[i]).map((d) => (
                        <button
                          key={weekKey + "-" + d.i}
                          type="button"
                          className="osb-chip"
                          aria-pressed={day === d.i}
                          aria-label={d.long + ", " + openByCol[d.i] + " open slots"}
                          disabled={openByCol[d.i] === 0}
                          onClick={() => {
                            setDir(d.i > day ? 1 : -1)
                            setDay(d.i)
                          }}
                        >
                          {d.wd.slice(0, 3)}
                          <b>{d.d}</b>
                          <i style={{ "--o": openByCol[d.i] ? 1 : 0 } as React.CSSProperties} />
                        </button>
                      ))}
                    </div>
                    <div
                      key={weekKey + "-" + day + "-" + duration + "-" + tz}
                      className="osb-list"
                      style={{ "--dir": dir } as React.CSSProperties}
                      onPointerDown={onSwipeDown}
                      onPointerUp={onSwipeUp}
                      onPointerCancel={() => (swipeRef.current = null)}
                    >
                      {(canOverlay || listMine.length > 0) && (
                        <div className="osb-mine">
                          {canOverlay && (
                            <button
                              type="button"
                              className="osb-switch"
                              role="switch"
                              aria-checked={overlay}
                              aria-busy={linking === "loading"}
                              aria-label={L.overlay}
                              data-linking={linking}
                              onClick={toggleOverlay}
                            >
                              <span className="osb-track" aria-hidden="true">
                                <i />
                              </span>
                              {linking === "loading" ? L.connecting : linking === "error" ? L.overlayError : L.overlayShort}
                            </button>
                          )}
                          {listMine.map((b, i) => (
                            <span key={i}>
                              {b.title}, {timeLabel(osbAt(weekKey + day, b.from, tz))}–{timeLabel(osbAt(weekKey + day, b.to, tz))}
                            </span>
                          ))}
                        </div>
                      )}
                      {listDay.length ? (
                        <div className="osb-list-grid" role="group" aria-label={days[day].long} onKeyDown={onListKey}>
                          {listDay.map((s, i) => slotButton(s, i, true))}
                        </div>
                      ) : (
                        <div className="osb-empty">{L.empty}</div>
                      )}
                    </div>
                  </div>
                )}

                {!compact && (
                  <div className="osb-legend" aria-hidden="true">
                    <span>
                      <i className="osb-lg-open" />
                      {L.open}
                    </span>
                    <span>
                      <i className="osb-lg-taken" />
                      {L.busy}
                    </span>
                    {overlay && (
                      <span>
                        <i className="osb-lg-busy" />
                        {L.yourCalendar}
                      </span>
                    )}
                    <span>{checking ? L.checking : L.timesIn + " " + zoneName(tz) + " (" + gmt(tz, now) + ")"}</span>
                  </div>
                )}
              </div>
              {card}
            </div>
          </div>
        </div>
      </div>
      <div className="osb-sr" aria-live="polite">
        {live}
      </div>
    </section>
  )
}

