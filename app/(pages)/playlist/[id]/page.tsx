import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getPlaylistMeta, getEnrichedTracks } from "./data";
import PlaylistHeader from "../../../components/PlaylistHeader";
import TrackRow from "../../../components/TrackRow";
import "./style.css";

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) notFound();

  const [playlist, tracks] = await Promise.all([
    getPlaylistMeta(session.accessToken, params.id),
    getEnrichedTracks(session.accessToken, params.id),
  ]);

  if (!playlist) notFound();

  return (
    <div className="px-6 py-6">
      <div className="playlist-content">
        <PlaylistHeader playlist={playlist} trackCount={tracks.length} />

        <div className="px-6 pb-6">
          <div className="track-list-wrapper">
            <div className="track-grid-header track-grid gap-3 px-4 py-2 mb-1 text-xs font-medium uppercase tracking-wider border-b">
              <span className="text-center">#</span>
              <span>Title</span>
              <span>Album</span>
              <span>Genres</span>
              <span title="Beats per minute">BPM</span>
              <span title="Musical key">Key</span>
              <span title="Open key (Traktor)">Open</span>
              <span title="Time signature">Time</span>
              <span title="Danceability (0–100)">Dance</span>
              <span title="Acousticness (0–100)">Acou</span>
              <span>⏱</span>
            </div>

            <div>
              {tracks.map((track, i) => (
                <TrackRow key={track.id + i} track={track} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
