import { exportRepostsCsv } from "../../../../lib/csv";
import { localRepostStore } from "../../../../lib/persistence";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const csv = exportRepostsCsv(await localRepostStore.list());
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="reposts.csv"',
      "cache-control": "no-store",
    },
  });
}
