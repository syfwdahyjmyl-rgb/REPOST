/** Core domain types for repost tracking.
 *
 * A provider may request an action, but only a provider verification or an
 * explicit user attestation can move an item to `removed`. This keeps the
 * domain honest when an integration cannot remove reposts through an API.
 */

export const REPOST_STATUSES = [
  "pending",
  "manual_required",
  "removal_requested",
  "removed",
] as const;

export type RepostStatus = (typeof REPOST_STATUSES)[number];

export interface RepostRecord {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  status: RepostStatus;
  source?: string;
  note?: string;
  updatedAt: string;
  verification?: RemovalVerification;
}

export interface RemovalVerification {
  method: "provider" | "manual";
  verifiedAt: string;
  evidence?: string;
}

export interface RepostRemovalProvider {
  /** Stable provider name, suitable for logs and UI. */
  readonly name: string;
  /** Providers expose read access separately from mutation. */
  listReposts(): Promise<readonly RepostRecord[]>;
  /**
   * Ask the provider to remove a repost. A provider must return a verified
   * result before the domain marks an item as removed; returning `accepted`
   * is deliberately not enough.
   */
  requestRemoval(repostId: string): Promise<RemovalRequestResult>;
  verifyRemoval(repostId: string): Promise<RemovalVerificationResult>;
}

export type RemovalRequestResult =
  | { status: "accepted"; requestId: string; verified: false }
  | { status: "manual_required"; reason: string; verified: false }
  | { status: "removed"; requestId?: string; verified: true; verifiedAt: string };

export type RemovalVerificationResult =
  | { status: "removed"; verified: true; verifiedAt: string; evidence?: string }
  | { status: "not_removed"; verified: false; reason: string };

export interface ManualCompletionInput {
  repostId: string;
  confirmed: boolean;
  confirmedAt?: string;
  evidence?: string;
}

export interface ManualCompletionResult {
  ok: true;
  record: RepostRecord;
}

export interface ValidationFailure {
  ok: false;
  code: "invalid_id" | "not_confirmed" | "invalid_timestamp" | "invalid_evidence" | "invalid_transition";
  message: string;
}
