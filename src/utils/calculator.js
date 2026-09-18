// src/utils/calculator.js
//
// RULES IMPLEMENTED (all four hold exactly, on every date):

export const FACTORS = [
  { key: "genetic", name: "Genetic Inheritance", min: 9.333, max: 10.777 },
  { key: "constitutional", name: "Constitutional Vitality", min: 8.111, max: 9.111 },
  { key: "mental", name: "Mental Patterns", min: 6.111, max: 7.111 },
  { key: "intellectual", name: "Intellectual Capacity", min: 6.333, max: 6.999 },
  { key: "emotional", name: "Emotional Foundation", min: 7.111, max: 7.999 },
  { key: "spiritual", name: "Spiritual Lineage", min: 5.011, max: 6.011 },
  { key: "soul", name: "Soul Connections", min: 5.111, max: 6.222 },
];

export const GRAND_TOTAL = 100;

// --- Seeded PRNG (mulberry32) ---------------------------------------------
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromDate(dob) {
  return dob.getFullYear() * 10000 + (dob.getMonth() + 1) * 100 + dob.getDate();
}

// Work in integer thousandths wherever exactness matters, so the grand total
// is exactly 100.000 and never 99.998 / 100.002 from float drift.
const round3 = (n) => Math.round(n * 1000) / 1000;
const toMil = (n) => Math.round(n * 1000); // 3dp value -> integer thousandths
const fromMil = (n) => n / 1000;

// --- Validation -------------------------------------------------------------
export function validateDob(dobString) {
  if (!dobString) return "Please select a Date of Birth.";
  const dob = new Date(dobString + "T00:00:00");
  if (isNaN(dob.getTime())) return "That date is not valid.";
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dob.getTime() > today.getTime()) return "Date of Birth cannot be in the future.";
  const minYear = 1900;
  if (dob.getFullYear() < minYear) return `Please enter a year after ${minYear}.`;
  return null;
}

// --- Step 1: row totals ------------------------------------------------------

function distributeTotals(lows, highs, weights, target) {
  const out = lows.slice();
  let remaining = target - lows.reduce((a, b) => a + b, 0);
  let free = lows.map((_, i) => i);

  for (let pass = 0; pass < 40 && remaining > 1e-9 && free.length; pass++) {
    const weighted = free.reduce((a, i) => a + weights[i] * (highs[i] - out[i]), 0);
    if (weighted <= 1e-12) break;
    const scale = remaining / weighted;
    const stillFree = [];
    let used = 0;
    for (const i of free) {
      const room = highs[i] - out[i];
      let add = scale * weights[i] * room;
      if (add >= room) add = room; // row is now full
      else stillFree.push(i);
      out[i] += add;
      used += add;
    }
    remaining -= used;
    free = stillFree;
  }
  return out;
}

// --- Step 2: split a row total into dominant / secondary ---------------------

function splitRange(t, min, max) {
  const lo = Math.max(min, t - max, t / 2);
  const hi = Math.min(max, t - min);
  return { lo, hi: Math.max(lo, hi) };
}

// --- Step 3: absorb rounding drift ------------------------------------------

function absorbDrift(rows, driftMil) {
  let steps = driftMil;
  let guard = 0;
  while (steps !== 0 && guard++ < 5000) {
    const dir = steps > 0 ? 1 : -1;
    let moved = false;

    for (const r of rows) {
      // Prefer moving the dominant value; fall back to the secondary one.
      for (const slot of ["dom", "sec"]) {
        const next = r[slot] + dir;
        if (next < r.minMil || next > r.maxMil) continue;
        const dom = slot === "dom" ? next : r.dom;
        const sec = slot === "sec" ? next : r.sec;
        if (dom <= sec) continue; // would break R4
        r[slot] = next;
        steps -= dir;
        moved = true;
        break;
      }
      if (moved || steps === 0) break;
    }
    if (!moved) break; // nothing left to give (not reachable with these bands)
  }
  return steps === 0;
}

