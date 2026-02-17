import { spawnSync } from "node:child_process";
import { renderSlides } from "./render-slides.mjs";
import { loadPackagerSpec } from "./packager-spec.mjs";
import { postizUpload } from "./postiz-upload.mjs";
import { postizCreateDraft } from "./postiz-create-draft.mjs";
import { runPreflightChecks } from "./preflight-checks.mjs";
import {
  todayISO,
  ensureDir,
  writeText,
  writeJson,
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

function renderContactSheet(slidesDir, outFile) {
  const result = spawnSync(
    "python3",
    ["src/python/render_contact_sheet.py", "--slides-dir", slidesDir, "--out", outFile],
    { stdio: "inherit" }
  );
  if (result.error) {
    throw new Error(`Failed to run contact sheet renderer: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Contact sheet renderer failed with status: ${result.status ?? "unknown"}`);
  }
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    specPath: undefined,
    topic: undefined,
    template: undefined,
    stylePreset: undefined,
    enablePostiz: false,
    dryRun: false,
    postizOnly: false,
    noUpload: false,
  };
  for (let idx = 0; idx < argv.length; idx += 1) {
    const token = argv[idx];
    if (token === "--postiz") {
      args.enablePostiz = true;
      continue;
    }
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (token === "--postiz-only") {
      args.postizOnly = true;
      args.enablePostiz = true;
      continue;
    }
    if (token === "--no-upload") {
      args.noUpload = true;
      continue;
    }
    if (token === "--spec") {
      args.specPath = argv[idx + 1];
      idx += 1;
      continue;
    }
    if (token === "--topic") {
      args.topic = argv[idx + 1];
      idx += 1;
      continue;
    }
    if (token === "--template") {
      args.template = argv[idx + 1];
      idx += 1;
      continue;
    }
    if (token === "--style") {
      args.stylePreset = argv[idx + 1];
      idx += 1;
      continue;
    }
  }
  return args;
}

async function uploadToPostiz({ caption, slidePaths, outDir }) {
  const uploaded = [];
  for (const path of slidePaths) {
    const { mediaRef, raw } = await postizUpload({ filePath: path });
    uploaded.push({ path, mediaRef, uploadResponse: raw });
  }
  const draftResponse = await postizCreateDraft({
    caption,
    mediaRefs: uploaded.map((item) => item.mediaRef),
    idempotencyKey: `${todayISO()}-${slidePaths.length}-${caption.length}`,
  });
  const responsePath = join(outDir, "postiz_response.json");
  writeJson(responsePath, {
    uploaded,
    draftResponse,
  });
  return responsePath;
}

export async function runDraftFlow(cliArgs = parseArgs()) {
  const root = repoRoot();
  const day = todayISO();
  const outDir = join(root, "outbox", "tiktok", "intro", day);
  const slidesDir = join(outDir, "slides");
  const captionPath = join(outDir, "caption.txt");
  const reviewDir = join(outDir, "review");
  const reviewPath = join(reviewDir, "review.md");
  const contactSheetPath = join(reviewDir, "contact_sheet.png");

  ensureDir(slidesDir);
  ensureDir(reviewDir);
  const packagerSpec = loadPackagerSpec(cliArgs);
  runPreflightChecks({
    slides: packagerSpec.slides,
    caption: packagerSpec.caption,
  });

  let slidePaths = Array.from({ length: 6 }, (_, idx) =>
    join(slidesDir, `slide_${String(idx + 1).padStart(2, "0")}.png`)
  );
  let specPath = join(outDir, "_slide_spec.json");
  if (!cliArgs.postizOnly) {
    const fontPath = resolveFontPath();
    const renderResult = renderSlides({
      slidesDir,
      fontPath,
      slides: packagerSpec.slides,
      style: packagerSpec.style,
      dryRun: cliArgs.dryRun,
    });
    slidePaths = renderResult.produced;
    specPath = renderResult.specPath;
  }

  const caption = packagerSpec.caption;
  writeText(captionPath, `${caption}\n`);

  writeText(
    reviewPath,
    [
      "# Review",
      "",
      `Source: ${packagerSpec.source}`,
      `Template: ${packagerSpec.template}`,
      `Style preset: ${packagerSpec.stylePreset}`,
      "",
      "## Slides",
      ...packagerSpec.slides.map((line, idx) => `${idx + 1}. ${line}`),
      "",
      "## Caption",
      caption,
      "",
      "## Checks",
      `- dry_run: ${cliArgs.dryRun}`,
      `- postiz_only: ${cliArgs.postizOnly}`,
      `- upload_enabled: ${cliArgs.enablePostiz && !cliArgs.noUpload && !cliArgs.dryRun}`,
      `- spec_path: ${specPath}`,
    ].join("\n")
  );

  if (slidePaths.length !== 6) {
    throw new Error(`Expected 6 slides, got: ${slidePaths.length}`);
  }
  if (!cliArgs.dryRun) {
    verifySlides(slidesDir);
    renderContactSheet(slidesDir, contactSheetPath);
  }

  let postizResponsePath;
  if (cliArgs.enablePostiz && !cliArgs.noUpload && !cliArgs.dryRun) {
    postizResponsePath = await uploadToPostiz({
      caption,
      slidePaths,
      outDir,
    });
  }

  console.log("");
  console.log("Draft generation complete.");
  console.log(`Output folder: ${outDir}`);
  console.log(`Slide source: ${packagerSpec.source}`);
  console.log(`Template: ${packagerSpec.template}`);
  console.log(`Style preset: ${packagerSpec.stylePreset}`);
  if (cliArgs.enablePostiz && !cliArgs.noUpload && !cliArgs.dryRun) {
    console.log(`Postiz: enabled (response written to ${postizResponsePath})`);
  } else {
    console.log("Postiz: skipped");
  }
}

export async function main() {
  try {
    const args = parseArgs();
    await runDraftFlow(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
