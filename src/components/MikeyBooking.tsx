"use client";

import React, { useCallback } from "react";
import OpenSlotBooking, {
  type OsbBooking,
  type OsbBusy,
  type OsbHours,
} from "@/components/ui/open-slot-booking";

export const MIKEY_CAL_BASE_URL =
  "https://cal.com/mad-ez-media/ai-automation-discovery";

/**
 * Curated booking window for Mikey Shaw.
 * Edit days/hours/noticeHours here to tighten or expand discovery availability.
 * Days use JS weekday indices: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat.
 */
export const MIKEY_BOOKING_CONFIG = {
  calDisplayUrl: "cal.com/mad-ez-media/ai-automation-discovery",
  calHref: MIKEY_CAL_BASE_URL,
  hostTimeZone: "America/New_York",
  city: "Charlotte",
  hours: {
    days: [2, 3, 4], // Tue, Wed, Thu only
    from: "10:00",
    to: "15:00",
  } satisfies OsbHours,
  // Midday focus & client ops buffer blocked out every booking day
  hostBusy: [
    { weekday: 2, from: "12:00", to: "13:00", title: "Client ops" },
    { weekday: 3, from: "12:00", to: "13:00", title: "Client ops" },
    { weekday: 4, from: "12:00", to: "13:00", title: "Client ops" },
  ] satisfies OsbBusy[],
  durations: [15, 30],
  defaultDuration: 30,
  step: 30,
  noticeHours: 24,
  weeksAhead: 3,
} as const;

function formatDateInTz(date: Date, timeZone: string): { dateStr: string; monthStr: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const y = get("year");
  const m = get("month");
  const d = get("day");
  return { dateStr: `${y}-${m}-${d}`, monthStr: `${y}-${m}` };
}

export function buildCalBookingUrl(booking: OsbBooking): string {
  const { dateStr, monthStr } = formatDateInTz(
    booking.start,
    MIKEY_BOOKING_CONFIG.hostTimeZone
  );
  const params = new URLSearchParams();
  params.set("date", dateStr);
  params.set("month", monthStr);
  params.set("slot", booking.start.toISOString());
  params.set("duration", String(booking.duration));
  if (booking.name) params.set("name", booking.name);
  if (booking.email) params.set("email", booking.email);
  if (booking.note) params.set("notes", booking.note);
  return `${MIKEY_BOOKING_CONFIG.calHref}?${params.toString()}`;
}

export interface MikeyBookingProps {
  compactHeading?: boolean;
}

export default function MikeyBooking({ compactHeading = false }: MikeyBookingProps) {
  const handleBook = useCallback((booking: OsbBooking) => {
    const calUrl = buildCalBookingUrl(booking);
    // Open pre-filled Cal.com confirmation in a new tab so the slot actually locks on Mikey's calendar.
    if (typeof window !== "undefined") {
      window.open(calUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  return (
    <div id="book-call" className="w-full scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ms-chip ms-chip--locked">Limited Windows</span>
          <span
            className="text-xs font-semibold tracking-wide text-[var(--ms-muted)]"
            style={{ fontFamily: "var(--ms-font-mono)" }}
          >
            Tue to Thu · 10:00 AM to 3:00 PM ET · 24h notice
          </span>
        </div>
        <a
          href={MIKEY_BOOKING_CONFIG.calHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center text-xs font-bold uppercase tracking-[0.12em] text-[var(--ms-text)] underline decoration-[var(--ms-ember)] decoration-2 underline-offset-4 hover:text-[var(--ms-accent-text)]"
          style={{ fontFamily: "var(--ms-font-mono)" }}
        >
          Open Cal.com directly →
        </a>
      </div>

      <OpenSlotBooking
        preset="mikey"
        theme="auto"
        chrome="browser"
        height="auto"
        gridHeight={360}
        fontFamily="var(--ms-font-head)"
        headline={compactHeading ? null : "Skip the pitch deck."}
        headlineAccent={compactHeading ? undefined : "Bring one real workflow."}
        description={
          compactHeading
            ? null
            : "Pick an open discovery window below. Confirming opens Cal.com pre-filled with your slot so it locks cleanly on both calendars."
        }
        altContact={
          compactHeading
            ? null
            : {
                label: "Prefer email? michael@madezmedia.com",
                href: "mailto:michael@madezmedia.com",
              }
        }
        host={{
          name: "Mikey Shaw",
          role: "Fractional CTO & AI Systems Architect",
          initials: "MS",
          stamp: "Mikey Shaw · Charlotte NC · ",
          city: MIKEY_BOOKING_CONFIG.city,
        }}
        meetingTitle="AI Systems Discovery"
        agenda="Bring one real operational bottleneck or agent stack. You leave with an honest architecture plan either way."
        location="Google Meet link sent by Cal.com"
        responseNote="Tue to Thu, 10 AM to 3 PM ET"
        bookingUrl={MIKEY_BOOKING_CONFIG.calDisplayUrl}
        bookingHref={MIKEY_BOOKING_CONFIG.calHref}
        hostTimeZone={MIKEY_BOOKING_CONFIG.hostTimeZone}
        timeZones={[
          "America/New_York",
          "America/Chicago",
          "America/Denver",
          "America/Los_Angeles",
          "Europe/London",
          "Europe/Berlin",
        ]}
        hours={MIKEY_BOOKING_CONFIG.hours}
        hostBusy={[...MIKEY_BOOKING_CONFIG.hostBusy]}
        durations={[...MIKEY_BOOKING_CONFIG.durations]}
        defaultDuration={MIKEY_BOOKING_CONFIG.defaultDuration}
        step={MIKEY_BOOKING_CONFIG.step}
        noticeHours={MIKEY_BOOKING_CONFIG.noticeHours}
        weeksAhead={MIKEY_BOOKING_CONFIG.weeksAhead}
        weekStartsOn={1}
        clock="12h"
        onBook={handleBook}
        getTicketHref={buildCalBookingUrl}
        ticketCtaLabel="Finish on Cal.com"
        labels={{
          pick: "Pick a discovery window",
          confirm: "Continue to Cal.com",
          sending: "Opening Cal.com…",
          booked: "Slot ready on Cal.com.",
          invite:
            "Complete the final confirmation in the Cal.com tab to send the calendar invite to {email}.",
          addToCalendar: "Download .ics",
          another: "Pick another slot",
          note: "What system or bottleneck are we looking at?",
          empty: "No open windows left this week.",
          nextWeek: "See next week",
        }}
      />
    </div>
  );
}
