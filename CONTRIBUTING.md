# Contributing

## Setup

- Node.js 20+ recommended
- Python 3.10+ recommended
- Install Python dependency:
  - `python3 -m pip install -r requirements.txt`

## Local Run

- Main flow:
  - `node scripts/tiktok-intro-draft.mjs`
- Optional font override:
  - `export TIKTOK_FONT_PATH=/absolute/path/to/font.ttf`

## Tests

- Node tests:
  - `npm run test:node`
- Python tests:
  - `npm run test:python`
- All tests:
  - `npm test`

## Pull Requests

- Keep changes scoped and deterministic.
- Preserve contract outputs documented in `SKILL.md`.
- Add/update tests for behavior changes.
- Do not commit `outbox/` artifacts or secrets.
