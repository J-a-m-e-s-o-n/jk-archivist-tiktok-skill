import { requireEnv } from "./utils.mjs";

function normalizeBaseUrl(rawUrl) {
  return rawUrl.replace(/\/+$/, "");
}

export async function postizCreateDraft({ caption, mediaRefs }) {
  const baseUrl = normalizeBaseUrl(
    process.env.POSTIZ_BASE_URL || "https://api.postiz.com/public/v1"
  );
  const apiKey = requireEnv("POSTIZ_API_KEY");
  const integrationId = requireEnv("POSTIZ_TIKTOK_INTEGRATION_ID");

  if (!Array.isArray(mediaRefs) || mediaRefs.length === 0) {
    throw new Error("postizCreateDraft requires at least one uploaded media reference.");
  }

  const payload = {
    integrationId,
    caption,
    media: mediaRefs,
    privacy_level: "SELF_ONLY",
    content_posting_method: "UPLOAD",
  };

  const response = await fetch(`${baseUrl}/posts`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Postiz draft creation failed (${response.status}): ${body}`);
  }

  return response.json();
}
