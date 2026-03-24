import Link from "next/link";
import type { GroupedPlaylist } from "@/lib/grouped-playlists";
import "./style.css";

type Props = {
  playlist: GroupedPlaylist;
  view: "grid" | "list";
};

function PlaceholderArt({ size }: { size: number }) {
  return (
    <div
      className="grouped-playlist-card__art"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.4} height={size * 0.4} fill="currentColor" aria-hidden="true">
        <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
      </svg>
    </div>
  );
}

export default function GroupedPlaylistCard({ playlist, view }: Props) {
  const ruleCount = playlist.rules.length;
  const subtitle = ruleCount === 0 ? "No rules yet" : `${ruleCount} rule${ruleCount !== 1 ? "s" : ""}`;

  if (view === "list") {
    return (
      <Link href={`/grouped-playlist/${playlist.id}`} className="grouped-playlist-list-item">
        <PlaceholderArt size={56} />
        <div className="grouped-playlist-list-item__info">
          <p className="grouped-playlist-list-item__name">{playlist.name}</p>
          <p className="grouped-playlist-list-item__meta">{subtitle}</p>
        </div>
        <span className="grouped-playlist-list-item__badge">Grouped</span>
      </Link>
    );
  }

  return (
    <Link href={`/grouped-playlist/${playlist.id}`} className="grouped-playlist-box" role="listitem">
      <div className="grouped-playlist-box__image-wrapper">
        <PlaceholderArt size={120} />
      </div>
      <p className="grouped-playlist-box__title">{playlist.name}</p>
      <p className="grouped-playlist-box__subtitle">{subtitle}</p>
    </Link>
  );
}
