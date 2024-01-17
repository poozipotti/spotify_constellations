import React, { useEffect } from "react";
import { useSearchTracks } from "@app/Spotify/searchHooks";
import { Input } from "@core/Input";
import { Loader } from "@core/Loader";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";
import { TrackSelectorTrack } from "../TrackSelectorTrack";
import { Button } from "@core/Button";
import { useOnScreen } from "@app/hooks";

export const SearchAllTracks: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const [searchData, setSearchTerm] = useSearchTracks();
  const tracks = searchData.data?.pages.flatMap((data) => data.tracks.items);
  const loading = searchData.isLoading;
  const constellationGraph = useSpotifyConstellationGraph();
  const loadingButtonRef = React.createRef<HTMLButtonElement>();
  const isLoadingButtonOnScreen = useOnScreen(loadingButtonRef);
  useEffect(() => {
    if (isLoadingButtonOnScreen) {
      console.log("next page");
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
          {!tracks?.length && !loading ? (
            <div className="p-4">
              <p>no results!</p>
            </div>
          ) : undefined}
          {tracks?.map((track) => (
            <TrackSelectorTrack
              track={track}
              key={track.id}
              onClick={() => {
                constellationGraph?.addChild.mutate(
                  {
                    name: track.name,
                    spotify_id: track.id,
                  },
                  {
                    onSuccess: () => {
                      onSuccess && onSuccess();
                    },
                  }
                );
              }}
            />
          ))}
          {tracks?.length && (
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
