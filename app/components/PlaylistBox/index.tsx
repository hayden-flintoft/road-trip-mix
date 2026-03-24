import Image from "next/image";
import Link from "next/link";
import "./style.css";

export type Playlist = {
  id: string;
  name: string;
  images: { url: string }[] | null;
  tracks: { total: number } | null;
  owner: { display_name: string };
};

type Props = {
  playlist: Playlist;
};

export default function PlaylistBox({ playlist }: Props) {
  return (
    <Link href={`/playlist/${playlist.id}`} className="playlist-box" role="listitem">
      <div className="playlist-box__image-wrapper">
        {playlist.images?.[0] ? (
          <Image
            src={playlist.images![0].url}
            alt={playlist.name}
            width={300}
            height={300}
            className="playlist-box__image"
          />
        ) : (
          <div className="playlist-box__image-placeholder" />
        )}
        <button
          className="playlist-box__play-btn"
          aria-label={`Play ${playlist.name}`}
          tabIndex={-1}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
            <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606" />
          </svg>
        </button>
      </div>
      <p className="playlist-box__title">{playlist.name}</p>
      <p className="playlist-box__subtitle">By {playlist.owner.display_name}</p>
    </Link>
  );
}
