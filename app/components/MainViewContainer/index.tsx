import PlaylistBox, { type Playlist } from "../PlaylistBox";
import "./style.css";

type Props = {
  playlists: Playlist[];
};

export default function MainViewContainer({ playlists }: Props) {
  return (
    <section className="main-view-container">
      <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-base)" }}>
        Your Playlists
      </h2>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        role="list"
      >
        {playlists.map((playlist) => (
          <PlaylistBox key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </section>
  );
}
