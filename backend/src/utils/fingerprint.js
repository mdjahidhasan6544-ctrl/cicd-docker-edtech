import crypto from "crypto";

function normalizeFingerprint(input) {
  if (typeof input === "string") {
    return input.trim();
  }

  if (input && typeof input === "object") {
    const ordered = Object.keys(input)
      .sort()
      .reduce((result, key) => {
        result[key] = input[key];
        return result;
      }, {});

    return JSON.stringify(ordered);
  }

  return "";
}

export function hashFingerprint(input) {
  const normalized = normalizeFingerprint(input);

  if (!normalized) {
    return "";
  }

  return crypto.createHash("sha256").update(normalized).digest("hex");
}
