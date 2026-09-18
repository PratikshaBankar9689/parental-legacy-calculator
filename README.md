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

1. **Seeded randomness, not `Math.random()`.** The DOB is turned into a numeric seed
   (`YYYYMMDD`) and fed into a small deterministic PRNG (`mulberry32`). This means the
   **same Date of Birth always produces the same result** — the app isn't re-rolling
   random numbers on every render, which matters for a "calculator."

2. **Per-factor total, inside its band.** For each of the 7 factors, a raw total is
   drawn from its `[min, max]` range given in the brief (e.g. Genetic Inheritance:
   9.333–10.777).

3. **Scale to 100.** The 7 raw totals are scaled proportionally so they sum to exactly
   `100`, satisfying "Sum of all Mother values + Sum of all Father values = 100" while
   preserving each factor's relative weight.

4. **Mother/Father split by day parity.**
   - **Odd** day of month → Mother gets the dominant share of each factor's total.
   - **Even** day of month → Father gets the dominant share.
   - The dominant share is itself varied per factor (54%–68%, seeded) so the split
     isn't a flat, robotic 60/40 on every row — but it's still deterministic.
   - By construction, `Mother + Father = Total` for every factor.

5. **Rounding correction.** Values are rounded to 3 decimals for display. Any tiny
   rounding drift is folded back into the last factor so the grand total is exactly
   `100.000`, not `99.998` or `100.003`.

6. **Legacy winner.** Whichever parent's column sums higher across all 7 factors is
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

Not implemented: JWT authentication — out of scope for a localStorage-only,
no-backend tool as described in the brief's FAQ, and would need a real backend to be
meaningful.

## Deploy

This is a static Vite build, so any static host works, e.g.:

```bash
npm run build
# then drag the dist/ folder into Netlify, or:
npx vercel deploy --prod
```
