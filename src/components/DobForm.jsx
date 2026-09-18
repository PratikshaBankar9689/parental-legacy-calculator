import { useState } from "react";
import { validateDob } from "../utils/calculator";

const DobForm = ({ onCalculate }) => {
  const [dob, setDob] = useState("");
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  function handleChange(e) {
    const value = e.target.value;
    setDob(value);
    const err = validateDob(value);
    setError(err);
    if (!err && value) {
      onCalculate(value);
    } else {
      onCalculate(null);
    }
  }

  return (
    <form className="dob-form" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="dob-input" className="dob-label">
        Date of Birth
      </label>
      <input
        id="dob-input"
        type="date"
        className="dob-input"
        value={dob}
        max={today}
        onChange={handleChange}
      />
      {error && (
        <p className="dob-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default DobForm

