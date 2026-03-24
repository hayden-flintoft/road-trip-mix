import GroupedPlaylistClient from "./client";

export default function GroupedPlaylistPage({ params }: { params: { id: string } }) {
  return <GroupedPlaylistClient id={params.id} />;
}
