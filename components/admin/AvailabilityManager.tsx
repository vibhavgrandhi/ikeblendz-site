"use client";

import { useState, useEffect, useCallback } from "react";
import Calendar, { type DayStatus } from "@/components/ui/Calendar";

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
  full_day: boolean;
}

interface BlockedRange {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

interface BusinessHours {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${(h % 12) || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

type ApiFn = (url: string, options?: RequestInit) => Promise<Record<string, unknown> | null>;

export default function AvailabilityManager({ api }: { api: ApiFn }) {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const load = useCallback(async () => {
    const data = await api("/api/admin/availability");
    if (data) {
      setBlockedDates((data.blocked_dates as BlockedDate[]) || []);
      setBlockedRanges((data.blocked_time_ranges as BlockedRange[]) || []);
      setBusinessHours((data.business_hours as BusinessHours[]) || []);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const dayStatus: Record<string, DayStatus> = {};
  for (const b of blockedDates) {
    if (b.full_day) dayStatus[b.date] = "blocked";
  }
  for (const r of blockedRanges) {
    if (!dayStatus[r.date]) dayStatus[r.date] = "blocked";
  }

  const existingFullBlock = blockedDates.find((b) => b.date === selectedDate && b.full_day);
  const existingRanges = blockedRanges.filter((r) => r.date === selectedDate);

  const blockFullDay = async () => {
    if (!selectedDate) return;
    await api("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, reason, full_day: true }),
    });
    setReason("");
    load();
  };

  const unblockFullDay = async () => {
    if (!existingFullBlock) return;
    await api(`/api/admin/availability?id=${existingFullBlock.id}&type=date`, { method: "DELETE" });
    load();
  };

  const addTimeRange = async () => {
    if (!selectedDate || !rangeStart || !rangeEnd) return;
    await api("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "range", date: selectedDate, start_time: rangeStart, end_time: rangeEnd, reason }),
    });
    setRangeStart("");
    setRangeEnd("");
    setReason("");
    setRangeMode(false);
    load();
  };

  const removeRange = async (id: string) => {
    await api(`/api/admin/availability?id=${id}&type=range`, { method: "DELETE" });
    load();
  };

  const updateHours = async (day: BusinessHours, field: string, value: string | boolean) => {
    const updated = { ...day, [field]: value };
    setBusinessHours((prev) => prev.map((h) => (h.day_of_week === day.day_of_week ? updated : h)));
    await api("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "hours",
        day_of_week: day.day_of_week,
        open_time: updated.open_time,
        close_time: updated.close_time,
        is_closed: updated.is_closed,
      }),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-brand-white text-sm font-semibold uppercase tracking-wider mb-3">Block Dates</h3>
        <p className="text-brand-muted text-xs mb-4">Click any date to block it or manage its hours. This calendar is what customers see on the booking page.</p>
        <Calendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          dayStatus={dayStatus}
          disableUnavailable={false}
          disablePast={false}
        />

        {selectedDate && (
          <div className="mt-4 bg-brand-charcoal border border-white/5 p-4 sm:p-5">
            <p className="text-brand-white text-sm font-semibold mb-3">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>

            {existingFullBlock ? (
              <div className="flex items-center justify-between bg-red-500/10 px-3 py-2 mb-3">
                <span className="text-red-400 text-xs">Blocked all day{existingFullBlock.reason ? ` — ${existingFullBlock.reason}` : ""}</span>
                <button onClick={unblockFullDay} className="text-brand-gold text-xs hover:text-brand-gold-light transition-colors">Unblock</button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="flex-1 bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
                />
                <button onClick={blockFullDay} className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-semibold tracking-wider uppercase hover:bg-red-500/30 transition-colors whitespace-nowrap">
                  Block Whole Day
                </button>
              </div>
            )}

            {existingRanges.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {existingRanges.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-brand-dark px-3 py-2">
                    <span className="text-brand-light text-xs">{formatTime(r.start_time)} — {formatTime(r.end_time)}{r.reason ? ` (${r.reason})` : ""}</span>
                    <button onClick={() => removeRange(r.id)} className="text-red-400 text-xs hover:text-red-300 transition-colors">Remove</button>
                  </div>
                ))}
              </div>
            )}

            {!existingFullBlock && (
              rangeMode ? (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input type="time" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm [color-scheme:dark]" />
                  <span className="text-brand-muted text-xs self-center">to</span>
                  <input type="time" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm [color-scheme:dark]" />
                  <button onClick={addTimeRange} className="px-4 py-2 bg-brand-gold text-brand-black text-xs font-semibold tracking-wider uppercase hover:bg-brand-gold-light transition-colors">Block</button>
                  <button onClick={() => setRangeMode(false)} className="text-brand-muted text-xs hover:text-brand-white transition-colors">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setRangeMode(true)} className="text-brand-gold text-xs hover:text-brand-gold-light transition-colors">
                  + Block specific hours instead
                </button>
              )
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-brand-white text-sm font-semibold uppercase tracking-wider mb-3">Weekly Hours</h3>
        <div className="space-y-2">
          {businessHours.map((h) => (
            <div key={h.day_of_week} className="bg-brand-charcoal border border-white/5 p-3 flex flex-wrap items-center gap-3">
              <span className="text-brand-white text-sm w-24">{DAY_NAMES[h.day_of_week]}</span>
              {h.is_closed ? (
                <span className="text-brand-muted text-xs flex-1">Closed</span>
              ) : (
                <>
                  <input
                    type="time"
                    value={h.open_time?.slice(0, 5)}
                    onChange={(e) => updateHours(h, "open_time", e.target.value)}
                    className="bg-brand-dark border border-white/10 text-brand-white px-2 py-1.5 text-sm [color-scheme:dark]"
                  />
                  <span className="text-brand-muted text-xs">to</span>
                  <input
                    type="time"
                    value={h.close_time?.slice(0, 5)}
                    onChange={(e) => updateHours(h, "close_time", e.target.value)}
                    className="bg-brand-dark border border-white/10 text-brand-white px-2 py-1.5 text-sm [color-scheme:dark]"
                  />
                </>
              )}
              <button
                onClick={() => updateHours(h, "is_closed", !h.is_closed)}
                className={`ml-auto text-xs px-3 py-1.5 uppercase tracking-wider transition-colors ${
                  h.is_closed ? "bg-brand-gold/20 text-brand-gold" : "bg-brand-gray text-brand-muted hover:text-white"
                }`}
              >
                {h.is_closed ? "Open This Day" : "Close This Day"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
