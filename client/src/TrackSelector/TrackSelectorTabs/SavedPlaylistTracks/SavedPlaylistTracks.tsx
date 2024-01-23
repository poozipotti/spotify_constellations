import React, { useEffect, useState } from "react";
import { Loader } from "@core/Loader";
import { Button } from "@core/Button";
import { useOnScreen } from "@app/hooks";
import {
  TrackSelectorPlaylist,
  TrackSelectorTrack,
} from "../TrackSelectorTrack/TrackSelectorTrack";
import {
  useGetPlaylistItems,
  useGetSpotifySavedPlaylists,
} from "@app/Spotify/playlistHooks";
import { Episode, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";

function asTrack(item: Track | undefined | Episode) {
  return item && "artists" in item ? (item as Track) : undefined;
}

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
  onSuccess?: () => void;
  playlist: SimplifiedPlaylist;
  onClick?: (playlist: SimplifiedPlaylist) => void;
}> = ({ onClick, playlist }) => {
  const playlistData = useGetPlaylistItems(playlist.id);
  const playlists = playlistData.data?.pages.flatMap((data) => data.items);
  const loading = playlistData.isLoading;
  const loadingButtonRef = React.createRef<HTMLButtonElement>();
  const isLoadingButtonOnScreen = useOnScreen(loadingButtonRef);
  useEffect(() => {
    if (isLoadingButtonOnScreen) {
      playlistData?.fetchNextPage();
    }
  }, [isLoadingButtonOnScreen]);

  return (
    <>
      <h2 className="text-xl font-bold uppercase">{playlist.name}:</h2>
      <Loader isLoading={loading} className="h-full w-full">
        <div className="overflow-auto gap-12 flex flex-wrap pb-24 justify-center px-2 h-full w-full ">
          {!playlists?.length && !loading ? (
            <div className="p-4">
              <p>no results!</p>
            </div>
          ) : undefined}
          {playlists?.map((track) => {
            const formattedTrack = asTrack(track.track);
            if (!formattedTrack) {
              return null;
            }
            return (
              <TrackSelectorTrack
                track={formattedTrack}
                key={playlist.id}
                onClick={() => {}}
              />
            );
          })}
          {playlists?.length && (
            <Button
              ref={loadingButtonRef}
              onClick={() => {
                playlistData.fetchNextPage();
              }}
              isLoading={playlistData.isFetching}
            >
              load more tracks
            </Button>
          )}
        </div>
      </Loader>
    </>
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
    <>
      <h2 className="text-xl font-bold uppercase">My Playlists:</h2>
      <Loader isLoading={loading} className="h-full w-full">
        <div className="overflow-auto gap-12 flex flex-wrap pb-24 justify-center px-2 h-full w-full ">
          {!playlists?.length && !loading ? (
            <div className="p-4">
              <p>no results!</p>
            </div>
          ) : undefined}
          {playlists?.map((playlist) => (
            <TrackSelectorPlaylist
              playlist={playlist}
              key={playlist.id}
              onClick={() => {
                onClick(playlist);
              }}
            />
          ))}
          {playlists?.length && (
            <Button
              ref={loadingButtonRef}
              onClick={() => {
                searchData.fetchNextPage();
              }}
              isLoading={searchData.isFetching}
            >
              load more tracks
            </Button>
          )}
        </div>
      </Loader>
    </>
  );
};
