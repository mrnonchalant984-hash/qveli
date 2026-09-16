import { NextRequest } from "next/server";
import { ok, bad, unauthorized, serverError } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth";
import { searchWeb } from "@/lib/web-search";

export async function GET(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return unauthorized();
    const q = new URL(req.url).searchParams.get("q")?.trim() || "";
    if (q.length < 2) return bad("Search query must be at least 2 characters.");
    const results = await searchWeb(q, 10);
    return ok({ query: q, results });
  } catch { return serverError(); }
}
