import { RepostRecord, REPOST_STATUSES, RepostStatus } from "./domain";
import { validateTikTokUrl } from "./manual-workflow";

const REQUIRED_COLUMNS = ["id", "title", "author", "createdAt"] as const;
const MAX_CSV_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 5000;

export interface CsvImportError {
  row: number;
  message: string;
}

export interface CsvImportResult {
  records: RepostRecord[];
  errors: CsvImportError[];
}

function parseRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    if (quoted) {
      if (char === '"' && csv[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (quoted) throw new Error("Unclosed quoted field.");
  row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function cleanCell(value: string, max = 500): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function isIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function importRepostsCsv(input: string | Uint8Array): CsvImportResult {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input).byteLength : input.byteLength;
  if (bytes > MAX_CSV_BYTES) return { records: [], errors: [{ row: 0, message: "CSV is too large." }] };
  const text = typeof input === "string" ? input.replace(/^\uFEFF/, "") : new TextDecoder().decode(input).replace(/^\uFEFF/, "");
  let rows: string[][];
  try {
    rows = parseRows(text);
  } catch (error) {
    return { records: [], errors: [{ row: 0, message: error instanceof Error ? error.message : "Invalid CSV." }] };
  }
  if (!rows.length) return { records: [], errors: [{ row: 1, message: "CSV has no header row." }] };
  const headers = rows[0].map((header) => cleanCell(header, 64));
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const missing = REQUIRED_COLUMNS.filter((column) => !headerIndex.has(column));
  if (missing.length) return { records: [], errors: [{ row: 1, message: `Missing columns: ${missing.join(", ")}.` }] };

  const records: RepostRecord[] = [];
  const errors: CsvImportError[] = [];
  const seenIds = new Set<string>();
  const get = (cells: string[], name: string) => cleanCell(cells[headerIndex.get(name) ?? -1] ?? "");
  if (rows.length - 1 > MAX_ROWS) errors.push({ row: 0, message: `CSV contains more than ${MAX_ROWS} rows.` });
  for (const [offset, cells] of rows.slice(1, MAX_ROWS + 1).entries()) {
    const rowNumber = offset + 2;
    const id = get(cells, "id");
    const title = get(cells, "title");
    const author = get(cells, "author");
    const createdAt = get(cells, "createdAt");
    const statusText = get(cells, "status") || "pending";
    const status = statusText as RepostStatus;
    const verificationMethod = get(cells, "verificationMethod");
    const verifiedAt = get(cells, "verifiedAt");
    const source = get(cells, "source");
    if (!id || !title || !author || !createdAt) {
      errors.push({ row: rowNumber, message: "id, title, author, and createdAt are required." });
      continue;
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(id) || !isIsoDate(createdAt)) {
      errors.push({ row: rowNumber, message: "Invalid id or createdAt." });
      continue;
    }
    if (source && !validateTikTokUrl(source)) {
      errors.push({ row: rowNumber, message: "source must be an HTTPS TikTok URL." });
      continue;
    }
    if (seenIds.has(id)) {
      errors.push({ row: rowNumber, message: "Duplicate repost id." });
      continue;
    }
    seenIds.add(id);
    if (!(REPOST_STATUSES as readonly string[]).includes(status)) {
      errors.push({ row: rowNumber, message: `Unknown status: ${statusText}.` });
      continue;
    }
    if (status === "removed" && (verificationMethod !== "manual" && verificationMethod !== "provider" || !isIsoDate(verifiedAt))) {
      errors.push({ row: rowNumber, message: "Removed rows require verificationMethod and verifiedAt." });
      continue;
    }
    const updatedAt = get(cells, "updatedAt") || createdAt;
    records.push({
      id,
      title,
      author,
      createdAt: new Date(createdAt).toISOString(),
      status,
      updatedAt: isIsoDate(updatedAt) ? new Date(updatedAt).toISOString() : new Date(createdAt).toISOString(),
      ...(source ? { source } : {}),
      ...(get(cells, "note") ? { note: get(cells, "note") } : {}),
      ...(status === "removed" ? {
        verification: {
          method: verificationMethod as "manual" | "provider",
          verifiedAt: new Date(verifiedAt).toISOString(),
          ...(get(cells, "verificationEvidence") ? { evidence: get(cells, "verificationEvidence") } : {}),
        },
      } : {}),
    });
  }
  return { records, errors };
}

function csvCell(value: string): string {
  // Prevent spreadsheet formula execution while keeping round-trip semantics.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function exportRepostsCsv(records: readonly RepostRecord[]): string {
  const headers = ["id", "title", "author", "createdAt", "status", "updatedAt", "source", "note", "verificationMethod", "verifiedAt", "verificationEvidence"];
  const lines = [headers.join(",")];
  for (const record of records) {
    lines.push([
      record.id,
      record.title,
      record.author,
      record.createdAt,
      record.status,
      record.updatedAt,
      record.source ?? "",
      record.note ?? "",
      record.verification?.method ?? "",
      record.verification?.verifiedAt ?? "",
      record.verification?.evidence ?? "",
    ].map(csvCell).join(","));
  }
  return `${lines.join("\r\n")}\r\n`;
}

/** Backwards-compatible concise names for consumers of the utility module. */
export const parseRepostsCsv = importRepostsCsv;
export const serializeRepostsCsv = exportRepostsCsv;
