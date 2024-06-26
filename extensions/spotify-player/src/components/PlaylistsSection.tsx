import { SimplifiedPlaylistObject } from "../helpers/spotify.api";
import { ListOrGridSection } from "./ListOrGridSection";
import PlaylistItem from "./PlaylistItem";

type PlaylistsSectionProps = {
  type: "list" | "grid";
  playlists: SimplifiedPlaylistObject[] | undefined;
  columns?: number;
  limit?: number;
};

export function PlaylistsSection({ type, playlists, columns, limit }: PlaylistsSectionProps) {
  if (!playlists) return null;

  const items = playlists.slice(0, limit || playlists.length);

  return (
    <ListOrGridSection type={type} title="Playlists" columns={columns}>
      {items.map((playlist) => (
        <PlaylistItem type={type} key={playlist.id} playlist={playlist} />
      ))}
    </ListOrGridSection>
  );
}
