
import React from 'react'

const ResultsTable = ({ data }) => {
  const { results, motherRaw, fatherRaw, rawGrandTotal, motherPctSum, fatherPctSum, grandPct } = data;

  return (
    <div className="table-wrap">
      <table className="results-table">
        <thead>
          <tr>
            <th rowSpan={2}>Factor</th>
            <th colSpan={5} className="group-head">
              Value (within factor's min–max)
            </th>
            <th colSpan={3} className="group-head">
              Weightage % (sums to 100)
            </th>
          </tr>
          <tr>
            <th>Min</th>
            <th>Max</th>
            <th>Mother</th>
            <th>Father</th>
            <th>Total</th>
            <th>Mother %</th>
            <th>Father %</th>
            <th>Total %</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.key}>
              <td>{r.name}</td>
              <td className="dim">{r.min.toFixed(3)}</td>
              <td className="dim">{r.max.toFixed(3)}</td>
              <td>{r.mother.toFixed(3)}</td>
              <td>{r.father.toFixed(3)}</td>
              <td>{r.total.toFixed(3)}</td>
              <td>{r.motherPct.toFixed(3)}</td>
              <td>{r.fatherPct.toFixed(3)}</td>
              <td>{r.totalPct.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Sum</td>
            <td className="dim" colSpan={2}></td>
            <td>{motherRaw.toFixed(3)}</td>
            <td>{fatherRaw.toFixed(3)}</td>
            <td>{rawGrandTotal.toFixed(3)}</td>
            <td>{motherPctSum.toFixed(3)}</td>
            <td>{fatherPctSum.toFixed(3)}</td>
            <td>{grandPct.toFixed(3)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="table-note">
        <strong>Value</strong> columns are each factor's raw score, guaranteed to fall inside the
        brief's stated min&ndash;max range for that factor. <strong>Weightage %</strong> columns
        express that same score as a share of all 7 factors, normalized so the grand total is
        exactly 100. The seven ranges in the brief can never add up to 100 on their own (their
        extremes sum to roughly 47&ndash;54), so this keeps every factor's value honest to its
        range while still satisfying the grand-total-100 rule.
      </p>
    </div>
  );
}

export default ResultsTable
