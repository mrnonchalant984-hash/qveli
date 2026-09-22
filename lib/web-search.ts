export type WebResult = { title: string; snippet: string; url: string; source: string };
type RevalidatingRequestInit = RequestInit & { next?: { revalidate: number } };

export async function searchWeb(query: string, limit = 8): Promise<WebResult[]> {
  const googleKey = process.env.GOOGLE_CSE_API_KEY;
  const googleCx = process.env.GOOGLE_CSE_ID;
  if (googleKey && googleCx) {
    const init: RevalidatingRequestInit = { next: { revalidate: 300 } };
    const r = await fetch(`https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(googleKey)}&cx=${encodeURIComponent(googleCx)}&q=${encodeURIComponent(query)}&num=${Math.min(limit, 10)}`, init);
    if (r.ok) {
      const data = await r.json();
      return (data.items || []).map((x: any) => ({ title: x.title, snippet: x.snippet || "", url: x.link, source: "Google" }));
    }
  }
  const brave = process.env.BRAVE_SEARCH_API_KEY;
  if (brave) {
    const init: RevalidatingRequestInit = { headers: { accept: "application/json", "X-Subscription-Token": brave }, next: { revalidate: 300 } };
    const r = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${Math.min(limit, 20)}`, init);
    if (r.ok) {
      const data = await r.json();
      return (data.web?.results || []).map((x: any) => ({ title: x.title, snippet: x.description || "", url: x.url, source: "Brave" }));
    }
  }
  const init: RevalidatingRequestInit = { headers: { accept: "application/json" }, next: { revalidate: 3600 } };
  const r = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&namespace=0&format=json&origin=*`, init);
  if (!r.ok) return [];
  const data = await r.json() as [string, string[], string[], string[]];
  return (data[1] || []).map((title, i) => ({ title, snippet: data[2]?.[i] || "", url: data[3]?.[i] || "", source: "Wikipedia" }));
}
