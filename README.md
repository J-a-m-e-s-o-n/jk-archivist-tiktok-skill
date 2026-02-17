# jk-archivist-tiktok-skill

## What this repo does

Scaffolds a contract-first skill for generating a deterministic 6-slide TikTok intro slideshow and caption, with optional draft/private upload via Postiz. Phase 1 is docs and skeleton only (no runtime implementation yet).

## Prereqs

- Node.js (for script entrypoints)
- Python 3 (Pillow will be required in a later phase)

## Environment variables (for Postiz later)

- `POSTIZ_BASE_URL` (default: `https://api.postiz.com/public/v1`)
- `POSTIZ_API_KEY`
- `POSTIZ_TIKTOK_INTEGRATION_ID`

## Run

```bash
node scripts/tiktok-intro-draft.mjs
```

Optional font override:

- `TIKTOK_FONT_PATH` (absolute `.ttf` path)

## Outputs

Phase 3 writes outputs under:

- `outbox/tiktok/intro/YYYY-MM-DD/`
- `outbox/tiktok/intro/YYYY-MM-DD/slides/slide_01.png` ... `slide_06.png`
- `outbox/tiktok/intro/YYYY-MM-DD/caption.txt`

## Phase 2 local dev (slides only)

Install Pillow:

```bash
python3 -m pip install pillow
```

Render slides locally:

```bash
python3 scripts/render_slides_pillow.py --spec outbox/_tmp_slide_spec.json --out outbox/_tmp_slides --font /absolute/path/to/font.ttf
```

Verify generated slides:

```bash
python3 scripts/verify_slides.py --dir outbox/_tmp_slides
```

## Postiz (Phase 4)

Postiz upload and draft creation are intentionally deferred to Phase 4.
