import fs from "node:fs";
import { basename } from "node:path";
import { requireEnv } from "./utils.mjs";

function normalizeBaseUrl(rawUrl) {
  return rawUrl.replace(/\/+$/, "");
}

function extractUploadedMediaRef(json) {
  const candidates = [
    json?.url,
    json?.fileUrl,
    json?.data?.url,
    json?.data?.fileUrl,
    json?.result?.url,
    json?.id,
    json?.data?.id,
    json?.result?.id,
  ];
  const value = candidates.find((item) => typeof item === "string" && item.length > 0);
  if (!value) {
    throw new Error("Upload succeeded but response did not include a media URL or ID.");
  }
  return value;
}

export async function postizUpload({ filePath, mimeType = "image/png" }) {
  const baseUrl = normalizeBaseUrl(
    process.env.POSTIZ_BASE_URL || "https://api.postiz.com/public/v1"
  );
  const apiKey = requireEnv("POSTIZ_API_KEY");

  if (!fs.existsSync(filePath)) {
    throw new Error(`Cannot upload missing file: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: mimeType }), basename(filePath));

  const response = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Postiz upload failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  return {
    mediaRef: extractUploadedMediaRef(json),
    raw: json,
  };
}
