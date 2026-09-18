const ResultsTable = ({ data }) => {
  const { results, motherTotal, fatherTotal, grandTotal, isOdd } = data;
  const leader = isOdd ? "mother" : "father";

  return (
    <div className="table-wrap">
      <table className="results-table">
        <thead>
          <tr>
            <th>Life Factor</th>
            <th>Mother</th>
            <th>Father</th>
            <th>Total</th>
            <th>Minimum</th>
            <th>Maximum</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.key}>
              <td>{r.name}</td>
              <td className={leader === "mother" ? "lead-cell" : undefined}>
                {r.mother.toFixed(3)}
              </td>
              <td className={leader === "father" ? "lead-cell" : undefined}>
                {r.father.toFixed(3)}
              </td>
              <td className="row-total">{r.total.toFixed(3)}</td>
              <td className="dim">{r.min.toFixed(3)}</td>
              <td className="dim">{r.max.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>TOTAL</td>
            <td>{motherTotal.toFixed(3)}</td>
            <td>{fatherTotal.toFixed(3)}</td>
            <td className="row-total">{grandTotal.toFixed(3)}</td>
            <td className="dim" colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
      <p className="table-note">
        Every Mother and Father value sits inside that factor&rsquo;s Minimum&ndash;Maximum band,
        each row&rsquo;s Total is Mother + Father, and all fourteen values add up to exactly{" "}
        <strong>100.000</strong>. Day {data.day} is {isOdd ? "odd" : "even"}, so{" "}
        <strong>{isOdd ? "Mother" : "Father"}</strong> is the higher value on every row.
      </p>
    </div>
  );
}

export default ResultsTable
