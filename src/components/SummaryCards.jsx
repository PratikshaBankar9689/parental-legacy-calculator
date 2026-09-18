const SummaryCards = ({ data }) => {
  const { motherTotal, fatherTotal, grandTotal, winner, isOdd, day } = data;
  const gap = Math.abs(motherTotal - fatherTotal).toFixed(3);

  return (
    <section className="summary-grid">
      <div className="summary-card mother-card">
        <span className="summary-label">Mother Total</span>
        <span className="summary-value">{motherTotal.toFixed(3)}</span>
        <span className="summary-sub">across 7 life factors</span>
      </div>

      <div className="summary-card legacy-card">
        <span className="summary-label">Legacy</span>
        <span className="summary-value legacy-winner">
          {winner === "Equal" ? "Balanced" : `${winner} leads`}
        </span>
        <span className="summary-sub">
          Day {day} is {isOdd ? "odd" : "even"} &mdash; ahead by {gap}
        </span>
      </div>

      <div className="summary-card father-card">
        <span className="summary-label">Father Total</span>
        <span className="summary-value">{fatherTotal.toFixed(3)}</span>
        <span className="summary-sub">across 7 life factors</span>
      </div>

      <div className="summary-card grand-card">
        <span className="summary-label">Grand Total</span>
        <span className="summary-value">{grandTotal.toFixed(3)}</span>
        <span className="summary-sub">Mother + Father, exact</span>
      </div>
    </section>
  );
}

export default SummaryCards
