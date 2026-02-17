import { spawnSync } from "node:child_process";
import { buildCaption } from "./write-caption.mjs";
import { renderSlides } from "./render-slides.mjs";
import {
  todayISO,
  ensureDir,
  writeText,
  optionalEnv,
  exists,
  repoRoot,
  join,
} from "./utils.mjs";

function resolveFontPath() {
  const envFont = optionalEnv("TIKTOK_FONT_PATH");
  if (envFont && exists(envFont)) {
    return envFont;
  }
  if (envFont && !exists(envFont)) {
    throw new Error(
      `TIKTOK_FONT_PATH is set but file does not exist: ${envFont}`
    );
  }

  const fallback = "/System/Library/Fonts/Supplemental/Arial.ttf";
  if (exists(fallback)) {
    return fallback;
  }

  throw new Error(
    "No usable font found. Set TIKTOK_FONT_PATH to an absolute .ttf path."
  );
}

function verifySlides(slidesDir) {
  const result = spawnSync(
    "python3",
    ["scripts/verify_slides.py", "--dir", slidesDir],
    { stdio: "inherit" }
  );
  if (result.error) {
    throw new Error(`Failed to run slide verification: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `Slide verification failed with status: ${result.status ?? "unknown"}`
    );
  }
}

function main() {
  const root = repoRoot();
  const day = todayISO();
  const outDir = join(root, "outbox", "tiktok", "intro", day);
  const slidesDir = join(outDir, "slides");
  const captionPath = join(outDir, "caption.txt");

  ensureDir(slidesDir);
  const fontPath = resolveFontPath();
  const slidePaths = renderSlides({ slidesDir, fontPath });

  const caption = buildCaption();
  writeText(captionPath, `${caption}\n`);

  if (slidePaths.length !== 6) {
    throw new Error(`Expected 6 slides, got: ${slidePaths.length}`);
  }
  verifySlides(slidesDir);

  console.log("");
  console.log("Phase 3 complete.");
  console.log(`Output folder: ${outDir}`);
  console.log("Next step: Phase 4 will upload draft via Postiz.");
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
}
