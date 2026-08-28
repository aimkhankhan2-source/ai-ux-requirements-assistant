import { useState } from "react";
import ProblemForm from "./components/ProblemForm";
import PromptOutput from "./components/PromptOutput";
import OutputSections from "./components/OutputSections";
import { buildPrompt, validatePrompt } from "./lib/promptBuilder";

export default function App() {
  const [problem, setProblem] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  // The exact problem text the *currently displayed* prompt was built from.
  // Tracked separately from `problem` (the live textarea value) so that
  // editing the textarea after generating never changes what's shown as
  // "Generated for" underneath an already-generated prompt.
  const [generatedForProblem, setGeneratedForProblem] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text }

  function handleGenerate() {
    // Always read directly from the current textarea state — this is the
    // one and only source for what gets generated.
    const trimmedProblem = problem.trim();

    if (!trimmedProblem) {
      setGeneratedPrompt(null);
      setGeneratedForProblem(null);
      setStatus({ type: "error", text: "Please describe the user problem before generating a prompt." });
      return;
    }

    const prompt = buildPrompt(trimmedProblem);
    const validation = validatePrompt(prompt, trimmedProblem);

    if (!validation.valid) {
      setGeneratedPrompt(null);
      setGeneratedForProblem(null);
      setStatus({
        type: "error",
        text: "Something went wrong generating the prompt. Please try again.",
      });
      return;
    }

    setGeneratedPrompt(prompt);
    setGeneratedForProblem(trimmedProblem);
    setStatus({ type: "success", text: "AI-ready UX prompt generated successfully." });
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>AI UX Requirements Assistant</h1>
        <p>Turn a messy user problem into a structured, Figma-ready UX brief.</p>
      </header>

      <section className="problem-section">
        <ProblemForm problem={problem} onProblemChange={setProblem} onGenerate={handleGenerate} />
      </section>

      {status && (
        <div className={status.type === "error" ? "error-notice" : "success-notice"} role="status">
          {status.text}
        </div>
      )}

      <PromptOutput prompt={generatedPrompt} problem={generatedForProblem} />

      <OutputSections />
    </div>
  );
}
