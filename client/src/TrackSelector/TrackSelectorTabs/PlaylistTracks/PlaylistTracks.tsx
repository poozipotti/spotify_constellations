import React, { useEffect, useState } from "react";
import { useSearchPlaylists } from "@app/Spotify/searchHooks";
import { Input } from "@core/Input";
import { useOnScreen } from "@app/hooks";
import { ItemSelectionList } from "@core/ItemSelectionList/ItemSelectionList";
import { SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { PlaylistTrackList } from "../SavedPlaylistTracks/SavedPlaylistTracks";
import { Button } from "@core/Button";

export const PlaylistTracks: React.FC<{ onSuccess?: () => void }> = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    undefined | Omit<SimplifiedPlaylist, "tracks">
  >();
  return selectedPlaylist ? (
    <>
      <Button
        onClick={() => {
          setSelectedPlaylist(undefined);
        }}
      >
        close
      </Button>
      <PlaylistTrackList playlist={selectedPlaylist} />
    </>
  ) : (
    <PlaylistList onClick={(playlist) => setSelectedPlaylist(playlist)} />
  );
};

export const PlaylistList: React.FC<{
  onSuccess?: () => void;
  onClick: (playlist: Omit<SimplifiedPlaylist, "tracks">) => void;
}> = ({ onClick }) => {
  const [searchData, setSearchTerm] = useSearchPlaylists();
  const playlists = searchData.data?.pages.flatMap(
    (data) => data.playlists.items
  );
  const loading = searchData.isLoading;
  const loadingButtonRef = React.createRef<HTMLButtonElement>();
  const isLoadingButtonOnScreen = useOnScreen(loadingButtonRef);
  useEffect(() => {
    if (isLoadingButtonOnScreen) {
      searchData?.fetchNextPage();
    }
  }, [isLoadingButtonOnScreen]);
  return (
    <>
      <Input
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="remind you of anything?"
        stretch
      />
      <ItemSelectionList
        playlistData={{ playlists, onClick }}
        isLoading={loading}
        fetchNextPage={
          searchData.hasNextPage ? searchData.fetchNextPage : undefined
        }
        isFetching={searchData.isFetching}
        title="Search"
      />
    </>
  );
};
