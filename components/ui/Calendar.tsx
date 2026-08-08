"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type DayStatus = "available" | "unavailable" | "blocked" | "unknown";

interface CalendarProps {
  selected?: string | null;
  onSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  dayStatus?: Record<string, DayStatus>;
  onMonthChange?: (year: number, month: number) => void;
  loading?: boolean;
  disableUnavailable?: boolean;
  disablePast?: boolean;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export default function Calendar({ selected, onSelect, minDate, maxDate, dayStatus, onMonthChange, loading, disableUnavailable = true, disablePast = true }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-12
  const [direction, setDirection] = useState(1);

  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [viewYear, viewMonth]);

  const changeMonth = (delta: number) => {
    setDirection(delta);
    let y = viewYear;
    let m = viewMonth + delta;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setViewYear(y);
    setViewMonth(m);
    onMonthChange?.(y, m);
  };

  const canGoPrev = !minDate || `${viewYear}-${pad(viewMonth)}` > minDate.slice(0, 7);
  const canGoNext = !maxDate || `${viewYear}-${pad(viewMonth)}` < maxDate.slice(0, 7);

  return (
    <div className="bg-brand-charcoal border border-white/5 p-4 sm:p-6 select-none">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => canGoPrev && changeMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-gold disabled:opacity-20 disabled:pointer-events-none transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="font-display text-lg text-brand-white font-semibold tracking-wide">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <button
          type="button"
          onClick={() => canGoNext && changeMonth(1)}
          disabled={!canGoNext}
          aria-label="Next month"
          className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-gold disabled:opacity-20 disabled:pointer-events-none transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[10px] tracking-widest uppercase text-brand-muted/60 py-1">
            {w}
          </div>
        ))}
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          custom={direction}
          initial={{ opacity: 0, x: direction * 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="grid grid-cols-7 gap-1"
        >
          {cells.map((d, i) => {
            if (d === null) return <div key={`empty-${i}`} />;
            const dateStr = toDateStr(viewYear, viewMonth, d);
            const rawIsPast = dateStr < (minDate || todayStr);
            const isPast = disablePast && rawIsPast;
            const isBeyondMax = maxDate ? dateStr > maxDate : false;
            const status = dayStatus?.[dateStr];
            const isMarkedBlocked = status === "unavailable" || status === "blocked";
            const isBlocked = disableUnavailable && isMarkedBlocked;
            const disabled = isPast || isBeyondMax || isBlocked;
            const isSelected = selected === dateStr;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(dateStr)}
                className={`relative aspect-square flex items-center justify-center text-sm transition-all duration-150 ${
                  isSelected
                    ? "bg-brand-gold text-brand-black font-bold"
                    : disabled
                      ? "text-brand-muted/25 cursor-not-allowed line-through decoration-brand-muted/20"
                      : isMarkedBlocked
                        ? "text-red-400/80 bg-red-500/10 hover:bg-red-500/20 cursor-pointer"
                        : "text-brand-light hover:bg-brand-gray hover:text-brand-gold cursor-pointer"
                } ${isToday && !isSelected ? "ring-1 ring-inset ring-brand-gold/40" : ""} ${rawIsPast && !disablePast ? "opacity-40" : ""}`}
              >
                {d}
                {status === "available" && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500/70" />
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {loading && (
        <p className="text-brand-muted/50 text-xs text-center mt-4">Checking availability&hellip;</p>
      )}

      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5 text-[11px] text-brand-muted/60">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500/70" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-brand-muted/25" /> Unavailable
        </span>
      </div>
    </div>
  );
}
