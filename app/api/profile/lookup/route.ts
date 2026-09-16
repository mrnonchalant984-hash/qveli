import { NextRequest } from "next/server";
import { ok, bad, unauthorized, serverError } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth";

type Suggestion = { name: string; description?: string; url?: string; source: string };

async function wikipedia(q: string): Promise<Suggestion[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=6&namespace=0&format=json&origin=*`;
  const r = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 3600 } });
  if (!r.ok) return [];
  const data = await r.json() as [string, string[], string[], string[]];
  return (data[1] || []).map((name, i) => ({ name, description: data[2]?.[i], url: data[3]?.[i], source: "Wikipedia" }));
}

async function places(q: string): Promise<Suggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&addressdetails=1&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { accept: "application/json", "user-agent": "Qevli/1.0 profile lookup" }, next: { revalidate: 3600 } });
  if (!r.ok) return [];
  const data = await r.json() as Array<{ display_name: string; type: string; class: string }>;
  return data.map(x => ({ name: x.display_name, description: `${x.class} · ${x.type}`, source: "OpenStreetMap" }));
}

export async function GET(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return unauthorized();
    const params = new URL(req.url).searchParams;
    const q = params.get("q")?.trim() || "";
    const type = params.get("type") === "school" ? "school" : "workplace";
    if (q.length < 2) return bad("Enter at least 2 characters.");
    const [wiki, map] = await Promise.all([
      wikipedia(type === "school" ? `${q} school university college` : q).catch(() => []),
      type === "school" ? places(`${q} school`).catch(() => []) : Promise.resolve([]),
    ]);
    const seen = new Set<string>();
    const results = [...wiki, ...map].filter(x => { const k = x.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
    return ok({ type, results });
  } catch { return serverError(); }
}
