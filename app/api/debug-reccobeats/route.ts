import { NextRequest, NextResponse } from "next/server";

// Usage: /api/debug-reccobeats?ids=SPOTIFY_ID1,SPOTIFY_ID2
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ error: "Pass ?ids=spotifyId1,spotifyId2" }, { status: 400 });
  }

  const idList = ids.split(",").map((s) => s.trim()).filter(Boolean);

  // Step 1: resolve Spotify IDs → ReccoBeats UUIDs
  const lookupUrl = `https://api.reccobeats.com/v1/track?ids=${idList.join(",")}`;
  const lookupRes = await fetch(lookupUrl, { cache: "no-store" });
  const lookupRaw = await lookupRes.text();
  let lookupJson: unknown = null;
  try { lookupJson = JSON.parse(lookupRaw); } catch { /* ignore */ }

  // Step 2: if we got a UUID back, fetch audio features for the first one
  let featuresResult: unknown = null;
  const content = (lookupJson as { content?: { id: string; href: string }[] })?.content;
  if (content?.[0]?.id) {
    const reccoId = content[0].id;
    const featUrl = `https://api.reccobeats.com/v1/track/${reccoId}/audio-features`;
    const featRes = await fetch(featUrl, { cache: "no-store" });
    featuresResult = { status: featRes.status, url: featUrl, body: await featRes.json().catch(() => null) };
  }

  return NextResponse.json({
    requestedIds: idList,
    lookupStatus: lookupRes.status,
    lookupUrl,
    lookupBody: lookupJson,
    featuresResult,
  });
}
