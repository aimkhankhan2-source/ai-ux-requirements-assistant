import { EXAMPLE_PROBLEM } from "../lib/exampleProblem";

export default function ProblemForm({ problem, onProblemChange, onGenerate }) {
  function handleSubmit(e) {
    e.preventDefault();
    onGenerate();
  }

  return (
    <form className="problem-form" onSubmit={handleSubmit} autoComplete="off">
      <h2>Describe the user problem</h2>
      <label htmlFor="problem-input" className="sr-only">
        Describe the user problem
      </label>
      <textarea
        id="problem-input"
        rows={4}
        placeholder="e.g. University students struggle to find available study rooms."
        value={problem}
        onChange={(e) => onProblemChange(e.target.value)}
        // Some browsers restore a field's last value on page reload,
        // independent of React's controlled state. autoComplete="off" (also
        // set on the <form>) tells the browser not to do that here, so the
        // textarea's React state is always the single source of truth.
        autoComplete="off"
      />

      <div className="problem-form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onProblemChange(EXAMPLE_PROBLEM)}
        >
          Load Example Problem
        </button>

        <button type="submit" className="primary-button">
          Generate AI Prompt
        </button>
      </div>
    </form>
  );
}
