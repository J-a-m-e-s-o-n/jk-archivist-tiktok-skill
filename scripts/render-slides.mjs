import { spawnSync } from "node:child_process";
import { join, writeJson, exists } from "./utils.mjs";

const EXACT_SLIDES = [
  "The trading card market runs on messy data.",
  "Prices fragment. Condition drifts. Signals lie.",
  "Collectors make real decisions on incomplete info.",
  "JK Index = market intelligence for TCGs.",
  "Truth first. No guessing. Built in public.",
  "Alpha today. Compounding weekly. Brick by brick. 👑🧱",
];

export function renderSlides({ slidesDir, fontPath }) {
  const outDir = join(slidesDir, "..");
  const specPath = join(outDir, "_slide_spec.json");
  writeJson(specPath, { slides: EXACT_SLIDES });

  const result = spawnSync(
    "python3",
    [
      "scripts/render_slides_pillow.py",
      "--spec",
      specPath,
      "--out",
      slidesDir,
      "--font",
      fontPath,
    ],
    { stdio: "inherit" }
  );

  if (result.error) {
    throw new Error(`Failed to run python renderer: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `Slide renderer exited with non-zero status: ${result.status ?? "unknown"}`
    );
  }

  const produced = Array.from({ length: 6 }, (_, idx) =>
    join(slidesDir, `slide_${String(idx + 1).padStart(2, "0")}.png`)
  );
  for (const filePath of produced) {
    if (!exists(filePath)) {
      throw new Error(`Expected slide missing after render: ${filePath}`);
    }
  }
  return produced;
}
