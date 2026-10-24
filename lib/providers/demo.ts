import {
  RepostRecord,
  RepostRemovalProvider,
  RemovalRequestResult,
  RemovalVerificationResult,
} from "../domain";

const DEMO_REPOSTS: readonly RepostRecord[] = [
  {
    id: "demo-001",
    title: "Morning routine",
    author: "@example_creator",
    createdAt: "2025-01-12T08:30:00.000Z",
    status: "manual_required",
    source: "demo",
    updatedAt: "2025-01-12T08:30:00.000Z",
  },
  {
    id: "demo-002",
    title: "Street food tour",
    author: "@city_guides",
    createdAt: "2025-01-18T17:05:00.000Z",
    status: "pending",
    source: "demo",
    updatedAt: "2025-01-18T17:05:00.000Z",
  },
];

/** A safe provider for local development. It never pretends that deletion happened. */
export class DemoRepostRemovalProvider implements RepostRemovalProvider {
  readonly name = "demo";

  async listReposts(): Promise<readonly RepostRecord[]> {
    return DEMO_REPOSTS.map((record) => ({ ...record }));
  }

  async requestRemoval(_repostId: string): Promise<RemovalRequestResult> {
    return {
      status: "manual_required",
      verified: false,
      reason: "Demo mode cannot access TikTok or remove reposts. Follow the manual steps in the app.",
    };
  }

  async verifyRemoval(_repostId: string): Promise<RemovalVerificationResult> {
    return {
      status: "not_removed",
      verified: false,
      reason: "Demo mode has no removal API. Ask the user to confirm the result manually.",
    };
  }
}

export const demoProvider = new DemoRepostRemovalProvider();
