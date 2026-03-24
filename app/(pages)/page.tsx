import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllPlaylists } from "@/lib/spotify";
import MainViewContainer from "../components/MainViewContainer";
import LoginButton from "../components/login-button";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const playlists = session?.accessToken
    ? await getAllPlaylists(session.accessToken)
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
