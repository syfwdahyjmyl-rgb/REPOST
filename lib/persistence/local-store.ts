import { promises as fs } from "node:fs";
import path from "node:path";
import { RepostRecord, REPOST_STATUSES } from "../domain";
import { validateTikTokUrl } from "../manual-workflow";

export interface RepostStore {
  list(): Promise<RepostRecord[]>;
  get(id: string): Promise<RepostRecord | null>;
  replace(records: readonly RepostRecord[]): Promise<RepostRecord[]>;
  update(id: string, record: RepostRecord): Promise<RepostRecord>;
}

const EMPTY: RepostRecord[] = [];

function clone(record: RepostRecord): RepostRecord {
  return JSON.parse(JSON.stringify(record)) as RepostRecord;
}

function validateRecord(record: RepostRecord): void {
  if (!record || typeof record.id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(record.id)) {
    throw new Error("Invalid repost id.");
  }
  if (typeof record.title !== "string" || !record.title.trim() || record.title.length > 500) {
    throw new Error("Invalid repost title.");
  }
  if (typeof record.author !== "string" || !record.author.trim() || record.author.length > 200) {
    throw new Error("Invalid repost author.");
  }
  if (typeof record.createdAt !== "string" || Number.isNaN(Date.parse(record.createdAt))) {
    throw new Error("Invalid repost createdAt.");
  }
  if (typeof record.updatedAt !== "string" || Number.isNaN(Date.parse(record.updatedAt))) {
    throw new Error("Invalid repost updatedAt.");
  }
  if (record.source !== undefined && !validateTikTokUrl(record.source)) {
    throw new Error("Invalid TikTok source URL.");
  }
  if (!REPOST_STATUSES.includes(record.status)) throw new Error("Invalid repost status.");
  if (record.status === "removed" && (!record.verification?.verifiedAt || !Number.isFinite(Date.parse(record.verification.verifiedAt)) || !["manual", "provider"].includes(record.verification.method))) {
    throw new Error("Removed records require verification.");
  }
}

/** JSON persistence for local/demo deployments. No destructive delete operation is exposed. */
export class LocalRepostStore implements RepostStore {
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(private readonly filePath = path.join(process.cwd(), ".data", "reposts.json")) {}

  async list(): Promise<RepostRecord[]> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is RepostRecord => {
        try { validateRecord(item); return true; } catch { return false; }
      }).map(clone);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return EMPTY.map(clone);
      throw error;
    }
  }

  async get(id: string): Promise<RepostRecord | null> {
    const record = (await this.list()).find((item) => item.id === id);
    return record ? clone(record) : null;
  }

  async replace(records: readonly RepostRecord[]): Promise<RepostRecord[]> {
    const seen = new Set<string>();
    const next = records.map((record) => {
      validateRecord(record);
      if (seen.has(record.id)) throw new Error("Duplicate repost id.");
      seen.add(record.id);
      return clone(record);
    });
    await this.enqueueWrite(next);
    return next.map(clone);
  }

  async update(id: string, record: RepostRecord): Promise<RepostRecord> {
    if (record.id !== id) throw new Error("Record id does not match route id.");
    validateRecord(record);
    const records = await this.list();
    const index = records.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Repost not found.");
    records[index] = clone(record);
    await this.enqueueWrite(records);
    return clone(record);
  }

  private enqueueWrite(records: readonly RepostRecord[]): Promise<void> {
    const run = this.writeQueue.then(async () => {
      const directory = path.dirname(this.filePath);
      await fs.mkdir(directory, { recursive: true });
      const temporary = `${this.filePath}.${process.pid}.tmp`;
      await fs.writeFile(temporary, `${JSON.stringify(records, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
      await fs.rename(temporary, this.filePath);
    });
    this.writeQueue = run.catch(() => undefined);
    return run;
  }
}

export const localRepostStore = new LocalRepostStore();
