import fs from "node:fs";
import { buildCaption } from "./write-caption.mjs";
import {
  DEFAULT_SLIDES,
  validateSlides,
  resolveSlides,
  listTemplates,
} from "./slide-copy.mjs";

export const STYLE_PRESETS = {
  default: {
    safe_margins: { left: 90, right: 90, top: 180, bottom_reserved: 260 },
    background: { base: "#2A124A", gradient_strength: 1.0, texture_density: 0.06 },
    text: { color: "#FFFFFF", shadow_color: "#000000", min_size: 40, max_size: 70 },
  },
  "high-contrast": {
    safe_margins: { left: 90, right: 90, top: 170, bottom_reserved: 270 },
    background: { base: "#1A0C36", gradient_strength: 1.2, texture_density: 0.04 },
    text: { color: "#FFFFFF", shadow_color: "#000000", min_size: 42, max_size: 72 },
  },
  clean: {
    safe_margins: { left: 100, right: 100, top: 190, bottom_reserved: 250 },
    background: { base: "#30185A", gradient_strength: 0.8, texture_density: 0.02 },
    text: { color: "#F8F8FF", shadow_color: "#111111", min_size: 38, max_size: 68 },
  },
  midnight: {
    safe_margins: { left: 90, right: 90, top: 180, bottom_reserved: 260 },
    background: { base: "#100820", gradient_strength: 1.1, texture_density: 0.05 },
    text: { color: "#FFFFFF", shadow_color: "#050505", min_size: 40, max_size: 70 },
  },
};

function assertString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function loadJsonFile(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Spec file not found: ${path}`);
  }
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not parse JSON spec: ${message}`);
  }
}

function resolveStylePreset(styleName) {
  if (!styleName) return "default";
  if (!STYLE_PRESETS[styleName]) {
    throw new Error(
      `Unknown style '${styleName}'. Allowed: ${Object.keys(STYLE_PRESETS).join(", ")}`
    );
  }
  return styleName;
}

function resolveTemplate(templateName) {
  if (!templateName) return "intro";
  if (!listTemplates().includes(templateName)) {
    throw new Error(
      `Unknown template '${templateName}'. Allowed: ${listTemplates().join(", ")}`
    );
  }
  return templateName;
}

export function loadPackagerSpec(cliArgs) {
  const template = resolveTemplate(cliArgs.template);
  const stylePreset = resolveStylePreset(cliArgs.stylePreset);

  // Precedence: --spec > --topic > --template > default preset.
  if (cliArgs.specPath) {
    const raw = loadJsonFile(cliArgs.specPath);
    const slides = validateSlides(raw.slides, `Spec (${cliArgs.specPath})`);
    const caption = typeof raw.caption === "string" ? raw.caption.trim() : buildCaption();
    const styleName = resolveStylePreset(raw?.style?.preset || stylePreset);
    return {
      slides,
      caption,
      template: raw.template || template,
      stylePreset: styleName,
      style: STYLE_PRESETS[styleName],
      source: `spec:${cliArgs.specPath}`,
    };
  }

  if (cliArgs.topic) {
    const topic = assertString(cliArgs.topic, "--topic");
    const slides = resolveSlides({ topic, template });
    return {
      slides,
      caption: buildCaption(),
      template,
      stylePreset,
      style: STYLE_PRESETS[stylePreset],
      source: `topic:${topic}`,
    };
  }

  if (cliArgs.template) {
    const slides = resolveSlides({ template });
    return {
      slides,
      caption: buildCaption(),
      template,
      stylePreset,
      style: STYLE_PRESETS[stylePreset],
      source: `template:${template}`,
    };
  }

  return {
    slides: [...DEFAULT_SLIDES],
    caption: buildCaption(),
    template: "jk-default",
    stylePreset: "default",
    style: STYLE_PRESETS.default,
    source: "preset:jk-default",
  };
}
