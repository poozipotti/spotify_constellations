import React, { useEffect } from "react";
import { useSearchPlaylists } from "@app/Spotify/searchHooks";
import { Input } from "@core/Input";
import { Loader } from "@core/Loader";
import { Button } from "@core/Button";
import { useOnScreen } from "@app/hooks";
import { TrackSelectorPlaylist } from "../TrackSelectorTrack/TrackSelectorTrack";

export const PlaylistTracks: React.FC<{ onSuccess?: () => void }> = () => {
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
      <h2 className="text-xl font-bold uppercase">Search:</h2>
      <Input
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="remind you of anything?"
        stretch
      />
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
