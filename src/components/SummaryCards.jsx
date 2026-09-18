import React from 'react'

const SummaryCards = ({ data }) => {
  const { motherTotal, fatherTotal, grandTotal, winner, isOdd, day } = data;

  return (
    <section className="summary-grid">
      <div className="summary-card mother-card">
        <span className="summary-label">Mother Total</span>
        <span className="summary-value">{motherTotal.toFixed(3)}</span>
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
        <span className="summary-label">Father Total</span>
        <span className="summary-value">{fatherTotal.toFixed(3)}</span>
      </div>

      <div className="summary-card grand-card">
        <span className="summary-label">Grand Total</span>
        <span className="summary-value">{grandTotal.toFixed(3)}</span>
      </div>
    </section>
  );
}

export default SummaryCards
