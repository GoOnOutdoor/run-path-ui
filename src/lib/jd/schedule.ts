import { addDays, formatISO, parseISO } from "date-fns";
import { JDZones, JDWorkoutType, JDSession, WeekdayPT, WEEKDAY_PT_TO_EN } from "./types";

type DayIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Monday-based index used here

const PT_DAY_TO_IDX: Record<WeekdayPT, DayIdx> = {
  "Seg": 0, "Segunda": 0, "Segunda-feira": 0,
  "Ter": 1, "Terça": 1, "Terça-feira": 1,
  "Qua": 2, "Quarta": 2, "Quarta-feira": 2,
  "Qui": 3, "Quinta": 3, "Quinta-feira": 3,
  "Sex": 4, "Sexta": 4, "Sexta-feira": 4,
  "Sáb": 5, "Sab": 5, "Sábado": 5,
  "Dom": 6, "Domingo": 6,
};

function isoDate(d: Date): string { return formatISO(d, { representation: "date" }); }

function chooseLongRunDay(available: WeekdayPT[]): DayIdx {
  // prefer Domingo, depois Sábado, senão o ultimo disponível
  const hasDom = available.find((d) => PT_DAY_TO_IDX[d] === 6);
  if (hasDom) return 6;
  const hasSab = available.find((d) => PT_DAY_TO_IDX[d] === 5);
  if (hasSab) return 5;
  const sorted = [...available].map((d) => PT_DAY_TO_IDX[d]).sort((a, b) => a - b);
  return (sorted[sorted.length - 1] ?? 6) as DayIdx;
}

function distributeDays(available: WeekdayPT[], count: number): DayIdx[] {
  // pick up to count days preserving order in the week
  const idxs = available.map((d) => PT_DAY_TO_IDX[d]).sort((a, b) => a - b);
  const chosen: DayIdx[] = [];
  for (const i of idxs) {
    if (!chosen.includes(i as DayIdx)) chosen.push(i as DayIdx);
    if (chosen.length >= count) break;
  }
  return chosen;
}

function ensureSpacing(days: DayIdx[], minGap: number): DayIdx[] {
  // simple heuristic: if two chosen days are too close (< minGap), push the latter forward where possible
  const out: DayIdx[] = [];
  for (const d of days) {
    if (out.length === 0) { out.push(d); continue; }
    const prev = out[out.length - 1];
    if (d - prev < minGap) {
      const adjusted = Math.min(prev + minGap, 6);
      if (!out.includes(adjusted as DayIdx)) out.push(adjusted as DayIdx);
      else out.push(d);
    } else out.push(d);
  }
  return out;
}

function paceStringToMinutes(str: string): number {
  const [m, s] = str.split(":").map((n) => parseInt(n, 10));
  return m + (s || 0) / 60;
}

function minutesForDistanceKm(distanceKm: number, paceMinPerKm: number) {
  return Math.round(distanceKm * paceMinPerKm);
}

function midPace(p: { min: string; max: string }): number {
  return (paceStringToMinutes(p.min) + paceStringToMinutes(p.max)) / 2;
}

function distanceFromMinutes(minutes: number, zone: { min: string; max: string }): number {
  const pace = midPace(zone);
  return parseFloat((minutes / pace).toFixed(1));
}

export interface BuildWeekArgs {
  weekNumber: number;
  weekStartISO: string;
  targetMinutes: number;
  zones: JDZones; // A1..A6 pace ranges
  availableDays: WeekdayPT[];
  weeklyFrequency: number;
  distanceTargetKm: number; // 15–50
  phase: "base" | "build" | "specific" | "polish" | "taper" | "race" | "regen";
  focus?: "speed" | "endurance" | "balanced";
}

