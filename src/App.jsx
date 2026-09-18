import { useEffect, useState } from "react";
import DobForm from "./components/DobForm";
import SummaryCards from "./components/SummaryCards";
import DivergingBars from "./components/DivergingBars";
import LegacyDonut from "./components/LegacyDonut";
import ResultsTable from "./components/ResultsTable";
import { calculateLegacy, toCsv } from "./utils/calculator";
import "./App.css";

const STORAGE_KEY = "parental-legacy-history";

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("legacy-theme") || "dark");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("legacy-theme", theme);
  }, [theme]);

  function handleCalculate(dobString) {
    if (!dobString) {
      setData(null);
      return;
    }
    try {
      const result = calculateLegacy(dobString);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e.message);
      setData(null);
    }
  }

  function handleSave() {
    if (!data) return;
    const next = [{ dob: data.dob, winner: data.winner, savedAt: new Date().toISOString() }, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function handleExportCsv() {
    if (!data) return;
    const blob = new Blob([toCsv(data)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legacy-${data.dob}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1>
            Parental Legacy <span className="amp">&amp;</span> Life Factors
          </h1>
          <p className="header-sub">
            Enter a date of birth to see how Mother and Father lineage weigh across seven life
            factors — every value inside its own min–max band, always totalling exactly 100.
          </p>
        </div>
        <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </header>

      <main className="app-main">
        <DobForm onCalculate={handleCalculate} />
        {error && <p className="form-error">{error}</p>}

        {data && (
          <div className="results-block" id="print-area">
            <SummaryCards data={data} />

            <div className="charts-grid">
              <DivergingBars results={data.results} />
              <LegacyDonut motherTotal={data.motherTotal} fatherTotal={data.fatherTotal} />
            </div>

            <ResultsTable data={data} />

            <div className="actions-row no-print">
              <button onClick={handleExportCsv}>Export CSV</button>
              <button onClick={() => window.print()}>Export / Print PDF</button>
              <button onClick={handleSave}>Save Result</button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <section className="history no-print">
            <h2>Saved results</h2>
            <ul>
              {history.map((h, i) => (
                <li key={i}>
                  <span>{h.dob}</span>
                  <span>{h.winner}</span>
                  <span>{new Date(h.savedAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="app-footer">Values are generated deterministically from the date you enter.</footer>
    </div>
  );
}
