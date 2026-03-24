import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MainViewContainer from "../components/MainViewContainer";
import LoginButton from "../components/login-button";
import type { Playlist } from "../components/PlaylistBox";

async function getPlaylists(accessToken: string): Promise<Playlist[]> {
  const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
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
