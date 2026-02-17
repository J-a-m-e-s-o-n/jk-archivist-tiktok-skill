import { spawnSync } from "node:child_process";
import { buildCaption } from "./write-caption.mjs";
import { renderSlides } from "./render-slides.mjs";
import { resolveSlides } from "./slide-copy.mjs";
import { postizUpload } from "./postiz-upload.mjs";
import { postizCreateDraft } from "./postiz-create-draft.mjs";
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

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    specPath: undefined,
    topic: undefined,
    enablePostiz: false,
  };
  for (let idx = 0; idx < argv.length; idx += 1) {
    const token = argv[idx];
    if (token === "--postiz") {
      args.enablePostiz = true;
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

  ensureDir(slidesDir);
  const fontPath = resolveFontPath();
  const slides = resolveSlides({
    specPath: cliArgs.specPath,
    topic: cliArgs.topic,
  });
  const slidePaths = renderSlides({ slidesDir, fontPath, slides });

  const caption = buildCaption();
  writeText(captionPath, `${caption}\n`);

  if (slidePaths.length !== 6) {
    throw new Error(`Expected 6 slides, got: ${slidePaths.length}`);
  }
  verifySlides(slidesDir);

  let postizResponsePath;
  if (cliArgs.enablePostiz) {
    postizResponsePath = await uploadToPostiz({
      caption,
      slidePaths,
      outDir,
    });
  }

  console.log("");
  console.log("Draft generation complete.");
  console.log(`Output folder: ${outDir}`);
  if (cliArgs.topic) {
    console.log(`Slide mode: generated from topic "${cliArgs.topic}"`);
  } else if (cliArgs.specPath) {
    console.log(`Slide mode: custom spec (${cliArgs.specPath})`);
  } else {
    console.log("Slide mode: default preset copy");
  }
  if (cliArgs.enablePostiz) {
    console.log(`Postiz: enabled (response written to ${postizResponsePath})`);
  } else {
    console.log("Postiz: disabled (use --postiz to enable optional draft upload)");
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
