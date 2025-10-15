import { percentVO2AtTime, predictTimeForDistance, velocityFromVo2 } from "./vdot";

export type PaceRange = { min: string; max: string };

function toMinPerKm(v_m_per_min: number): number {
  // pace (min/km) = 1000 / (m/min)
  return 1000 / Math.max(v_m_per_min, 1e-6);
}

function fmtPace(minPerKm: number): string {
  const totalSeconds = Math.round(minPerKm * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function rangeFromSpeeds(vMin: number, vMax: number): PaceRange {
  const pMin = fmtPace(toMinPerKm(vMax)); // faster = higher speed => lower pace
  const pMax = fmtPace(toMinPerKm(vMin));
  return { min: pMin, max: pMax };
}

export function vvo2FromVDOT(vdot: number): number {
  // vVO2 is the velocity where VO2 equals VDOT
  return velocityFromVo2(vdot);
}

export function trainingPacesFromVDOT(vdot: number) {
  const vVO2 = vvo2FromVDOT(vdot);

  // A2 (Easy = Daniels E): 59–74% vVO2 (typical range)
  const A2_vMin = vVO2 * 0.59;
  const A2_vMax = vVO2 * 0.74;

  // A1: anything below A2; we present a conservative range slightly slower than A2
  const A1_vMin = vVO2 * 0.50;
  const A1_vMax = vVO2 * 0.58;

  // A4 (Threshold = ~60-min race pace)
  const vT = ((): number => {
    const t = 60; // minutes
    const frac = percentVO2AtTime(t);
    const vo2 = vdot * frac;
    return velocityFromVo2(vo2);
  })();

  // Provide a small range around threshold (± ~2%)
  const A4_vMin = vT * 0.98;
  const A4_vMax = vT * 1.02;

  // A5 (Interval = ~vVO2)
  const A5_vMin = vVO2 * 0.98;
  const A5_vMax = vVO2 * 1.02;

  // A6 (Repetition = faster than I, ~1500m race pace). Approx by ~ 5–6 min race pace
  const vR = ((): number => {
    const t = 5.5; // minutes, mid of 5–6
    const frac = percentVO2AtTime(t);
    const vo2 = vdot * frac;
    return velocityFromVo2(vo2);
  })();
  const A6_vMin = vR * 0.985;
  const A6_vMax = vR * 1.015;

  // A3 (Marathon = predicted marathon pace)
  const tMarathonSec = predictTimeForDistance(vdot, 42195);
  const tMarathonMin = tMarathonSec / 60;
  const fracM = percentVO2AtTime(tMarathonMin);
  const vM = velocityFromVo2(vdot * fracM);
  const A3_vMin = vM * 0.995; // narrow band
  const A3_vMax = vM * 1.005;

  return {
    A1: rangeFromSpeeds(A1_vMin, A1_vMax),
    A2: rangeFromSpeeds(A2_vMin, A2_vMax),
    A3: rangeFromSpeeds(A3_vMin, A3_vMax),
    A4: rangeFromSpeeds(A4_vMin, A4_vMax),
    A5: rangeFromSpeeds(A5_vMin, A5_vMax),
    A6: rangeFromSpeeds(A6_vMin, A6_vMax),
  };
}

