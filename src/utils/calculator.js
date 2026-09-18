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
export function calculateLegacy(dobString) {
  const error = validateDob(dobString);
  if (error) throw new Error(error);

  const dob = new Date(dobString + "T00:00:00");
  const day = dob.getDate();
  const isOdd = day % 2 === 1;
  const rand = mulberry32(seedFromDate(dob));

  // 1) Raw total per factor, inside its [min, max] band.
  const raw = FACTORS.map((f) => f.min + rand() * (f.max - f.min));

  // 2) Scale every raw total proportionally so the 7 totals sum to exactly 100,
  //    while each value keeps its position relative to the others (and stays
  //    close to its natural band).
  const rawSum = raw.reduce((a, b) => a + b, 0);
  const scale = 100 / rawSum;
  const totals = raw.map((v) => v * scale);

  // 3) Split each factor's total into Mother / Father using the day-parity rule.
  //    The "winning" parent gets a dominant share (54%-68%), varied per factor
  //    but deterministic (seeded), so the split isn't a flat 60/40 everywhere.
  const results = FACTORS.map((f, i) => {
    const total = totals[i];
    const dominance = 0.54 + rand() * 0.14; // 0.54 - 0.68
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
      // Derive total from the already-rounded parts so Mother + Father === Total
      // holds exactly at the displayed precision, not just before rounding.
      total: round3(roundedMother + roundedFather),
    };
  });

  // 4) Rounding each Mother/Father value to 3 decimals independently can leave
  //    a tiny drift (e.g. grand total = 99.998 or 100.002). Correct it by
  //    nudging the last factor's dominant-parent value so Mother Total +
  //    Father Total lands on exactly 100.000, then re-derive that factor's total.
  const preMotherSum = results.reduce((a, r) => a + r.mother, 0);
  const preFatherSum = results.reduce((a, r) => a + r.father, 0);
  const drift = round3(100 - round3(preMotherSum + preFatherSum));
  if (drift !== 0) {
    const last = results[results.length - 1];
    if (isOdd) {
      last.mother = round3(last.mother + drift);
    } else {
      last.father = round3(last.father + drift);
    }
    last.total = round3(last.mother + last.father);
  }

  const motherTotal = round3(results.reduce((a, r) => a + r.mother, 0));
  const fatherTotal = round3(results.reduce((a, r) => a + r.father, 0));
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
  };
}

// --- CSV export helper -----------------------------------------------------
export function toCsv(data) {
  const header = "Factor,Mother,Father,Total\n";
  const rows = data.results
    .map((r) => `${r.name},${r.mother},${r.father},${r.total}`)
    .join("\n");
  const footer = `\nMother Total,${data.motherTotal},,\nFather Total,,${data.fatherTotal},\nGrand Total,,,${data.grandTotal}\n`;
  return header + rows + footer;
}
