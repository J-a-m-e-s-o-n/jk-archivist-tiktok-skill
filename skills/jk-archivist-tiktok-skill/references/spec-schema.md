# Spec Schema

`--spec` accepts a JSON object:

```json
{
  "slides": ["line1", "line2", "line3", "line4", "line5", "line6"],
  "caption": "Optional caption override",
  "template": "intro",
  "style": {
    "preset": "default"
  }
}
```

## Fields

- `slides` (required): exactly 6 non-empty strings.
- `caption` (optional): overrides default caption output.
- `template` (optional): metadata label for source tracking.
- `style.preset` (optional): one of:
  - `default`
  - `high-contrast`
  - `clean`
  - `midnight`

## CLI precedence

1. `--spec` (highest)
2. `--topic`
3. `--template`
4. default JK preset
