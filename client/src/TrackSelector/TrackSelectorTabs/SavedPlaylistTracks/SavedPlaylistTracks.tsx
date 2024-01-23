import React, { useEffect } from "react";
import { Loader } from "@core/Loader";
import { Button } from "@core/Button";
import { useOnScreen } from "@app/hooks";
import { TrackSelectorPlaylist } from "../TrackSelectorTrack/TrackSelectorTrack";
import {useGetSpotifySavedPlaylists} from "@app/Spotify/playlistHooks";

export const SavedPlaylistTracks: React.FC<{ onSuccess?: () => void }> = () => {
  const searchData = useGetSpotifySavedPlaylists();
  const playlists = searchData.data?.pages.flatMap(
    (data) => data.items
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
              onClick={() => {}}
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
