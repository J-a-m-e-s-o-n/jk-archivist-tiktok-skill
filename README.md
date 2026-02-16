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

## Run (placeholder)

```bash
node scripts/tiktok-intro-draft.mjs
```

## Outputs

When implemented, outputs will be written under:

- `outbox/tiktok/intro/YYYY-MM-DD/`
