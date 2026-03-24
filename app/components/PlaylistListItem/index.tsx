import Image from "next/image";
import Link from "next/link";
import type { Playlist } from "../PlaylistBox";
import "./style.css";

type Props = {
  playlist: Playlist;
  groupName?: string;
};

export default function PlaylistListItem({ playlist, groupName }: Props) {
  return (
    <Link href={`/playlist/${playlist.id}`} className="playlist-list-item">
      <div className="playlist-list-item__art">
        {playlist.images?.[0] ? (
          <Image
            src={playlist.images[0].url}
            alt={playlist.name}
            width={56}
            height={56}
            className="rounded"
          />
        ) : (
          <div className="playlist-list-item__art-placeholder" />
        )}
      </div>
      <div className="playlist-list-item__info">
        <p className="playlist-list-item__name">{playlist.name}</p>
        <p className="playlist-list-item__meta">
          By {playlist.owner.display_name}
          {playlist.tracks && ` · ${playlist.tracks.total} tracks`}
        </p>
        {groupName && (
          <span className="playlist-list-item__group-tag">{groupName}</span>
        )}
      </div>
      <span className="playlist-list-item__count">
        {playlist.tracks?.total ?? "—"}
      </span>
    </Link>
  );
}
