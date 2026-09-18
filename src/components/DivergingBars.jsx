import React from 'react'

const DivergingBars = ({ results }) => {
 const maxVal = Math.max(...results.map((r) => Math.max(r.mother, r.father)));

  return (
    <section className="diverging-chart" aria-label="Mother vs Father comparison chart">
      <div className="diverging-heads">
        <span>Mother</span>
        <span>Father</span>
      </div>
      {results.map((r) => {
        const motherPct = (r.mother / maxVal) * 100;
        const fatherPct = (r.father / maxVal) * 100;
        return (
          <div className="diverging-row" key={r.key}>
            <div className="diverging-track diverging-left">
              <span className="diverging-figure">{r.mother.toFixed(3)}</span>
              <div className="diverging-bar bar-mother" style={{ width: `${motherPct}%` }} />
            </div>
            <div className="diverging-name">{r.name}</div>
            <div className="diverging-track diverging-right">
              <div className="diverging-bar bar-father" style={{ width: `${fatherPct}%` }} />
              <span className="diverging-figure">{r.father.toFixed(3)}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default DivergingBars
