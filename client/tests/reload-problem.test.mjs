// Regression test for a real bug report: after reloading the page and
// typing a new problem, "Generate AI Prompt" appeared to still be using the
// built-in Smart Study Room Booking example.
//
// Investigation showed the textarea/state logic was never actually wrong —
// verified below by reproducing the exact reported sequence with a real
// page.reload() (not just a fresh navigation, which behaves differently).
// The real source of confusion: prompts/ux-requirements-assistant.md's own
// "Example" / "Example Input" sections mention the study-room scenario as
// part of its fixed instructions (by design — we're required to preserve
// that file unmodified), so that phrase always appears somewhere in the
// assembled prompt regardless of input. What must NOT vary incorrectly is
// the "## User Problem" section and the "Generated for" confirmation line —
// those are what this test actually checks.
//
// Run with: npm run test:e2e   (spawns its own dev server, no setup needed)

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 5199;
const BASE = `http://localhost:${PORT}`;
const STUDY_ROOM_PROBLEM = "University students struggle to find available study rooms.";
const COFFEE_SHOP_PROBLEM = "I want to create a website for a coffee shop";

let failures = 0;
function check(label, cond, detail) {
  if (cond) {
    console.log(`PASS: ${label}`);
  } else {
    console.log(`FAIL: ${label}${detail ? " — " + detail : ""}`);
    failures++;
  }
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await delay(200);
  }
  throw new Error(`Dev server at ${url} did not become ready in time`);
}

const server = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], {
  cwd: new URL("..", import.meta.url).pathname,
  stdio: "pipe",
});

let browser;
try {
  await waitForServer(BASE);

  const launchOpts = process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH, args: ["--no-sandbox"] }
    : {};
  browser = await chromium.launch(launchOpts);
  const page = await (await browser.newContext()).newPage();

  // --- Scenario 1: the exact reported sequence — reload, then type a brand
  // new problem, never touching "Load Example Problem" this session.
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });

  const valueRightAfterReload = await page.locator("#problem-input").inputValue();
  check(
    "Reloading the page does not pre-fill the textarea with the example",
    valueRightAfterReload === "",
    `got: ${JSON.stringify(valueRightAfterReload)}`
  );

  await page.locator("#problem-input").fill(COFFEE_SHOP_PROBLEM);
  await page.getByRole("button", { name: "Generate AI Prompt" }).click();
  await page.waitForTimeout(200);

  const generatedFor1 = await page.locator(".generated-for").textContent();
  check(
    "\"Generated for\" reflects the coffee shop problem",
    generatedFor1.includes(COFFEE_SHOP_PROBLEM),
    `got: ${generatedFor1}`
  );
  check(
    "\"Generated for\" does NOT show the study-room example",
    !generatedFor1.includes(STUDY_ROOM_PROBLEM),
    `got: ${generatedFor1}`
  );

  const promptText1 = await page.locator(".prompt-panel").textContent();
  // Anchor on the actual "## User Problem" section heading (heading followed
  // by a blank line before the problem text), not just any occurrence of the
  // string — the new IMPORTANT disclaimer and the closing Instructions
  // section both *mention* "## User Problem" inline as quoted text, which a
  // plain indexOf/lastIndexOf would incorrectly match instead of the real
  // heading.
  const userProblemHeading = "## User Problem\n\n";
  const userProblemSection1 = promptText1.slice(promptText1.indexOf(userProblemHeading));
  check(
    "Generated prompt's User Problem section contains the exact coffee shop problem",
    userProblemSection1.includes(COFFEE_SHOP_PROBLEM)
  );
  check(
    "Generated prompt's User Problem section does NOT contain the study-room problem",
    !userProblemSection1.includes(STUDY_ROOM_PROBLEM)
  );

  // --- The base prompt's own built-in examples (about study rooms) are
  // still present by design — but the generated prompt must open with a
  // disclaimer making clear those examples aren't the real task, and that
  // disclaimer must appear before the first such example in the document.
  check(
    "Generated prompt opens with the IMPORTANT disclaimer",
    promptText1.trim().startsWith("IMPORTANT:")
  );
  check(
    "Disclaimer points to \"## User Problem\" as the only problem to analyze",
    promptText1.includes('The ONLY problem to analyze is the text provided under "## User Problem"')
  );
  const disclaimerIndex = promptText1.indexOf("IMPORTANT:");
  const firstExampleIndex = promptText1.indexOf(STUDY_ROOM_PROBLEM);
  check(
    "Disclaimer appears before the base prompt's own study-room example",
    disclaimerIndex !== -1 && firstExampleIndex !== -1 && disclaimerIndex < firstExampleIndex,
    `disclaimer at ${disclaimerIndex}, first example at ${firstExampleIndex}`
  );

  // --- Scenario 2: explicitly load the example, generate, confirm it DOES
  // correctly show the study-room problem when that's what was actually used.
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Load Example Problem" }).click();
  check(
    "Load Example Problem only fills the textarea after an explicit click",
    (await page.locator("#problem-input").inputValue()) === STUDY_ROOM_PROBLEM
  );
  await page.getByRole("button", { name: "Generate AI Prompt" }).click();
  await page.waitForTimeout(200);
  const generatedFor2 = await page.locator(".generated-for").textContent();
  check(
    "\"Generated for\" shows the study-room problem when it was explicitly loaded",
    generatedFor2.includes(STUDY_ROOM_PROBLEM)
  );

  // --- Scenario 3: load example, then replace it with a new problem
  // WITHOUT reloading — the textarea must still win.
  await page.locator("#problem-input").fill(COFFEE_SHOP_PROBLEM);
  await page.getByRole("button", { name: "Generate AI Prompt" }).click();
  await page.waitForTimeout(200);
  const generatedFor3 = await page.locator(".generated-for").textContent();
  check(
    "Replacing the textarea (no reload) and regenerating uses the new problem",
    generatedFor3.includes(COFFEE_SHOP_PROBLEM) && !generatedFor3.includes(STUDY_ROOM_PROBLEM),
    `got: ${generatedFor3}`
  );

  console.log(`\n${failures === 0 ? "ALL TESTS PASSED" : `${failures} TEST(S) FAILED`}`);
} finally {
  if (browser) await browser.close();
  server.kill();
}

process.exit(failures === 0 ? 0 : 1);
