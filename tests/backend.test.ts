import { strict as assert } from "node:assert";
import { test } from "node:test";
import { importRepostsCsv, exportRepostsCsv } from "../lib/csv";
import { completeManualRemoval, validateTikTokUrl } from "../lib/manual-workflow";
import { DemoRepostRemovalProvider } from "../lib/providers/demo";
import { RepostRecord } from "../lib/domain";
import { isSameOrigin } from "../lib/security/request";

const base: RepostRecord = {
  id: "r-1",
  title: "A clip",
  author: "@creator",
  createdAt: "2025-01-01T00:00:00.000Z",
  status: "manual_required",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

test("manual workflow requires explicit confirmation", () => {
  const result = completeManualRemoval(base, { repostId: base.id, confirmed: false, confirmedAt: "2025-01-01T00:01:00Z" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "not_confirmed");
});

test("manual workflow records verified completion", () => {
  const result = completeManualRemoval(base, { repostId: base.id, confirmed: true, confirmedAt: "2025-01-01T00:01:00Z", evidence: "Checked in app" }, new Date("2025-01-01T00:02:00Z"));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.record.status, "removed");
    assert.equal(result.record.verification?.method, "manual");
  }
});

test("demo provider never fakes deletion", async () => {
  const provider = new DemoRepostRemovalProvider();
  const result = await provider.requestRemoval("demo-001");
  assert.equal(result.status, "manual_required");
  assert.equal(result.verified, false);
});

test("URL validation rejects lookalike hosts and non-HTTPS links", () => {
  assert.equal(validateTikTokUrl("https://www.tiktok.com/@creator/video/123"), true);
  assert.equal(validateTikTokUrl("http://www.tiktok.com/@creator/video/123"), false);
  assert.equal(validateTikTokUrl("https://tiktok.com.evil.example/video/123"), false);
});

test("state-changing requests reject a foreign Origin", () => {
  assert.equal(isSameOrigin(new Request("http://localhost:3000/api/reposts", { headers: { origin: "https://evil.example" } })), false);
  assert.equal(isSameOrigin(new Request("http://localhost:3000/api/reposts", { headers: { origin: "http://localhost:3000" } })), true);
});

test("CSV round trips and rejects unverified removed rows", () => {
  const csv = exportRepostsCsv([base]);
  const parsed = importRepostsCsv(csv);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.records[0].id, base.id);

  const unsafe = "id,title,author,createdAt,status\nr-2,Nope,@x,2025-01-01T00:00:00Z,removed\n";
  assert.equal(importRepostsCsv(unsafe).records.length, 0);
  assert.equal(importRepostsCsv(unsafe).errors.length, 1);
});
