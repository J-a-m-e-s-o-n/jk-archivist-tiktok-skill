# Publish Checklist

## Before packaging

- Run: `npm test`
- Run: `node scripts/validate-bundle.mjs`
- Confirm `SKILL.md` frontmatter is present and valid.
- Confirm no secrets in files.

## Build upload zip

```bash
node scripts/pack-skill.mjs
```

Output:

- `dist/jk-archivist-tiktok-skill.zip`

## ClawHub validation pitfalls

- Remove runtime artifacts (`*.pyc`, `__pycache__`, `outbox/` files)
- Keep only text/source files in upload bundle
- Rebuild zip from tracked files after each validation error
