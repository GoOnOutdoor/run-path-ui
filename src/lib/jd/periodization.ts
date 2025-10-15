import { addDays, differenceInCalendarWeeks, formatISO, parseISO } from "date-fns";

export type Phase = "base" | "build" | "specific" | "polish" | "taper" | "race" | "regen";

export interface PeriodWeek {
  index: number; // 1-based
  startDate: string; // YYYY-MM-DD
  targetLoad: number; // abstract units (e.g., minutes)
  phase: Phase;
  tag?: "shock" | "stabilizer" | "polish" | "competitive";
}

export interface PeriodizationArgs {
  startDate: string; // YYYY-MM-DD
  eventDate?: string; // YYYY-MM-DD
  weeks?: number; // if no eventDate
  baseWeeklyMinutes: number; // starting weekly minutes approx
}

function isoDate(d: Date): string {
  return formatISO(d, { representation: "date" });
}

export function buildPeriodization({ startDate, eventDate, weeks, baseWeeklyMinutes }: PeriodizationArgs): PeriodWeek[] {
  const start = parseISO(startDate);
  let totalWeeks: number;
  if (eventDate) {
    const event = parseISO(eventDate);
    totalWeeks = Math.max(1, differenceInCalendarWeeks(event, start) + 1);
  } else {
    totalWeeks = Math.max(1, weeks ?? 12);
  }

  // 3:1 structure: 3 progressive + 1 cutback; last 4 weeks: shock, stabilizer, polish, competitive.
  const out: PeriodWeek[] = [];
  const peakFactor = 1.0; // multiplier at peak before taper
  const cutbackDrop = 0.10; // 10% cutback target

  for (let i = 1; i <= totalWeeks; i++) {
    const wStart = addDays(start, (i - 1) * 7);
    let phase: Phase = "build";
    let tag: PeriodWeek["tag"] | undefined;
    let targetLoad = baseWeeklyMinutes * (1 + (i - 1) * 0.05); // ≈5% ramp by default

    // Cutback every 4th week
    if (i % 4 === 0) {
      targetLoad = targetLoad * (1 - cutbackDrop);
      tag = "stabilizer";
    }

    // Final four weeks logic if eventDate present
    if (eventDate && totalWeeks >= 4) {
      const fromEnd = totalWeeks - i;
      if (fromEnd === 3) { tag = "shock"; targetLoad = targetLoad * 1.05; }
      if (fromEnd === 2) { tag = "stabilizer"; targetLoad = targetLoad * (1 - cutbackDrop); }
      if (fromEnd === 1) { phase = "taper"; tag = "polish"; targetLoad = targetLoad * 0.7; }
      if (fromEnd === 0) { phase = "race"; tag = "competitive"; targetLoad = Math.max(baseWeeklyMinutes * 0.4, 120); }
    }

    out.push({ index: i, startDate: isoDate(wStart), targetLoad, phase, tag });
  }

  // After race week, add a regenerativa week if eventDate
  if (eventDate) {
    const last = out[out.length - 1];
    const nextStart = addDays(parseISO(last.startDate), 7);
    out.push({ index: out.length + 1, startDate: isoDate(nextStart), targetLoad: Math.max(baseWeeklyMinutes * 0.3, 90), phase: "regen" });
  }

  return out;
}

