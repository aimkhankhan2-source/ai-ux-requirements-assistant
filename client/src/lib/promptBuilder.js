// Reads the actual system prompt file from prompts/ at build time (Vite's
// `?raw` import inlines the file's text as a string — no server, no fetch).
// This is the single source of truth for the prompt content: nothing here
// duplicates or rewrites it.
import uxRequirementsPrompt from "../../../prompts/ux-requirements-assistant.md?raw";

// The 15 sections defined in prompts/ux-requirements-assistant.md, in order.
// Used both to build the reinforcement instruction below and to render the
// "what the AI will generate" preview (see OutputSections.jsx).
export const REQUIRED_SECTIONS = [
  "Problem Definition",
  "Target Users",
  "User Goals",
  "Pain Points",
  "User Journey",
  "Functional Requirements",
  "Non-Functional Requirements",
  "Core Features",
  "Information Architecture",
  "Primary User Flow",
  "Screen Requirements",
  "Wireframe Suggestions",
  "UX Risks",
  "Assumptions",
  "Open Questions",
];

/**
 * Assembles a complete, ready-to-paste prompt from the existing UX
 * Requirements Assistant instructions plus the user's specific problem.
 * This runs entirely in the browser — nothing is sent anywhere.
 */
export function buildPrompt(problem) {
  const sectionList = REQUIRED_SECTIONS.map((name, i) => `${i + 1}. ${name}`).join("\n");

  return `IMPORTANT:
The examples contained in the UX Requirements Assistant instructions below are illustrative only. They are NOT the user's problem and must NOT be analyzed.
The ONLY problem to analyze is the text provided under "## User Problem" below.

---

${uxRequirementsPrompt.trim()}

---

## User Problem

${problem.trim()}

---

## Instructions

Analyze ONLY the user problem provided above under "## User Problem". Do not reference any other project, example, or prior conversation. Follow the exact 15-section output structure defined above:

${sectionList}

Produce the complete UX brief now.
`;
}

/**
 * Lightweight, non-blocking sanity check on a generated prompt. There's no
 * AI response to validate anymore — this just confirms the prompt we built
 * actually contains what it's supposed to, since we control the assembly.
 */
export function validatePrompt(prompt, problem) {
  const missingSections = REQUIRED_SECTIONS.filter((name) => !prompt.includes(name));
  const containsProblem = Boolean(problem) && prompt.includes(problem.trim());

  return {
    valid: prompt.trim().length > 0 && containsProblem && missingSections.length === 0,
    isEmpty: prompt.trim().length === 0,
    containsProblem,
    missingSections,
  };
}
