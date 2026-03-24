import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MainViewContainer from "../components/MainViewContainer";
import LoginButton from "../components/login-button";
import type { Playlist } from "../components/PlaylistBox";

async function getPlaylists(accessToken: string): Promise<Playlist[]> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const limit = 50;

  const first = await fetch(
    `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=0`,
    { headers, cache: "no-store" }
  );
  if (!first.ok) return [];
  const firstData = await first.json();
  const total: number = firstData.total ?? 0;
  const items: Playlist[] = firstData.items ?? [];

  if (total > limit) {
    const offsets = Array.from(
      { length: Math.ceil((total - limit) / limit) },
      (_, i) => (i + 1) * limit
    );
    const rest = await Promise.all(
      offsets.map((offset) =>
        fetch(
          `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
          { headers, cache: "no-store" }
        )
          .then((r) => r.json())
          .then((d) => (d.items ?? []) as Playlist[])
      )
    );
    items.push(...rest.flat());
  }

  return items;
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const playlists = session?.accessToken
    ? await getPlaylists(session.accessToken)
    : [];

  return (
    <div className="max-w-6xl w-full mx-auto px-6 py-10">
      {session?.user ? (
        <MainViewContainer playlists={playlists} />
      ) : (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p style={{ color: "var(--text-subdued)" }}>Login to see your playlists</p>
          <LoginButton />
        </div>
      )}
    </div>
  );
}
