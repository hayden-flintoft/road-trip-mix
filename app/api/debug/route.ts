import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const [meRes, playlistsRes] = await Promise.all([
    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }),
    fetch("https://api.spotify.com/v1/me/playlists?limit=1", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }),
  ]);

  const me = await meRes.json();
  const playlists = await playlistsRes.json();

  let tracksTest = null;
  if (playlists.items?.[0]) {
    const playlistId = playlists.items[0].id;
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=1`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );
    tracksTest = { status: tracksRes.status, playlistId, body: await tracksRes.json() };
  }

  return NextResponse.json({
    tokenPrefix: session.accessToken.slice(0, 20),
    me: { status: meRes.status, id: me.id, display_name: me.display_name },
    playlists: { status: playlistsRes.status, total: playlists.total },
    tracksTest,
  });
}
