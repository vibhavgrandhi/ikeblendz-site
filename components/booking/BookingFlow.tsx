"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Calendar, { type DayStatus } from "@/components/ui/Calendar";
import type { Service } from "@/types";

type Step = "service" | "date" | "time" | "info" | "review" | "confirmed";

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const fadeStep = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

export default function BookingFlow({ services, preselected = "" }: { services: Service[]; preselected?: string }) {
  const [step, setStep] = useState<Step>(preselected ? "date" : "service");
  const [service, setService] = useState(preselected);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [monthAvailability, setMonthAvailability] = useState<Record<string, DayStatus>>({});
  const [loading, setLoading] = useState(false);
  const [monthLoading, setMonthLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const svc = services.find((s) => s.name === service);

  const fetchSlots = useCallback(async (d: string) => {
    if (!svc) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?date=${d}&duration=${svc.duration_minutes}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    }
    setLoading(false);
  }, [svc]);

  const fetchMonth = useCallback(async (year: number, month: number) => {
    if (!svc) return;
    setMonthLoading(true);
    try {
      const res = await fetch(`/api/availability/month?year=${year}&month=${month}&duration=${svc.duration_minutes}`);
      const data = await res.json();
      const statusMap: Record<string, DayStatus> = {};
      for (const [d, avail] of Object.entries(data.days || {})) {
        statusMap[d] = avail ? "available" : "unavailable";
      }
      setMonthAvailability(statusMap);
    } catch {
      setMonthAvailability({});
    }
    setMonthLoading(false);
  }, [svc]);

  useEffect(() => {
    if (step === "date" && svc) {
      const now = new Date();
      fetchMonth(now.getFullYear(), now.getMonth() + 1);
    }
  }, [step, svc, fetchMonth]);

  useEffect(() => {
    if (date && svc) fetchSlots(date);
  }, [date, svc, fetchSlots]);

  const selectService = (n: string) => { setService(n); setStep("date"); };
  const selectDate = (d: string) => { setDate(d); setTime(""); setTimeEnd(""); setStep("time"); };
  const selectTime = (slot: TimeSlot) => { setTime(slot.start); setTimeEnd(slot.end); setStep("info"); };

  const submitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep("review");
  };

  const confirmBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: service,
          date,
          start_time: time,
          end_time: timeEnd,
          customer_name: name,
          customer_phone: phone || null,
          customer_instagram: instagram || null,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setStep("confirmed");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Service" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "info", label: "Details" },
    { key: "review", label: "Confirm" },
  ];

  const stepOrder: Step[] = ["service", "date", "time", "info", "review", "confirmed"];
  const currentIdx = Math.min(stepOrder.indexOf(step), 4);

  return (
    <div className="pt-24 sm:pt-32 pb-20 sm:pb-28 px-5 sm:px-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-px bg-brand-gold" />
        <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">Appointment</span>
      </div>
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-white mb-8">Book Your Cut</h1>

      {step !== "confirmed" && (
        <div className="flex gap-1 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex-1">
              <motion.div
                className="h-1"
                animate={{ backgroundColor: i <= currentIdx ? "#c8a55a" : "#2a2a2a" }}
                transition={{ duration: 0.3 }}
              />
              <span className={`text-[10px] sm:text-xs mt-1.5 block tracking-wider uppercase ${i <= currentIdx ? "text-brand-gold" : "text-brand-muted/40"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {step === "service" && (
          <motion.div key="service" {...fadeStep} className="space-y-3">
            <h2 className="text-brand-white text-lg font-semibold mb-4">Choose a Service</h2>
            {services.length === 0 ? (
              <p className="text-brand-muted py-8 text-center">No services available right now.</p>
            ) : (
              services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectService(s.name)}
                  className="w-full text-left bg-brand-charcoal border border-white/5 hover:border-brand-gold/30 p-5 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-brand-white font-semibold">{s.name}</span>
                    <span className="block text-brand-muted text-sm mt-0.5">{s.duration_minutes} min</span>
                  </div>
                  <span className="text-brand-gold font-display text-xl font-bold">${s.price}</span>
                </button>
              ))
            )}
          </motion.div>
        )}

        {step === "date" && (
          <motion.div key="date" {...fadeStep}>
            <h2 className="text-brand-white text-lg font-semibold mb-2">Pick a Date</h2>
            <p className="text-brand-muted text-sm mb-6">{service} — {svc?.duration_minutes} min — ${svc?.price}</p>
            <Calendar
              selected={date}
              onSelect={selectDate}
              minDate={today}
              maxDate={maxDate}
              dayStatus={monthAvailability}
              onMonthChange={fetchMonth}
              loading={monthLoading}
            />
            <button onClick={() => { setStep("service"); setService(""); }} className="mt-4 text-brand-muted text-sm hover:text-brand-gold transition-colors">
              &larr; Change service
            </button>
          </motion.div>
        )}

        {step === "time" && (
          <motion.div key="time" {...fadeStep}>
            <h2 className="text-brand-white text-lg font-semibold mb-2">Choose a Time</h2>
            <p className="text-brand-muted text-sm mb-6">
              {service} — {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            {loading ? (
              <div className="text-brand-muted py-12 text-center">Loading availability...</div>
            ) : slots.filter((s) => s.available).length === 0 ? (
              <div className="text-brand-muted py-12 text-center">No available slots. Try another day.</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.filter((s) => s.available).map((slot) => (
                  <motion.button
                    key={slot.start}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectTime(slot)}
                    className="py-3 text-sm text-center bg-brand-charcoal border border-white/10 text-brand-light hover:border-brand-gold hover:text-brand-gold transition-all"
                  >
                    {formatTime(slot.start)}
                  </motion.button>
                ))}
              </div>
            )}
            <button onClick={() => { setStep("date"); setTime(""); }} className="mt-4 text-brand-muted text-sm hover:text-brand-gold transition-colors">
              &larr; Change date
            </button>
          </motion.div>
        )}

        {step === "info" && (
          <motion.form key="info" {...fadeStep} onSubmit={submitInfo}>
            <h2 className="text-brand-white text-lg font-semibold mb-6">Your Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-brand-muted text-xs tracking-wider uppercase mb-1.5">Full Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-charcoal border border-white/10 text-brand-white px-4 py-3 focus:border-brand-gold focus:outline-none transition-colors"
                  placeholder="Your name" />
              </div>
              <div>
                <label className="block text-brand-muted text-xs tracking-wider uppercase mb-1.5">Phone *</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-brand-charcoal border border-white/10 text-brand-white px-4 py-3 focus:border-brand-gold focus:outline-none transition-colors"
                  placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="block text-brand-muted text-xs tracking-wider uppercase mb-1.5">Instagram (optional)</label>
                <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-brand-charcoal border border-white/10 text-brand-white px-4 py-3 focus:border-brand-gold focus:outline-none transition-colors"
                  placeholder="@yourhandle" />
              </div>
              <div>
                <label className="block text-brand-muted text-xs tracking-wider uppercase mb-1.5">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  className="w-full bg-brand-charcoal border border-white/10 text-brand-white px-4 py-3 focus:border-brand-gold focus:outline-none transition-colors resize-none"
                  placeholder="Anything we should know?" />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button type="button" onClick={() => setStep("time")} className="text-brand-muted text-sm hover:text-brand-gold transition-colors">
                &larr; Back
              </button>
              <button type="submit" className="flex-1 py-3.5 bg-brand-gold text-brand-black font-semibold text-sm tracking-widest uppercase hover:bg-brand-gold-light transition-colors">
                Review Booking
              </button>
            </div>
          </motion.form>
        )}

        {step === "review" && (
          <motion.div key="review" {...fadeStep}>
            <h2 className="text-brand-white text-lg font-semibold mb-6">Review Your Booking</h2>
            <div className="bg-brand-charcoal border border-white/5 divide-y divide-white/5 mb-6">
              {[
                { label: "Service", value: `${service} — $${svc?.price}` },
                { label: "Date", value: new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) },
                { label: "Time", value: `${formatTime(time)} — ${formatTime(timeEnd)}` },
                { label: "Name", value: name },
                ...(phone ? [{ label: "Phone", value: phone }] : []),
                ...(instagram ? [{ label: "Instagram", value: instagram }] : []),
                ...(notes ? [{ label: "Notes", value: notes }] : []),
              ].map((item) => (
                <div key={item.label} className="px-6 py-4 flex justify-between">
                  <span className="text-brand-muted text-sm">{item.label}</span>
                  <span className="text-brand-white text-sm text-right">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-brand-charcoal border border-white/5 p-4 mb-5 space-y-2 text-xs text-brand-muted leading-relaxed">
              <p className="text-brand-gold text-xs tracking-wider uppercase font-semibold mb-2">Booking Policies</p>
              <p>• Payment is due in person at time of service.</p>
              <p>• Arriving 10+ minutes late — additional $10 charged in person.</p>
              <p>• No-show or same-day cancel — $5 fee applies to your next booking.</p>
              <p>• Cancel 24hrs+ before — no charge, spot freed for others.</p>
            </div>

            <label className="flex items-start gap-3 mb-5 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-brand-gold cursor-pointer shrink-0"
              />
              <span className="text-brand-muted text-sm group-hover:text-brand-light transition-colors">
                I have read and agree to the booking policies above.
              </span>
            </label>

            {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}

            <button
              onClick={confirmBooking}
              disabled={loading || !agreedToPolicy}
              className="w-full py-3.5 bg-brand-gold text-brand-black font-semibold text-sm tracking-widest uppercase hover:bg-brand-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>

            <button onClick={() => { setStep("info"); setAgreedToPolicy(false); }} className="mt-4 text-brand-muted text-sm hover:text-brand-gold transition-colors">
              &larr; Back
            </button>
          </motion.div>
        )}

        {step === "confirmed" && (
          <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-gold/10 flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="font-display text-3xl font-bold text-brand-white mb-3">You&apos;re Booked</h2>
            <p className="text-brand-muted mb-2">
              {service} on {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {formatTime(time)}
            </p>
            <p className="text-brand-muted/60 text-sm">See you at IkeBlendz. Payment due in person.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
