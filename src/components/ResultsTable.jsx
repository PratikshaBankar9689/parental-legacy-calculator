import React from 'react'

const ResultsTable = ({ results, motherTotal, fatherTotal, grandTotal }) => {
  return (
    <div className="table-wrap">
      <table className="results-table">
        <thead>
          <tr>
            <th>Factor</th>
            <th>Mother</th>
            <th>Father</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.key}>
              <td>{r.name}</td>
              <td>{r.mother.toFixed(3)}</td>
              <td>{r.father.toFixed(3)}</td>
              <td>{r.total.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{motherTotal.toFixed(3)}</td>
            <td>{fatherTotal.toFixed(3)}</td>
            <td>{grandTotal.toFixed(3)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ResultsTable

