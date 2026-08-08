import type { BusinessHours, BlockedDate, BlockedTimeRange, Appointment, TimeSlot } from "@/types";
import { SLOT_INTERVAL_MINUTES } from "./constants";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function generateTimeSlots(
  date: string,
  durationMinutes: number,
  businessHours: BusinessHours[],
  blockedDates: BlockedDate[],
  blockedRanges: BlockedTimeRange[],
  existingAppointments: Appointment[]
): TimeSlot[] {
  const d = new Date(date + "T00:00:00");
  const dayOfWeek = d.getDay();

  const hours = businessHours.find((h) => h.day_of_week === dayOfWeek);
  if (!hours || hours.is_closed) return [];

  const fullDayBlocked = blockedDates.some((b) => b.date === date && b.full_day);
  if (fullDayBlocked) return [];

  const openMin = timeToMinutes(hours.open_time);
  const closeMin = timeToMinutes(hours.close_time);

  const dayBlockedRanges = blockedRanges
    .filter((r) => r.date === date)
    .map((r) => ({ start: timeToMinutes(r.start_time), end: timeToMinutes(r.end_time) }));

  const dayAppointments = existingAppointments
    .filter((a) => a.date === date && (a.status === "pending" || a.status === "confirmed"))
    .map((a) => ({ start: timeToMinutes(a.start_time), end: timeToMinutes(a.end_time) }));

  const slots: TimeSlot[] = [];

  for (let start = openMin; start + durationMinutes <= closeMin; start += SLOT_INTERVAL_MINUTES) {
    const end = start + durationMinutes;

    const blockedByRange = dayBlockedRanges.some((r) => start < r.end && end > r.start);
    const blockedByAppt = dayAppointments.some((a) => start < a.end && end > a.start);

    slots.push({
      start: minutesToTime(start),
      end: minutesToTime(end),
      available: !blockedByRange && !blockedByAppt,
    });
  }

  return slots;
}

export function isDateAvailable(
  date: string,
  durationMinutes: number,
  businessHours: BusinessHours[],
  blockedDates: BlockedDate[],
  blockedRanges: BlockedTimeRange[],
  existingAppointments: Appointment[]
): boolean {
  const slots = generateTimeSlots(date, durationMinutes, businessHours, blockedDates, blockedRanges, existingAppointments);
  return slots.some((s) => s.available);
}
