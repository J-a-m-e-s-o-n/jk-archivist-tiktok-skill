# Architecture

This repository uses a hybrid layout:

- `scripts/` contains stable CLI entrypoints.
- `src/node/` contains Node orchestration and contract logic.
- `src/python/` contains deterministic rendering and verification.

## Flow

1. `node scripts/tiktok-intro-draft.mjs`
2. Wrapper calls `src/node/tiktok-intro-draft.mjs`.
3. Node writes `_slide_spec.json` and calls `python3 scripts/render_slides_pillow.py`.
4. Python wrapper calls `src/python/render_slides_pillow.py` to render 6 PNG slides.
5. Node writes `caption.txt` and calls `python3 scripts/verify_slides.py`.
6. Python wrapper calls `src/python/verify_slides.py` for output validation.

## Design Notes

- Deterministic rendering: same spec + font yields stable output.
- Contract content is centralized in `SKILL.md` and mirrored in runtime constants.
- `outbox/` is runtime-only and ignored by git.
