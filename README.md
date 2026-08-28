# AI UX Requirements Assistant

Turn a messy user problem into a structured, Figma-ready UX brief — without an API key,
a server, or a paid AI subscription of any kind.

## What this is

This project doesn't call an AI model itself. Instead, it's a small React app that
takes a messy user problem you type in and assembles it — in your browser, on the
spot — into a complete, ready-to-paste prompt built from this repo's own UX
requirements system prompt. You copy that prompt into whatever AI assistant you
already use (Claude, ChatGPT, or anything else), and it produces the 15-section UX
brief.

## Why it exists

The actual intellectual content of this project is the prompt itself —
[`prompts/ux-requirements-assistant.md`](prompts/ux-requirements-assistant.md), which
defines how to turn a vague problem into a rigorous UX requirements brief. Wiring that
prompt up to a specific paid API is a separate, optional concern, not the point. This
version keeps the focus on the prompt engineering and UX methodology, and makes the
whole thing runnable and demoable by anyone, for free, with nothing to sign up for.

## Workflow

```text
Messy User Problem
        ↓
UX Requirements Prompt System
        ↓
AI-ready structured prompt
        ↓
User copies prompt into Claude/ChatGPT
        ↓
15-section UX Brief
        ↓
Figma-ready design specifications
```

## Architecture

```text
User
 ↓
React + Vite
 ↓
Prompt Builder
 ↓
Generated AI Prompt
 ↓
Claude / ChatGPT
 ↓
15-section UX Brief
 ↓
Figma Prototype
```

Everything above the "Generated AI Prompt" line runs entirely in your browser — there's
no backend, no network call, and no API key anywhere in this repo. `client/src/lib/promptBuilder.js`
reads the actual contents of `prompts/ux-requirements-assistant.md` at build time (via
Vite's `?raw` import) and combines it with your problem statement and an explicit
instruction to follow the 15-section structure. That's the entire "generation" step —
pure string assembly, no model call. From there, you take the generated prompt to
Claude, ChatGPT, or any other capable LLM yourself.

## Prerequisites

- Node.js 18 or later

That's it — no API key, no account, no billing setup.

## Setup

```bash
npm run install:all
```

## Running the app

```bash
npm run dev
```

Open **http://localhost:5173**.

(Equivalent to running `npm install` and `npm run dev` directly inside `client/`, if
you'd rather skip the root convenience scripts.)

## Using it

1. Type a messy user problem into the textarea, or click **"Load Example Problem"** to
   use the built-in case study:

   > University students struggle to find available study rooms.

2. Click **"Generate AI Prompt"**. The app assembles a complete prompt from
   `prompts/ux-requirements-assistant.md` plus your problem and displays it in the
   output panel below, with a **"Generated for: ..."** line confirming exactly which
   problem it was built from (the base prompt template has its own built-in example
   about study rooms as part of its fixed instructions — this line is there so it's
   never ambiguous which part is your input).
3. Click **"Copy Prompt"** (copies to your clipboard) or **"Download Prompt"**
   (saves it as `ux-requirements-prompt.md`).
4. Paste it into Claude, ChatGPT, or another AI assistant of your choice.
5. Review the 15-section UX brief it produces, and use the Figma-ready screen
   specifications section for prototyping.

## What the generated prompt contains

- The full UX Requirements Assistant instructions, unchanged, from `prompts/ux-requirements-assistant.md`.
- Your problem statement, clearly delimited.
- An explicit instruction telling the AI to analyze only that problem and follow the
  15-section output structure defined in the prompt.

## The 15 output sections

Problem Definition, Target Users, User Goals, Pain Points, User Journey, Functional
Requirements, Non-Functional Requirements, Core Features, Information Architecture,
Primary User Flow, Screen Requirements, Wireframe Suggestions, UX Risks, Assumptions,
Open Questions.

For a worked example of what a completed brief looks like, see
[`prompts/examples/ai-generated-ux-brief.md`](prompts/examples/ai-generated-ux-brief.md)
and the Figma-ready screen breakdown in
[`prompts/case-study/figma-handoff.md`](prompts/case-study/figma-handoff.md).

## Validation

Since there's no AI response to check anymore, validation happens client-side, before
and after building the prompt:

- The problem field can't be empty (checked before generation).
- The generated prompt can't be empty.
- The generated prompt must contain your exact problem text.
- The generated prompt must contain all 15 required section names.

If generation succeeds, you'll see "AI-ready UX prompt generated successfully."; if the
problem field was empty, you'll see a message asking you to describe it first.

## Testing

```bash
npm run test:e2e --prefix client
```

This spawns its own dev server, drives a real browser (Playwright) through the actual
UI, and shuts everything down when it's done — no separate setup needed beyond the
usual `npm install`. It specifically covers a real bug that was reported and fixed: a
page reload followed by typing a new problem must always generate a prompt for *that*
problem, never a stale one. It checks a real `page.reload()` (not just a fresh page
load), that "Load Example Problem" only ever fills the textarea on an explicit click,
and that both the "Generated for" line and the prompt's own "## User Problem" section
track the current textarea value in every sequence — reload-then-type, load-example-
then-generate, and replace-without-reloading.

`playwright` is a devDependency only — it never ships in the built app. The first
`npm install` will download a Chromium binary for it (a one-time ~150MB fetch); that's
normal `playwright`-as-a-dependency behavior, not something specific to this project.

## What this project demonstrates

Prompt engineering, UX requirements analysis, user research framing, information
architecture, user flow design, Figma handoff preparation, and an AI-assisted UX
workflow that doesn't depend on any specific AI vendor or paid integration.

## Project structure

```text
ai-ux-requirements-assistant/
├── README.md
├── .gitignore
├── package.json                 # root convenience scripts (install:all, dev, build)
├── prompts/
│   ├── ux-requirements-assistant.md   # the system prompt (unchanged)
│   ├── case-study/
│   │   ├── study-room-booking.md
│   │   └── figma-handoff.md
│   └── examples/
│       └── ai-generated-ux-brief.md
└── client/
    ├── package.json
    ├── vite.config.js           # allows Vite's dev server to read ../prompts
    ├── index.html
    ├── tests/
    │   └── reload-problem.test.mjs  # e2e regression test (npm run test:e2e)
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── components/
        │   ├── ProblemForm.jsx      # problem textarea + Load Example / Generate buttons
        │   ├── PromptOutput.jsx     # generated prompt panel + Next Step guide
        │   ├── OutputSections.jsx   # visual preview of the 15 output sections
        │   └── ExportButton.jsx     # Copy Prompt / Download Prompt
        ├── lib/
        │   ├── promptBuilder.js     # assembles + validates the prompt (no network)
        │   └── exampleProblem.js
        └── styles.css
```
