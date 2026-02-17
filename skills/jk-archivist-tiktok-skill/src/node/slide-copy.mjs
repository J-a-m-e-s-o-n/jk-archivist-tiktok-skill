import fs from "node:fs";

export const DEFAULT_SLIDES = [
  "The trading card market runs on messy data.",
  "Prices fragment. Condition drifts. Signals lie.",
  "Collectors make real decisions on incomplete info.",
  "JK Index = market intelligence for TCGs.",
  "Truth first. No guessing. Built in public.",
  "Alpha today. Compounding weekly. Brick by brick. 👑🧱",
];

function validateSlides(slides, sourceLabel) {
  if (!Array.isArray(slides)) {
    throw new Error(`${sourceLabel} must provide a 'slides' array.`);
  }
  if (slides.length !== 6) {
    throw new Error(`${sourceLabel} must provide exactly 6 slides.`);
  }
  for (const [idx, line] of slides.entries()) {
    if (typeof line !== "string" || !line.trim()) {
      throw new Error(`${sourceLabel} slide ${idx + 1} must be a non-empty string.`);
    }
  }
  return slides.map((line) => line.trim());
}

export function loadSlidesFromSpecFile(specPath) {
  if (!fs.existsSync(specPath)) {
    throw new Error(`Slide spec file not found: ${specPath}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(specPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not parse slide spec JSON: ${message}`);
  }
  return validateSlides(parsed.slides, `Spec (${specPath})`);
}

export function generateSlidesFromTopic(topic) {
  const cleanTopic = topic.trim();
  if (!cleanTopic) {
    throw new Error("Topic cannot be empty when generating custom slides.");
  }
  // Deterministic template for agent-assisted "come up with 6 slides" mode.
  return [
    `${cleanTopic}: the current state is noisier than it looks.`,
    "Signals conflict. Context is fragmented. Surface-level takes miss nuance.",
    "People still need to make decisions with imperfect information.",
    `${cleanTopic}: distilled into a usable, plain-English narrative.`,
    "Start with verified facts. Remove noise. Keep the message actionable.",
    "Publish consistently, learn weekly, and compound clarity over time.",
  ];
}

export function resolveSlides({ specPath, topic }) {
  if (specPath) {
    return loadSlidesFromSpecFile(specPath);
  }
  if (topic) {
    return generateSlidesFromTopic(topic);
  }
  return [...DEFAULT_SLIDES];
}
