import { addDays, differenceInCalendarWeeks, formatISO, parseISO } from "date-fns";
import { AthleteInput, JDPlan, JDSession } from "./types";
import { bestVDOTFromText } from "./vdot";
import { trainingPacesFromVDOT } from "./paces";
import { buildPeriodization } from "./periodization";
import { buildWeekSessions } from "./schedule";

const paceToMinutes = (pace: string) => {
  const [minStr, secStr] = pace.split(":");
  const minutes = parseInt(minStr, 10);
  const seconds = secStr ? parseInt(secStr, 10) : 0;
  return minutes + seconds / 60;
};

function isoDate(d: Date): string { return formatISO(d, { representation: "date" }); }

export function generateJDPlan(input: AthleteInput): JDPlan {
  const {
    athleteId, athleteName, startDate, eventDate, planDurationWeeks,
    distanceKm, weeklyFrequency, availableDays, timeEstimates, specialObservations, experience
  } = input;

  // 1) Determine VDOT and zones
  const { vdot, samples } = bestVDOTFromText(timeEstimates);
  if (!vdot) {
    // If no valid test found, return a safe base plan with A2 focus and note requesting test
    const baseMinutes = 240; // 4h per week as placeholder
    const period = buildPeriodization({ startDate, eventDate, weeks: planDurationWeeks, baseWeeklyMinutes: baseMinutes });
    const sessions: JDSession[] = [];
    for (const w of period) {
      const weekStart = parseISO(w.startDate);
      const day0 = isoDate(addDays(weekStart, 1));
      const day3 = isoDate(addDays(weekStart, 4));
      const day6 = isoDate(addDays(weekStart, 6));
      sessions.push(
        { weekNumber: w.index, date: day0, workoutType: "Corrida Leve", description: `Corrida leve 40–50 min (A2).`, durationMinutes: 45, distanceKm: null, rpe: 3, notes: "Sem teste recente. Recomendado realizar 5k/10k para cálculo de paces." },
        { weekNumber: w.index, date: day3, workoutType: "Fartlek", description: `Fartlek leve: 6x(2' forte / 2' leve).`, durationMinutes: 45, distanceKm: null, rpe: 6, notes: "Sem paces específicos até obter teste." },
        { weekNumber: w.index, date: day6, workoutType: "Long Run", description: `Longão conversacional 60–90 min.`, durationMinutes: Math.min(90, Math.round(60 + (w.index - 1) * 5)), distanceKm: null, rpe: 4, notes: "Aumentar gradualmente sem exceder 10%/semana." },
      );
    }
    return {
      zones: { A1: { paceMinPerKm: "", paceMaxPerKm: "" }, A2: { paceMinPerKm: "", paceMaxPerKm: "" }, A3: { paceMinPerKm: "", paceMaxPerKm: "" }, A4: { paceMinPerKm: "", paceMaxPerKm: "" }, A5: { paceMinPerKm: "", paceMaxPerKm: "" }, A6: { paceMinPerKm: "", paceMaxPerKm: "" } },
      sessions,
      notesAndAssumptions: [
        "Sem teste válido detectado. Solicitar 5k/10k para calcular VDOT e paces A1–A6.",
        "Microciclo 3:1 aplicado com semanas estabilizadoras.",
      ],
    };
  }

  const zones = trainingPacesFromVDOT(vdot);

  // 2) Build periodization with 3:1 and last-4 adjustments
  // Estimate base weekly minutes from weekly frequency and target distance
  const baseMinutes = Math.max(180, Math.min(600, Math.round(weeklyFrequency * 60 + distanceKm * 2)));
  const period = buildPeriodization({ startDate, eventDate, weeks: planDurationWeeks, baseWeeklyMinutes: baseMinutes });

  const sessions: JDSession[] = [];

  // Determine focus based on multiple tests (long vs short VDOT)
  const parseKm = (label: string) => {
    const m = label.match(/([0-9]+(?:\.[0-9]+)?)k/i);
    return m ? parseFloat(m[1]) : NaN;
  };
  const vShort = samples.filter(s => parseKm(s.label || "") <= 10).map(s => s.vdot);
  const vLong = samples.filter(s => parseKm(s.label || "") >= 21).map(s => s.vdot);
  const bestShort = vShort.length ? Math.max(...vShort) : NaN;
  const bestLong = vLong.length ? Math.max(...vLong) : NaN;
  let focus: "speed" | "endurance" | "balanced" = "balanced";
  if (!Number.isNaN(bestShort) && !Number.isNaN(bestLong)) {
    if (bestLong > bestShort + 0.5) focus = "speed"; // endurance strong → train speed
    else if (bestShort > bestLong + 0.5) focus = "endurance"; // speed strong → build endurance
  }
  for (const w of period) {
    const weekSessions = buildWeekSessions({
      weekNumber: w.index,
      weekStartISO: w.startDate,
      targetMinutes: Math.round(w.targetLoad),
      zones: {
        A1: { paceMinPerKm: zones.A1.min, paceMaxPerKm: zones.A1.max },
        A2: { paceMinPerKm: zones.A2.min, paceMaxPerKm: zones.A2.max },
        A3: { paceMinPerKm: zones.A3.min, paceMaxPerKm: zones.A3.max },
        A4: { paceMinPerKm: zones.A4.min, paceMaxPerKm: zones.A4.max },
        A5: { paceMinPerKm: zones.A5.min, paceMaxPerKm: zones.A5.max },
        A6: { paceMinPerKm: zones.A6.min, paceMaxPerKm: zones.A6.max },
      },
      availableDays,
      weeklyFrequency,
      distanceTargetKm: distanceKm,
      phase: w.phase,
      focus,
    });
    sessions.push(...weekSessions);
  }

  // Race day if event date within period
  if (eventDate) {
    const start = parseISO(startDate);
    const raceWeek = differenceInCalendarWeeks(parseISO(eventDate), start) + 1;
    const avgA3 = (paceToMinutes(zones.A3.max) + paceToMinutes(zones.A3.min)) / 2;
    sessions.push({
      weekNumber: raceWeek,
      date: eventDate,
      workoutType: "Race Day",
      description: `Prova alvo ${distanceKm} km. A3 na maior parte; toques de A4 no final.`,
      durationMinutes: Math.round(distanceKm * avgA3),
      distanceKm: distanceKm,
      rpe: 9,
      notes: "Planeje logística, hidratação e estratégia. Semana com polimento e volume reduzido.",
    });
  }

  const noteVDOTs = samples.map(s => `${s.label || ""}: VDOT≈${s.vdot.toFixed(1)}`).join("; ");

  const notesAndAssumptions: string[] = [
    `Fonte do VDOT: ${noteVDOTs}`,
    "Estrutura de microciclos aplicada: 3 ordinárias + 1 estabilizadora; sequência final: choque → estabilizadora → polimento → competitivo; pós-prova: regenerativa.",
    "Regras de corte de volume: 5–15% nas estabilizadoras; redução adicional em polimento/competitivo.",
  ];

  if (specialObservations) notesAndAssumptions.push(`Observações do atleta: ${specialObservations}`);
  if (typeof experience === "string") notesAndAssumptions.push(`Nível informado: ${experience}`);

  return { zones: {
      A1: { paceMinPerKm: zones.A1.min, paceMaxPerKm: zones.A1.max },
      A2: { paceMinPerKm: zones.A2.min, paceMaxPerKm: zones.A2.max },
      A3: { paceMinPerKm: zones.A3.min, paceMaxPerKm: zones.A3.max },
      A4: { paceMinPerKm: zones.A4.min, paceMaxPerKm: zones.A4.max },
      A5: { paceMinPerKm: zones.A5.min, paceMaxPerKm: zones.A5.max },
      A6: { paceMinPerKm: zones.A6.min, paceMaxPerKm: zones.A6.max },
    },
    sessions,
    notesAndAssumptions,
  };
}
