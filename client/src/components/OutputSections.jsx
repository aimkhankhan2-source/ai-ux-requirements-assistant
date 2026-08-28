import { REQUIRED_SECTIONS } from "../lib/promptBuilder";

export default function OutputSections() {
  return (
    <section className="output-sections">
      <h2>What the AI will generate</h2>
      <p>The generated UX brief contains:</p>

      <ol className="section-grid">
        {REQUIRED_SECTIONS.map((name, i) => (
          <li key={name}>
            <span className="section-number">{i + 1}</span>
            <span className="section-name">{name}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
