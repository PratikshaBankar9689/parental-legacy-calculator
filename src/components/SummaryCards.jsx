import React from 'react'

const SummaryCards = ({ data }) => {
  const { motherPctSum, fatherPctSum, grandPct, motherRaw, fatherRaw, rawGrandTotal, winner, isOdd, day } = data;

  return (
    <section className="summary-grid">
      <div className="summary-card mother-card">
        <span className="summary-label">Mother Weightage</span>
        <span className="summary-value">{motherPctSum.toFixed(3)}</span>
        <span className="summary-sub">raw sum {motherRaw.toFixed(3)}</span>
      </div>

      <div className="summary-card legacy-card">
        <span className="summary-label">Legacy</span>
        <span className="summary-value legacy-winner">
          {winner === "Equal" ? "Balanced" : `${winner} leads`}
        </span>
        <span className="summary-sub">
          Day {day} is {isOdd ? "odd" : "even"} &mdash; {isOdd ? "Mother" : "Father"} rule applied
        </span>
      </div>

      <div className="summary-card father-card">
        <span className="summary-label">Father Weightage</span>
        <span className="summary-value">{fatherPctSum.toFixed(3)}</span>
        <span className="summary-sub">raw sum {fatherRaw.toFixed(3)}</span>
      </div>

      <div className="summary-card grand-card">
        <span className="summary-label">Grand Total</span>
        <span className="summary-value">{grandPct.toFixed(3)}</span>
        <span className="summary-sub">factor values sum {rawGrandTotal.toFixed(3)}</span>
      </div>
    </section>
  );
}

export default SummaryCards
