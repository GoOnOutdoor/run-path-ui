// VDOT computation utilities based on Daniels' published formulas
// References (widely cited):
// VO2 (ml/kg/min) = -4.60 + 0.182258 * v + 0.000104 * v^2, where v is velocity (m/min)
// %VO2max at race duration t (min) ≈ 0.8 + 0.1894393*e^(-0.012778*t) + 0.2989558*e^(-0.1932605*t)

export type RaceSample = {
  distanceMeters: number;
  timeSeconds: number;
  label?: string;
};

export function timeStringToSeconds(s: string): number | null {
  // Supports formats like "45:00", "1:40:30", "4h05", "1h40m30s", "90min", "3600s"
  const trimmed = s.trim().toLowerCase();
  // hh:mm:ss or mm:ss
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const parts = trimmed.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }
  // 1h40, 1h40m, 1h40m30s, 45m, 45min
  const h = /([0-9]+)\s*h/.exec(trimmed)?.[1];
  const m = /([0-9]+)\s*m/.exec(trimmed)?.[1] ?? /([0-9]+)\s*min/.exec(trimmed)?.[1];
  const sec = /([0-9]+)\s*s/.exec(trimmed)?.[1];
  if (h || m || sec) {
    const hh = h ? parseInt(h, 10) : 0;
    const mm = m ? parseInt(m, 10) : 0;
    const ss = sec ? parseInt(sec, 10) : 0;
    return hh * 3600 + mm * 60 + ss;
  }
  // plain minutes e.g., "90"
  if (/^\d+$/.test(trimmed)) {
    const val = parseInt(trimmed, 10);
    // assume minutes if >= 10, else seconds
    return val >= 10 ? val * 60 : val;
  }
  return null;
}

export function parseDistanceKmToken(token: string): number | null {
  // matches: 5k, 5 km, 10km, 21.1k, 42k, 42.195km
  const m = token.toLowerCase().match(/([0-9]+(?:\.[0-9]+)?)\s*(k|km)/);
  if (m) return parseFloat(m[1]);
  return null;
}

export function extractRaceSamples(text?: string): RaceSample[] {
  if (!text) return [];
  // heuristic: look for patterns "<dist>k[m]?" followed by a time-ish token in the next ~5 words
  const tokens = text.split(/\s+/);
  const samples: RaceSample[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const distKm = parseDistanceKmToken(tokens[i]);
    if (distKm) {
      // look ahead for a time token within next 5 tokens
      const window = tokens.slice(i + 1, i + 6).join(" ");
      const timeCandidates = window.match(/(\d{1,2}:\d{2}(?::\d{2})?|\d+\s*h(?:\s*\d+\s*m(?:\s*\d+\s*s)?)?|\d+\s*m(?:in)?|\d+\s*s)/i);
      if (timeCandidates && timeCandidates[0]) {
        const secs = timeStringToSeconds(timeCandidates[0]);
        if (secs) {
          samples.push({ distanceMeters: distKm * 1000, timeSeconds: secs, label: `${distKm}k` });
        }
      }
    }
  }
  return samples;
}

export function vo2FromVelocity(v_m_per_min: number): number {
  return -4.6 + 0.182258 * v_m_per_min + 0.000104 * v_m_per_min * v_m_per_min;
}

export function velocityFromVo2(vo2: number): number {
  // invert: 0.000104 v^2 + 0.182258 v - (vo2 + 4.6) = 0
  const a = 0.000104;
  const b = 0.182258;
  const c = -(vo2 + 4.6);
  const disc = b * b - 4 * a * c;
  const v = (-b + Math.sqrt(Math.max(disc, 0))) / (2 * a);
  return v; // m/min
}

export function percentVO2AtTime(tMinutes: number): number {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * tMinutes) + 0.2989558 * Math.exp(-0.1932605 * tMinutes);
}

export function computeVDOT(distanceMeters: number, timeSeconds: number): number {
  const tMin = timeSeconds / 60;
  const v = distanceMeters / timeSeconds * 60; // m/min
  const vo2 = vo2FromVelocity(v);
  const frac = percentVO2AtTime(tMin);
  const vdot = vo2 / frac;
  return vdot;
}

export function predictVelocityAtTime(vdot: number, tMinutes: number): number {
  const frac = percentVO2AtTime(tMinutes);
  const vo2 = vdot * frac;
  return velocityFromVo2(vo2); // m/min
}

export function predictTimeForDistance(vdot: number, distanceMeters: number): number {
  // find t (seconds) such that velocity(vdot, t) * t = distance
  // Use simple binary search on t in [3 min, 6 hours]
  let lo = 3; // minutes
  let hi = 360; // minutes
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const v = predictVelocityAtTime(vdot, mid); // m/min
    const d = v * mid; // meters
    if (d > distanceMeters) hi = mid; else lo = mid;
  }
  return ((lo + hi) / 2) * 60; // seconds
}

export function bestVDOTFromText(timeEstimates?: string): { vdot: number | null; samples: Array<{ label: string; vdot: number }> } {
  const samples = extractRaceSamples(timeEstimates);
  if (samples.length === 0) return { vdot: null, samples: [] };
  const vdots = samples.map((s) => ({ label: s.label || "", vdot: computeVDOT(s.distanceMeters, s.timeSeconds) }));
  vdots.sort((a, b) => b.vdot - a.vdot);
  return { vdot: vdots[0].vdot, samples: vdots };
}

