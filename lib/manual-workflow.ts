import {
  ManualCompletionInput,
  ManualCompletionResult,
  RepostRecord,
  ValidationFailure,
} from "./domain";

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const MAX_EVIDENCE_LENGTH = 500;

export function validateRepostId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value.trim());
}

/** Accept only HTTPS links hosted on TikTok, never arbitrary redirect URLs. */
export function validateTikTokUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && (url.hostname === "tiktok.com" || url.hostname.endsWith(".tiktok.com"));
  } catch {
    return false;
  }
}

/**
 * Validate a user-assisted removal. The caller must persist the returned
 * record; this function has no side effects and cannot delete anything.
 */
export function completeManualRemoval(
  record: RepostRecord,
  input: ManualCompletionInput,
  now = new Date(),
): ManualCompletionResult | ValidationFailure {
  if (!validateRepostId(input.repostId) || input.repostId !== record.id) {
    return { ok: false, code: "invalid_id", message: "A valid repost id is required." };
  }
  if (record.status === "removed") {
    return { ok: false, code: "invalid_transition", message: "This repost is already marked removed." };
  }
  if (!input.confirmed) {
    return {
      ok: false,
      code: "not_confirmed",
      message: "Confirm that the repost disappeared in the official app before saving.",
    };
  }
  if (!input.confirmedAt || Number.isNaN(Date.parse(input.confirmedAt))) {
    return { ok: false, code: "invalid_timestamp", message: "A valid confirmation timestamp is required." };
  }
  const confirmedAt = new Date(input.confirmedAt);
  if (confirmedAt.getTime() > now.getTime() + 5 * 60 * 1000) {
    return { ok: false, code: "invalid_timestamp", message: "Confirmation cannot be in the future." };
  }
  const evidence = input.evidence?.trim();
  if (evidence && evidence.length > MAX_EVIDENCE_LENGTH) {
    return { ok: false, code: "invalid_evidence", message: "Evidence note is too long." };
  }

  return {
    ok: true,
    record: {
      ...record,
      status: "removed",
      updatedAt: now.toISOString(),
      verification: {
        method: "manual",
        verifiedAt: confirmedAt.toISOString(),
        ...(evidence ? { evidence } : {}),
      },
    },
  };
}

export function markRemovalRequested(record: RepostRecord, now = new Date()): RepostRecord | ValidationFailure {
  if (record.status === "removed") {
    return { ok: false, code: "invalid_transition", message: "A removed repost cannot be requested again." };
  }
  return { ...record, status: "removal_requested", updatedAt: now.toISOString() };
}

/** Alias used by API consumers that only need a validation pass. */
export function validateManualRemoval(
  record: RepostRecord,
  input: ManualCompletionInput,
  now = new Date(),
): ValidationFailure | null {
  const result = completeManualRemoval(record, input, now);
  if (!result.ok) return result;
  return null;
}
