# Troubleshooting

## `Missing dependency: Pillow`

Install:

```bash
python3 -m pip install -r requirements.txt
```

## `No usable font found`

Set:

```bash
export TIKTOK_FONT_PATH=/absolute/path/to/font.ttf
```

## `Spec must contain exactly 6 slides`

Validate your JSON shape:

```json
{
  "slides": ["...", "...", "...", "...", "...", "..."]
}
```

## `Expected slide missing after render`

- Re-run renderer command directly
- Check write permissions under `outbox/`
- Confirm `python3` is available on PATH

## Verification failures

If filenames or dimensions mismatch, delete stale outputs and regenerate:

```bash
rm -rf outbox/_tmp_slides
python3 scripts/render_slides_pillow.py --spec examples/sample-slide-spec.json --out outbox/_tmp_slides --font /absolute/path/to/font.ttf
python3 scripts/verify_slides.py --dir outbox/_tmp_slides
```
