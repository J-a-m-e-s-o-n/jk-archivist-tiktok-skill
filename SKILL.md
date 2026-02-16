# JK Archivist TikTok Skill Contract

## Objective

Generate a deterministic 6-slide TikTok intro slideshow (PNG) + caption and (optionally) upload as a TikTok draft/private post using Postiz. Human publishes manually after selecting trending sound.

## Hard Requirements

- Exactly 6 slides
- 1024x1536 portrait
- PNG output format
- Large readable text with safe margins
- Draft/private upload via Postiz must use:
  - `privacy_level = SELF_ONLY`
  - `content_posting_method = UPLOAD`

## Slide Copy (Exact)

1. The trading card market runs on messy data.
2. Prices fragment. Condition drifts. Signals lie.
3. Collectors make real decisions on incomplete info.
4. JK Index = market intelligence for TCGs.
5. Truth first. No guessing. Built in public.
6. Alpha today. Compounding weekly. Brick by brick. 👑🧱

## Caption Template (Exact)

TCG prices look certain — until you zoom in.
JK Index is building the truth layer: clean IDs, real comps, market signals.
Follow if you want collector-first market intelligence. 👑🧱

#pokemon #tcg #cardcollecting #marketdata #startup

## Outputs

Expected output layout (contract target):

```text
outbox/tiktok/intro/YYYY-MM-DD/
  slides/slide_01.png ... slide_06.png
  caption.txt
  postiz_response.json (optional)
```

## Never Do

- No token mentions
- No `$`
- No buy/sell language
- No predictions
- No copyrighted character art
- No unverified superlatives (e.g., "guaranteed", "most accurate")
