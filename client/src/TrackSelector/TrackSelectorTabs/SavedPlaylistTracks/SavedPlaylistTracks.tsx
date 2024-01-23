import React, { useEffect, useState } from "react";
import { Button } from "@core/Button";
import { useOnScreen } from "@app/hooks";
import {
  useGetPlaylistItems,
  useGetSpotifySavedPlaylists,
} from "@app/Spotify/playlistHooks";
import { SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { ItemSelectionList } from "@core/ItemSelectionList/ItemSelectionList";

export const SavedPlaylistTracks: React.FC<{ onSuccess?: () => void }> = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    undefined | SimplifiedPlaylist
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
    <PlaylistList
      onClick={(playlist: SimplifiedPlaylist) => setSelectedPlaylist(playlist)}
    />
  );
};

export const PlaylistTrackList: React.FC<{
  playlist: SimplifiedPlaylist;
}> = ({ playlist }) => {
  const playlistData = useGetPlaylistItems(playlist.id);
  const playlists: Track[] | undefined = playlistData.data?.pages
    .flatMap((data) => data.items)
    .filter((item) => "track" in item.track)
    .map((playlistedTrack) => playlistedTrack.track as Track);
  const loading = playlistData.isLoading;
  const loadingButtonRef = React.createRef<HTMLButtonElement>();
  const isLoadingButtonOnScreen = useOnScreen(loadingButtonRef);
  useEffect(() => {
    if (isLoadingButtonOnScreen) {
      playlistData?.fetchNextPage();
    }
  }, [isLoadingButtonOnScreen]);

  return (
    <ItemSelectionList
      trackData={{ tracks: playlists }}
      isLoading={loading}
      isFetching={playlistData.isFetching}
      fetchNextPage={
        playlistData.hasNextPage ? playlistData.fetchNextPage : undefined
      }
      title={playlist.name}
    />
  );
};
export const PlaylistList: React.FC<{
  onSuccess?: () => void;
  onClick: (playlist: SimplifiedPlaylist) => void;
}> = ({ onClick }) => {
  const searchData = useGetSpotifySavedPlaylists();
  const playlists = searchData.data?.pages.flatMap((data) => data.items);
  const loading = searchData.isLoading;
  const loadingButtonRef = React.createRef<HTMLButtonElement>();
  const isLoadingButtonOnScreen = useOnScreen(loadingButtonRef);
  useEffect(() => {
    if (isLoadingButtonOnScreen) {
      searchData?.fetchNextPage();
    }
  }, [isLoadingButtonOnScreen]);

  return (
    <ItemSelectionList
      playlistData={{ playlists, onClick }}
      isLoading={loading}
      fetchNextPage={
        searchData.hasNextPage ? searchData.fetchNextPage : undefined
      }
      isFetching={searchData.isFetching}
      title="My Playlists"
    />
  );
};
