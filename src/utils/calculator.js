// src/utils/calculator.js
//
//   1. Each life factor has a fixed min/max range for its TOTAL value.
//   2. Mother Value + Father Value = Total, for every factor.
//   3. Sum of all Mother values + Sum of all Father values = 100 (exact).
//   4. Odd day-of-month  -> Mother values are higher.
//      Even day-of-month -> Father values are higher.
//
// The generation is DETERMINISTIC: the same Date of Birth always produces
// the same numbers. That's done with a seeded PRNG (mulberry32) seeded from
// the DOB itself, instead of Math.random(), so results are reproducible and
// shareable/testable.

export const FACTORS = [
  { key: "genetic", name: "Genetic Inheritance", min: 9.333, max: 10.777 },
  { key: "constitutional", name: "Constitutional Vitality", min: 8.111, max: 9.111 },
  { key: "mental", name: "Mental Patterns", min: 6.111, max: 7.111 },
  { key: "intellectual", name: "Intellectual Capacity", min: 6.333, max: 6.999 },
  { key: "emotional", name: "Emotional Foundation", min: 7.111, max: 7.999 },
  { key: "spiritual", name: "Spiritual Lineage", min: 5.011, max: 6.011 },
  { key: "soul", name: "Soul Connections", min: 5.111, max: 6.222 },
];

// --- Seeded PRNG (mulberry32) -------------------------------------------
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
  const y = dob.getFullYear();
  const m = dob.getMonth() + 1;
  const d = dob.getDate();
  return y * 10000 + m * 100 + d;
}

const round3 = (n) => Math.round(n * 1000) / 1000;

// --- Validation -----------------------------------------------------------
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

// --- Main calculation -------------------------------------------------------
//
// IMPORTANT DESIGN NOTE — read this before changing the math:
//
// The brief states two rules that use the same words ("Mother value",
// "Father value", "Total") but cannot both be literally true of the same
// number:
//   Rule A: for each factor, Mother + Father = Total, and Total must sit
//           inside that factor's stated [min, max] band.
//   Rule B: summed across all 7 factors, Mother + Father = 100.
//
// The 7 given ranges only add up to somewhere between ~47.1 (all at min)
// and ~54.2 (all at max) — they can never reach 100 by construction. So a
// single set of numbers can't satisfy "stays in its band" AND "sums to 100"
// at the same time.
//
// This implementation keeps the two rules as two distinct, clearly-labeled
// outputs instead of silently stretching one to fake the other:
//   - `total` / `mother` / `father` on each row: the literal factor score,
//     always inside [min, max]. Rule A holds exactly on these numbers.
//   - `totalPct` / `motherPct` / `fatherPct`: each factor's Total expressed
//     as a normalized share of the 7-factor sum, so these percentages add
//     up to exactly 100 across all factors. Rule B holds exactly on these.
// Both are computed from the same underlying Mother/Father split, using one
// constant scale factor, so the "which parent leads" verdict is identical
// either way you look at it.
export function calculateLegacy(dobString) {
  const error = validateDob(dobString);
  if (error) throw new Error(error);

  const dob = new Date(dobString + "T00:00:00");
  const day = dob.getDate();
  const isOdd = day % 2 === 1;
  const rand = mulberry32(seedFromDate(dob));

  // 1) Per-factor Total, drawn strictly inside its own [min, max] band —
  //    never scaled, so it always respects the brief's range table.
  //    Split into Mother/Father by the day-parity rule: the "winning"
  //    parent gets a dominant share (54%-68%, varied per factor but
  //    deterministic) so the split isn't a flat ratio on every row.
  const results = FACTORS.map((f) => {
    const total = f.min + rand() * (f.max - f.min);
    const dominance = 0.54 + rand() * 0.14;
    let mother, father;
    if (isOdd) {
      mother = total * dominance;
      father = total - mother;
    } else {
      father = total * dominance;
      mother = total - father;
    }
    const roundedMother = round3(mother);
    const roundedFather = round3(father);
    return {
      ...f,
      mother: roundedMother,
      father: roundedFather,
      // Total re-derived from the rounded parts, so Mother + Father === Total
      // holds exactly at 3-decimal display precision (Rule A).
      total: round3(roundedMother + roundedFather),
    };
  });

  const rawGrandTotal = round3(results.reduce((a, r) => a + r.total, 0));

  // 2) Normalize each factor's Total into a percentage share of the 7-factor
  //    sum. Because it's one constant scale factor (100 / rawGrandTotal)
  //    applied to every row, the Mother/Father proportion within each factor
  //    is unchanged — only the units change, from "raw score" to "% of 100".
  const scale = rawGrandTotal > 0 ? 100 / rawGrandTotal : 0;
  results.forEach((r) => {
    r.motherPct = round3(r.mother * scale);
    r.fatherPct = round3(r.father * scale);
    r.totalPct = round3(r.motherPct + r.fatherPct);
  });

  // 3) Rounding each percentage to 3 decimals independently can leave a tiny
  //    drift (e.g. 99.998 or 100.002). Correct it by nudging the last
  //    factor's dominant-parent percentage so the grand percentage total
  //    lands on exactly 100.000 (Rule B, exact).
  const preMotherPct = results.reduce((a, r) => a + r.motherPct, 0);
  const preFatherPct = results.reduce((a, r) => a + r.fatherPct, 0);
  const drift = round3(100 - round3(preMotherPct + preFatherPct));
  if (drift !== 0) {
    const last = results[results.length - 1];
    if (isOdd) {
      last.motherPct = round3(last.motherPct + drift);
    } else {
      last.fatherPct = round3(last.fatherPct + drift);
    }
    last.totalPct = round3(last.motherPct + last.fatherPct);
  }

  const motherRaw = round3(results.reduce((a, r) => a + r.mother, 0));
  const fatherRaw = round3(results.reduce((a, r) => a + r.father, 0));
  const motherPctSum = round3(results.reduce((a, r) => a + r.motherPct, 0));
  const fatherPctSum = round3(results.reduce((a, r) => a + r.fatherPct, 0));
  const grandPct = round3(motherPctSum + fatherPctSum);

  let winner = "Equal";
  if (motherPctSum > fatherPctSum) winner = "Mother";
  else if (fatherPctSum > motherPctSum) winner = "Father";

  return {
    dob: dobString,
    day,
    isOdd,
    results,
    rawGrandTotal,
    motherRaw,
    fatherRaw,
    motherPctSum,
    fatherPctSum,
    grandPct,
    winner,
  };
}

// --- CSV export helper -----------------------------------------------------
export function toCsv(data) {
  const header = "Factor,Min,Max,Mother,Father,Total,Mother %,Father %,Total %\n";
  const rows = data.results
    .map(
      (r) =>
        `${r.name},${r.min},${r.max},${r.mother},${r.father},${r.total},${r.motherPct},${r.fatherPct},${r.totalPct}`
    )
    .join("\n");
  const footer = `\nRaw Total (sum of factor Totals),,,,,${data.rawGrandTotal},,,\nWeightage Total,,,,,,${data.motherPctSum},${data.fatherPctSum},${data.grandPct}\n`;
  return header + rows + footer;
}
