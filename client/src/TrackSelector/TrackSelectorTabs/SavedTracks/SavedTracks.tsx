import React, { useEffect } from "react";
import { Loader } from "@core/Loader";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";
import { TrackSelectorTrack } from "../TrackSelectorTrack";
import { Button } from "@core/Button";
import { useOnScreen } from "@app/hooks";
import { useGetSpotifySavedTracks } from "@app/Spotify/trackHooks";

export const SavedTracks: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const trackData = useGetSpotifySavedTracks();
  const tracks = trackData.data?.pages.flatMap((data) => data.items);
  const loading = trackData.isLoading;
  const constellationGraph = useSpotifyConstellationGraph();
  const loadingButtonRef = React.createRef<HTMLButtonElement>();
  const isLoadingButtonOnScreen = useOnScreen(loadingButtonRef);
  useEffect(() => {
    if (isLoadingButtonOnScreen) {
      trackData?.fetchNextPage();
    }
  }, [isLoadingButtonOnScreen]);

  return (
    <>
      <Loader isLoading={loading} className="h-full w-full">
        <h2 className="text-xl font-bold uppercase">liked tracks:</h2>
        <div className="overflow-auto gap-12 flex flex-wrap pb-24 justify-center px-2 h-full w-full ">
          {!tracks?.length && !loading ? (
            <div className="p-4">
              <p>no tracks found!</p>
            </div>
          ) : undefined}
          {tracks?.map(({ track }) => {
            return (
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
            );
          })}
          {tracks?.length && (
            <Button
              ref={loadingButtonRef}
              onClick={() => {
                trackData.fetchNextPage();
              }}
              isLoading={trackData.isFetching}
            >
              load more tracks
            </Button>
          )}
        </div>
      </Loader>
    </>
  );
};
