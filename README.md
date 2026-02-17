# TikTok Packager Skill

Deterministic TikTok slideshow + caption packager for agents.  
This repository is the source for the ClawHub/OpenClaw skill bundle in `skills/jk-archivist-tiktok-skill`.

## Start Here

For the full end-user skill guide (all flags, examples, optional Postiz flow), read:

- `skills/jk-archivist-tiktok-skill/README.md`

For the skill contract shown on ClawHub/OpenClaw:

- `skills/jk-archivist-tiktok-skill/SKILL.md`

## What It Does

- Generates exactly 6 portrait PNG slides (`1024x1536`) deterministically
- Builds caption text from preset or context-aware modes
- Supports custom input via spec, topic, template, style, audience, and locale
- Runs preflight policy checks before packaging
- Produces review artifacts (`review.md` + contact sheet)
- Optionally uploads draft posts through Postiz with retry/timeout handling
- Produces clean release zips for SkillHub/ClawHub publishing

## Quickstart

```bash
cd skills/jk-archivist-tiktok-skill
python3 -m pip install -r requirements.txt
node scripts/tiktok-intro-draft.mjs
```

## Common Commands

```bash
# Tests
npm test

# Validate upload bundle cleanliness
npm run validate:bundle

# Build publish zip
npm run pack

# Release prep (version bump + test + pack)
npm run release -- --version 1.2.0
```

## Main Runtime Modes

From `skills/jk-archivist-tiktok-skill`:

```bash
# Custom spec
node scripts/tiktok-intro-draft.mjs --spec /absolute/path/to/spec.json

# Topic -> deterministic slides
node scripts/tiktok-intro-draft.mjs --topic "grading cards"

# Template + style + audience
node scripts/tiktok-intro-draft.mjs --template educational --style clean --audience beginner

# A/B variants
node scripts/tiktok-intro-draft.mjs --ab-test caption-cta

# Optional Postiz draft upload
node scripts/tiktok-intro-draft.mjs --postiz --resume-upload --max-retries 5 --timeout-ms 20000
```

## Output Structure

```text
outbox/tiktok/intro/YYYY-MM-DD/
  _slide_spec.json
  _render_metadata.json
  caption.txt
  slides/slide_01.png ... slide_06.png
  review/review.md
  review/contact_sheet.png
  run_log.json
  upload_state.json (optional)
  postiz_response.json (optional)
```

## Repository Structure

```text
.
├── skills/
│   └── jk-archivist-tiktok-skill/   # publishable bundle
├── scripts/                          # legacy wrappers at repo root
├── src/                              # legacy source at repo root
├── tests/
├── docs/
├── tools/
├── README.md
└── _meta.json
```

## Environment Variables

- `TIKTOK_FONT_PATH` (optional absolute `.ttf` font)
- `POSTIZ_BASE_URL` (optional, default `https://api.postiz.com/public/v1`)
- `POSTIZ_API_KEY` (required for `--postiz`)
- `POSTIZ_TIKTOK_INTEGRATION_ID` (required for `--postiz`)

## Publishing Notes

- SkillHub/ClawHub expects clean text/source bundles.
- Always run `npm run validate:bundle` before `npm run pack`.
- Upload zip generated at:
  - `skills/jk-archivist-tiktok-skill/dist/jk-archivist-tiktok-skill.zip`