// --- Main calculation --------------------------------------------------------
export function calculateLegacy(dobString) {
  const error = validateDob(dobString);
  if (error) throw new Error(error);

  const dob = new Date(dobString + "T00:00:00");
  const day = dob.getDate();
  const isOdd = day % 2 === 1;
  const rand = mulberry32(seedFromDate(dob));

  // 1) Row totals inside [2*min, 2*max], summing to exactly 100.
  const lows = FACTORS.map((f) => 2 * f.min);
  const highs = FACTORS.map((f) => 2 * f.max);
  const weights = FACTORS.map(() => 0.65 + rand() * 0.7); // seeded jitter
  const totals = distributeTotals(lows, highs, weights, GRAND_TOTAL);

  // 2) Split each total, dominant parent set by day parity.
  const rows = FACTORS.map((f, i) => {
    const t = totals[i];
    const { lo, hi } = splitRange(t, f.min, f.max);
    // Sit 30%-90% of the way up the legal window: a varied, non-robotic gap
    // that still never leaves the band.
    const dom = lo + (0.3 + rand() * 0.6) * (hi - lo);

    const minMil = toMil(f.min);
    const maxMil = toMil(f.max);
    let domMil = Math.min(maxMil, Math.max(minMil, toMil(dom)));
    let secMil = Math.min(maxMil, Math.max(minMil, toMil(t - dom)));
    // Rounding can tie the two; keep the dominant parent strictly ahead.
    if (domMil <= secMil) {
      if (domMil + 1 <= maxMil) domMil += 1;
      else if (secMil - 1 >= minMil) secMil -= 1;
    }
    return { ...f, minMil, maxMil, dom: domMil, sec: secMil };
  });

  // 3) Land the grand total on exactly 100.000.
  const sumMil = rows.reduce((a, r) => a + r.dom + r.sec, 0);
  absorbDrift(rows, toMil(GRAND_TOTAL) - sumMil);

  // 4) Map dominant/secondary onto Mother/Father.
  const results = rows.map((r) => {
    const motherMil = isOdd ? r.dom : r.sec;
    const fatherMil = isOdd ? r.sec : r.dom;
    const mother = fromMil(motherMil);
    const father = fromMil(fatherMil);
    return {
      key: r.key,
      name: r.name,
      min: r.min,
      max: r.max,
      mother,
      father,
      total: round3(mother + father),
      // Each value is already a share of 100, so the value IS its percentage.
      // Kept as aliases so older consumers of this module don't break.
      motherPct: mother,
      fatherPct: father,
      totalPct: round3(mother + father),
    };
  });

  const motherTotal = fromMil(results.reduce((a, r) => a + toMil(r.mother), 0));
  const fatherTotal = fromMil(results.reduce((a, r) => a + toMil(r.father), 0));
  const grandTotal = round3(motherTotal + fatherTotal);

  let winner = "Equal";
  if (motherTotal > fatherTotal) winner = "Mother";
  else if (fatherTotal > motherTotal) winner = "Father";

  return {
    dob: dobString,
    day,
    isOdd,
    results,
    motherTotal,
    fatherTotal,
    grandTotal,
    winner,
    // Legacy aliases (previous shape of this module).
    motherRaw: motherTotal,
    fatherRaw: fatherTotal,
    rawGrandTotal: grandTotal,
    motherPctSum: motherTotal,
    fatherPctSum: fatherTotal,
    grandPct: grandTotal,
  };
}

// --- Rule checker ------------------------------------------------------------
// Exported so the rules can be asserted in tests (or in the UI) rather than
// just trusted. Returns { ok, violations[] }.
export function verifyLegacy(data) {
  const violations = [];
  const dominant = data.isOdd ? "mother" : "father";
  const secondary = data.isOdd ? "father" : "mother";

  data.results.forEach((r) => {
    if (toMil(r.mother) < toMil(r.min) || toMil(r.mother) > toMil(r.max))
      violations.push(`${r.name}: Mother ${r.mother} outside ${r.min}-${r.max}`);
    if (toMil(r.father) < toMil(r.min) || toMil(r.father) > toMil(r.max))
      violations.push(`${r.name}: Father ${r.father} outside ${r.min}-${r.max}`);
    if (toMil(r.total) !== toMil(r.mother) + toMil(r.father))
      violations.push(`${r.name}: Total != Mother + Father`);
    if (toMil(r[dominant]) <= toMil(r[secondary]))
      violations.push(`${r.name}: ${dominant} should be higher on day ${data.day}`);
  });

  if (toMil(data.grandTotal) !== toMil(GRAND_TOTAL))
    violations.push(`Grand total is ${data.grandTotal}, expected 100.000`);
  if (data.winner !== (data.isOdd ? "Mother" : "Father"))
    violations.push(`Winner is ${data.winner}, expected ${data.isOdd ? "Mother" : "Father"}`);

  return { ok: violations.length === 0, violations };
}

// --- CSV export helper 
export function toCsv(data) {
  const header = "Factor,Min,Max,Mother,Father,Total\n";
  const rows = data.results
    .map((r) => `${r.name},${r.min},${r.max},${r.mother},${r.father},${r.total}`)
    .join("\n");
  const footer = `\nTOTAL,,,${data.motherTotal},${data.fatherTotal},${data.grandTotal}\n`;
  return header + rows + footer;
}
