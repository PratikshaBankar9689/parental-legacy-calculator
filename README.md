# Parental Legacy & Life Factors Calculator

A React app that takes a Date of Birth and generates seven "life factor" values split
between Mother and Father, always balancing to a grand total of exactly **100**.

Built for the MERN Full Stack Developer assessment task. No backend/database is used —
per the task FAQ, React + localStorage is sufficient.

## Live demo

https://parental-legacy-calculator-one.vercel.app/

## Tech stack

- **React 18** (functional components + hooks: `useState`, `useEffect`)
- **Vite** as the build tool
- **Recharts** for the Mother vs Father donut chart
- Plain **CSS3** (custom properties for theming, no framework) — see `src/App.css`
- **localStorage** for saving results and remembering the dark/light theme

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# -> open http://localhost:5173

# 3. Build for production
npm run build
npm run preview   # preview the production build locally
```

## Project structure

```
src/
  utils/calculator.js      # all calculation logic (pure functions, no UI)
  components/
    DobForm.jsx             # date input + validation
    SummaryCards.jsx        # Mother / Father / Grand totals + winner
    DivergingBars.jsx       # custom "tug-of-war" bar chart per factor
    LegacyDonut.jsx          # Recharts donut: Mother vs Father grand split
    ResultsTable.jsx        # full data table
  App.jsx                    # page composition + state + bonus features
  App.css                    # design system / theme / responsive rules
```

## How the calculation works

### A note on why there are two sets of numbers

The brief states two rules using the same words ("Mother value", "Father value",
"Total"):
- Rule A: for each factor, `Mother + Father = Total`, and Total must fall inside that
  factor's given `[min, max]` range.
- Rule B: summed across all 7 factors, `Mother + Father = 100`.

These can't both be literally true of one number: the 7 given ranges only add up to
somewhere between **~47.1** (every factor at its minimum) and **~54.2** (every factor
at its maximum) — they can never reach 100, no matter what's picked inside them. An
earlier version of this app scaled every value up to force the sum to 100, which broke
Rule A (e.g. a factor capped at 10.777 was showing 21+). That's wrong, so the app now
keeps the two rules as two distinct, clearly-labeled outputs instead of quietly
stretching one to fake the other:

- **Value columns** (`Mother`, `Father`, `Total`) — the literal factor score, always
  inside its stated `[min, max]`. Rule A holds exactly here.
- **Weightage % columns** (`Mother %`, `Father %`, `Total %`) — each factor's Total
  expressed as a normalized share of the 7-factor sum, so these add up to exactly
  `100` across all factors. Rule B holds exactly here.

Both come from the same single Mother/Father split (one constant scale factor is
applied to every row to go from raw value to %), so "which parent leads" is identical
whichever set of numbers you look at — it's the same underlying data, just shown in
two units.

### Step by step

1. **Seeded randomness, not `Math.random()`.** The DOB is turned into a numeric seed
   (`YYYYMMDD`) and fed into a small deterministic PRNG (`mulberry32`). The
   **same Date of Birth always produces the same result.**

2. **Per-factor Total, strictly inside its band.** For each of the 7 factors, the
   Total is drawn from its `[min, max]` range given in the brief (e.g. Genetic
   Inheritance: 9.333–10.777) — never scaled beyond it.

3. **Mother/Father split by day parity.**
   - **Odd** day of month → Mother gets the dominant share of each factor's Total.
   - **Even** day of month → Father gets the dominant share.
   - The dominant share is itself varied per factor (54%–68%, seeded) so the split
     isn't a flat, robotic 60/40 on every row.
   - By construction, `Mother + Father = Total` for every factor, and both stay
     inside the factor's range (each is a fraction of a number already in range).

4. **Weightage %.** Each factor's Total is divided by the sum of all 7 raw Totals and
   multiplied by 100, giving a normalized percentage. Applied uniformly, this turns
   the Mother/Father split into percentages that sum to exactly 100.

5. **Rounding correction.** Values are rounded to 3 decimals for display. Any tiny
   rounding drift in the percentage columns is folded back into the last factor so
   the weightage grand total is exactly `100.000`, not `99.998` or `100.003`.

6. **Legacy winner.** Whichever parent's weightage sums higher across all 7 factors is
   shown as the "leading" legacy in the summary card.

## Features implemented

**Must-have**
- [x] Date picker for DOB, auto-calculates on change
- [x] Validation: rejects invalid/future dates
- [x] Mother / Father / Total shown per factor
- [x] Mother Total / Father Total / Grand Total (= 100) shown
- [x] Parental legacy indicator (which parent leads)
- [x] Two charts: a custom diverging bar chart (per-factor) and a Recharts donut
      (grand totals)
- [x] Responsive layout (mobile → desktop)

**Bonus**
- [x] Export results as CSV
- [x] "Export / Print PDF" (print-optimized stylesheet via `window.print()`)
- [x] Dark / Light mode toggle (persisted in localStorage)
- [x] Save results to localStorage, with a short history list
