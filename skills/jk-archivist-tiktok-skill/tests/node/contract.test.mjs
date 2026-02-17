import test from "node:test";
import assert from "node:assert/strict";

import { buildCaption } from "../../src/node/write-caption.mjs";
import { EXACT_SLIDES } from "../../src/node/render-slides.mjs";
import { todayISO } from "../../src/node/utils.mjs";
import { generateSlidesFromTopic } from "../../src/node/slide-copy.mjs";

test("caption contract is exact", () => {
  const expected = `TCG prices look certain — until you zoom in.
JK Index is building the truth layer: clean IDs, real comps, market signals.
Follow if you want collector-first market intelligence. 👑🧱

#pokemon #tcg #cardcollecting #marketdata #startup`;
  assert.equal(buildCaption(), expected);
});

test("slide copy count is exactly six", () => {
  assert.equal(EXACT_SLIDES.length, 6);
});

test("todayISO returns local YYYY-MM-DD", () => {
  assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

test("topic mode generates deterministic six lines", () => {
  const slides = generateSlidesFromTopic("Collector confidence");
  assert.equal(slides.length, 6);
  assert.equal(slides[0], "Collector confidence: the current state is noisier than it looks.");
});
