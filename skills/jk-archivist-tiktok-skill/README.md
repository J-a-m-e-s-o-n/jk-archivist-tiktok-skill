# jk-archivist-tiktok-skill (ClawHub bundle)

## What this skill does

Creates deterministic TikTok intro assets:

- 6 PNG slides (`1024x1536`)
- exact caption contract text
- output verification for slide names and dimensions

## Install dependencies

```bash
python3 -m pip install -r requirements.txt
```

## Run

```bash
node scripts/tiktok-intro-draft.mjs
```

Optional font override:

- `TIKTOK_FONT_PATH` (absolute `.ttf` path)

Use custom 6-slide copy:

```bash
node scripts/tiktok-intro-draft.mjs --spec /absolute/path/to/spec.json
```

Generate deterministic slide copy from a topic:

```bash
node scripts/tiktok-intro-draft.mjs --topic "your topic"
```

Optional Postiz draft upload (requires env vars):

```bash
node scripts/tiktok-intro-draft.mjs --postiz
```

## Output

```text
outbox/tiktok/intro/YYYY-MM-DD/
  slides/slide_01.png ... slide_06.png
  caption.txt
  _slide_spec.json
```

## Validation

```bash
npm test
python3 scripts/verify_slides.py --dir outbox/_tmp_slides
```

## Publish Checklist

- `SKILL.md` includes YAML frontmatter with `name` + `description`
- no secrets committed (`.env`, API keys)
- `node scripts/tiktok-intro-draft.mjs` succeeds
- `npm test` succeeds
- contract copy in slides/caption remains exact

## Optional Postiz Env Vars

- `POSTIZ_BASE_URL` (default: `https://api.postiz.com/public/v1`)
- `POSTIZ_API_KEY`
- `POSTIZ_TIKTOK_INTEGRATION_ID`
