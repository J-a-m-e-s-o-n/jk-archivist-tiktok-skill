# jk-archivist-tiktok-skill (ClawHub bundle)

## What this skill does

Creates deterministic TikTok slideshow assets:

- 6 PNG slides (`1024x1536`)
- custom or template-driven slide copy
- caption generation (default contract, overridable via spec)
- output verification for slide names and dimensions
- preflight policy checks
- review artifacts (`review.md` + contact sheet)
- optional Postiz draft upload

## Install dependencies

```bash
python3 -m pip install -r requirements.txt
```

## Run

Default preset mode:

```bash
node scripts/tiktok-intro-draft.mjs
```

## Input modes

Use custom 6-slide copy from JSON spec:

```bash
node scripts/tiktok-intro-draft.mjs --spec /absolute/path/to/spec.json
```

Generate deterministic slide copy from a topic:

```bash
node scripts/tiktok-intro-draft.mjs --topic "your topic"
```

Use built-in narrative template:

```bash
node scripts/tiktok-intro-draft.mjs --template educational
```

Choose visual style:

```bash
node scripts/tiktok-intro-draft.mjs --style high-contrast
```

Template options:

- `intro`
- `educational`
- `product-update`
- `announcement`

Style options:

- `default`
- `high-contrast`
- `clean`
- `midnight`

### CLI precedence

Input resolution order is:

1. `--spec`
2. `--topic`
3. `--template`
4. bundled preset copy

Other run modes:

- `--dry-run` (write spec/review metadata only; skip render/upload)
- `--postiz-only` (reuse existing rendered slides; upload path only)
- `--no-upload` (force local-only run even when `--postiz` is present)

## Optional Postiz upload

Enable optional draft upload:

```bash
node scripts/tiktok-intro-draft.mjs --postiz
```

Required env vars:

- `POSTIZ_API_KEY`
- `POSTIZ_TIKTOK_INTEGRATION_ID`

Optional env vars:

- `POSTIZ_BASE_URL` (default: `https://api.postiz.com/public/v1`)
- `TIKTOK_FONT_PATH` (absolute `.ttf` path)

## Output

```text
outbox/tiktok/intro/YYYY-MM-DD/
  _slide_spec.json
  caption.txt
  slides/slide_01.png ... slide_06.png
  review/review.md
  review/contact_sheet.png
  postiz_response.json (optional, when --postiz succeeds)
```

## Validation

```bash
npm test
python3 scripts/verify_slides.py --dir outbox/tiktok/intro/YYYY-MM-DD/slides
```

## Publish Checklist

- `SKILL.md` includes YAML frontmatter with `name` + `description`
- no secrets committed (`.env`, API keys)
- `node scripts/tiktok-intro-draft.mjs` succeeds
- `npm test` succeeds
- `npm run validate:bundle` succeeds

Bundle utility commands (recommended before ClawHub upload):

```bash
npm run validate:bundle
npm run pack
```

This writes:

- `dist/jk-archivist-tiktok-skill.zip`

## Spec example

```json
{
  "slides": [
    "Slide line 1",
    "Slide line 2",
    "Slide line 3",
    "Slide line 4",
    "Slide line 5",
    "Slide line 6"
  ],
  "caption": "Optional custom caption",
  "template": "intro",
  "style": {
    "preset": "default"
  }
}
```

See also:

- `SKILL.md`
- `references/spec-schema.md`
- `references/setup.md`
- `references/outputs-and-validation.md`
- `references/troubleshooting.md`
- `references/publish-checklist.md`
