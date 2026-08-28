import ExportButton from "./ExportButton";

const NEXT_STEPS = [
  "Copy the prompt",
  "Open your AI assistant",
  "Paste the prompt",
  "Review the generated UX brief",
  "Use the Figma-ready screen specifications for prototyping",
];

export default function PromptOutput({ prompt, problem }) {
  if (!prompt) return null;

  return (
    <section className="prompt-output">
      <div className="prompt-output-header">
        <h2>Generated AI Prompt</h2>
        <ExportButton prompt={prompt} />
      </div>

      {/* The base prompt template (below) includes its own built-in example
          about study rooms — that's expected, it's part of the unmodified
          instructions. This line exists so it's never ambiguous which
          problem this particular prompt was actually built from. */}
      <p className="generated-for">
        Generated for: <strong>{problem}</strong>
      </p>

      <pre className="prompt-panel">{prompt}</pre>

      <div className="next-step">
        <h3>Next Step</h3>
        <p>
          Copy the generated prompt and paste it into Claude or ChatGPT to generate the
          complete UX requirements brief.
        </p>
        <ol>
          {NEXT_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
