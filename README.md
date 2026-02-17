# jk-archivist-tiktok-skill

## What this repo does

Generates a deterministic 6-slide TikTok intro slideshow plus caption from a contract-first skill definition. The current implementation covers local rendering + verification + outbox writing. Postiz upload/draft creation remains Phase 4.

## Prereqs

- Node.js 20+
- Python 3.10+
- Pillow (installed via `requirements.txt`)

Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

## Repository layout

```text
.
├── SKILL.md
├── _meta.json
├── scripts/           # stable CLI wrappers
├── src/
│   ├── node/          # Node orchestration + contract logic
│   └── python/        # Pillow renderer + verifier
├── tests/
│   ├── node/
│   └── python/
├── examples/
├── tools/
└── docs/
```

## Environment variables (for Postiz later)

- `POSTIZ_BASE_URL` (default: `https://api.postiz.com/public/v1`)
- `POSTIZ_API_KEY`
- `POSTIZ_TIKTOK_INTEGRATION_ID`

Optional local font override:

- `TIKTOK_FONT_PATH` (absolute `.ttf` path)

## Run

```bash
node scripts/tiktok-intro-draft.mjs
```

## Outputs

Current output path:

- `outbox/tiktok/intro/YYYY-MM-DD/`
- `outbox/tiktok/intro/YYYY-MM-DD/slides/slide_01.png` ... `slide_06.png`
- `outbox/tiktok/intro/YYYY-MM-DD/caption.txt`
- `outbox/tiktok/intro/YYYY-MM-DD/_slide_spec.json` (render input snapshot)

## Local renderer + verifier commands

Render only:

```bash
python3 scripts/render_slides_pillow.py --spec examples/sample-slide-spec.json --out outbox/_tmp_slides --font /absolute/path/to/font.ttf
```

Verify slides:

```bash
python3 scripts/verify_slides.py --dir outbox/_tmp_slides
```

## Tests

```bash
npm test
```

## Architecture

See `docs/ARCHITECTURE.md` for the flow from Node wrappers to Python modules.

## Postiz (Phase 4)

Postiz upload and draft creation are intentionally deferred to Phase 4.