export function buildWeekSessions(args: BuildWeekArgs): JDSession[] {
  const { weekNumber, weekStartISO, targetMinutes, zones, availableDays, weeklyFrequency, distanceTargetKm, phase, focus = "balanced" } = args;
  const weekStart = parseISO(weekStartISO);
  const sessions: JDSession[] = [];

  const chosenDays = distributeDays(availableDays, weeklyFrequency);
  const longDay = chooseLongRunDay(availableDays);

  // Long run: peak distance target based on goal distance
  const longPeakKm = distanceTargetKm <= 30 ? Math.round(distanceTargetKm * 0.85) : Math.round(distanceTargetKm * 0.8);
  // Progression heuristic for long run
  const longKm = Math.max(10, Math.min(longPeakKm, Math.round(8 + (weekNumber - 1) * 1.2)));
  const a2MidPace = midPace(zones.A2);
  const longMin = minutesForDistanceKm(longKm, a2MidPace);

  // Base distribution of minutes
  const remaining = Math.max(0, targetMinutes - longMin);
  const baseEasyShare = focus === "endurance" ? 0.7 : focus === "speed" ? 0.5 : 0.6;
  const baseEasyMin = Math.round(remaining * baseEasyShare);
  const qualityMin = remaining - baseEasyMin; // split into A3/A4/A5 depending on phase

  // Decide key session type
  let keyType: JDWorkoutType = phase === "base" ? "Fartlek" : (phase === "polish" || phase === "taper") ? "Tempo Run" : "Limiar";
  if (focus === "speed" && (phase === "build" || phase === "specific")) keyType = "Intervalado";

  // Place sessions respecting ≥48h between intense (key + long if with A3/A4 blocks)
  const dayPlan: { idx: DayIdx; type: JDWorkoutType; minutes: number }[] = [];
  const sorted = ensureSpacing(chosenDays, 1);

  // Place long run on longDay if in chosenDays; otherwise last chosen
  const longIdx = sorted.includes(longDay) ? longDay : sorted[sorted.length - 1] ?? longDay;
  dayPlan.push({ idx: longIdx, type: "Long Run", minutes: longMin });

  // Key session ~40–60 min depending on qualityMin
  const keyMin = Math.max(35, Math.min(65, Math.round(Math.max(qualityMin * (focus === "speed" ? 0.7 : 0.6), 40))));
  // Find a day 2–3 days before long run
  const keyIdx = ((): DayIdx => {
    const candidates = sorted.filter((d) => longIdx - d >= 2);
    return (candidates[0] ?? sorted[0] ?? 2) as DayIdx;
  })();
  dayPlan.push({ idx: keyIdx, type: keyType, minutes: keyMin });

  // Remaining easy runs
  const used = new Set(dayPlan.map((d) => d.idx));
  const remainingDays = sorted.filter((d) => !used.has(d));
  const easyCount = Math.max(0, weeklyFrequency - dayPlan.length);
  const perEasy = easyCount > 0 ? Math.round((targetMinutes - keyMin - longMin) / easyCount) : 0;
  for (let i = 0; i < Math.min(easyCount, remainingDays.length); i++) {
    dayPlan.push({ idx: remainingDays[i] as DayIdx, type: "Corrida Leve", minutes: Math.max(35, Math.min(70, perEasy)) });
  }

  // Build JDSession objects with descriptions
  for (const dp of dayPlan) {
    const date = isoDate(addDays(weekStart, dp.idx));
    let description = "";
    let rpe = 3;
    let distanceKm: number | null = null;

    if (dp.type === "Long Run") {
      // Optionally include A3 finish for specific phases
      if (phase === "specific" || phase === "polish") {
        const a3Part = Math.round(longMin * 0.25);
        const a2Part = longMin - a3Part;
        description = `Longão: ${a2Part} min em A2 (${zones.A2.min}–${zones.A2.max} min/km) + ${a3Part} min em A3 (${zones.A3.min}–${zones.A3.max} min/km)`;
        rpe = 5;
        const distA2 = distanceFromMinutes(a2Part, zones.A2);
        const distA3 = distanceFromMinutes(a3Part, zones.A3);
        distanceKm = parseFloat((distA2 + distA3).toFixed(1));
      } else {
        description = `Longão ${longKm} km em A2 (${zones.A2.min}–${zones.A2.max} min/km).`;
        rpe = 4;
        distanceKm = longKm;
      }
    } else if (dp.type === "Limiar" || dp.type === "Tempo Run") {
      // Warm-up + Threshold block + cool-down
      const wu = Math.min(15, Math.round(dp.minutes * 0.25));
      const main = Math.max(15, Math.round(dp.minutes * 0.5));
      const cd = Math.max(10, dp.minutes - wu - main);
      description = `Aquecimento: ${wu} min em A2 (${zones.A2.min}–${zones.A2.max})\nBloco: ${main} min em A4 (${zones.A4.min}–${zones.A4.max})\nDesaquecimento: ${cd} min em A2 (${zones.A2.min}–${zones.A2.max})`;
      rpe = 7;
      const distWu = distanceFromMinutes(wu, zones.A2);
      const distMain = distanceFromMinutes(main, zones.A4);
      const distCd = distanceFromMinutes(cd, zones.A2);
      distanceKm = parseFloat((distWu + distMain + distCd).toFixed(1));
    } else if (dp.type === "Fartlek") {
      const wu = 12; const cd = 10; const reps = 6; const on = 2; const off = 2;
      description = `Aquecimento: ${wu} min em A2 (${zones.A2.min}–${zones.A2.max})\nRepetir ${reps}x: ${on} min em A4 (${zones.A4.min}–${zones.A4.max}) / ${off} min em A1–A2\nDesaquecimento: ${cd} min em A2`;
      rpe = 6;
      const distWu = distanceFromMinutes(wu, zones.A2);
      const distMain = distanceFromMinutes(reps * on, zones.A4);
      const distRec = distanceFromMinutes(reps * off, zones.A2);
      const distCd = distanceFromMinutes(cd, zones.A2);
      distanceKm = parseFloat((distWu + distMain + distRec + distCd).toFixed(1));
    } else if (dp.type === "Corrida Leve") {
      description = `Corrida leve ${dp.minutes} min em A2 (${zones.A2.min}–${zones.A2.max}).`;
      rpe = 3;
      distanceKm = parseFloat((distanceFromMinutes(dp.minutes, zones.A2)).toFixed(1));
    } else if (dp.type === "Intervalado") {
      const wu = 15; const cd = 10; const reps = 5; const onMin = 3; const offMin = 2;
      description = `Aquecimento: ${wu} min em A2\nRepetir ${reps}x: ${onMin} min em A5 (${zones.A5.min}–${zones.A5.max}) / ${offMin} min em A1–A2\nDesaquecimento: ${cd} min em A2`;
      rpe = 8;
      const distWu = distanceFromMinutes(wu, zones.A2);
      const distMain = distanceFromMinutes(reps * onMin, zones.A5);
      const distRec = distanceFromMinutes(reps * offMin, zones.A2);
      const distCd = distanceFromMinutes(cd, zones.A2);
      distanceKm = parseFloat((distWu + distMain + distRec + distCd).toFixed(1));
    } else if (dp.type === "Contínuo" || dp.type === "Progressivo") {
      description = `${dp.type} ${dp.minutes} min variando entre A2 e A3 (${zones.A2.min}–${zones.A2.max} / ${zones.A3.min}–${zones.A3.max}).`;
      rpe = 5;
      const distA2 = distanceFromMinutes(dp.minutes * 0.6, zones.A2);
      const distA3 = distanceFromMinutes(dp.minutes * 0.4, zones.A3);
      distanceKm = parseFloat((distA2 + distA3).toFixed(1));
    } else if (dp.type === "Race Day") {
      description = `Prova alvo. Estratégia: aquecer leve, manter A3 no início e utilizar A4 nos estágios finais conforme tolerância.`;
      rpe = 9;
      distanceKm = distanceTargetKm;
    } else {
      description = `${dp.type} ${dp.minutes} min.`;
      rpe = 5;
    }

    sessions.push({
      weekNumber,
      date,
      workoutType: dp.type,
      description,
      durationMinutes: dp.minutes,
      distanceKm,
      rpe,
      notes: "Manter técnica, hidratação e recuperação. ≥48h entre intensidades."
    });
  }

  return sessions.sort((a, b) => (a.date < b.date ? -1 : 1));
}
