import React, { useEffect } from "react";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";
import { useOnScreen } from "@app/hooks";
import { useGetSpotifySavedTracks } from "@app/Spotify/trackHooks";
import { ItemSelectionList } from "@core/ItemSelectionList/ItemSelectionList";

export const SavedTracks: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const trackData = useGetSpotifySavedTracks();
  const tracks = trackData.data?.pages
    .flatMap((data) => data.items)
    .map((track) => track.track);
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
    <ItemSelectionList
      trackData={{
        tracks: tracks,
        onClick: (track) => {
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
        },
      }}
      isLoading={loading}
      isFetching={trackData.isFetching}
      fetchNextPage={
        trackData.hasNextPage ? trackData.fetchNextPage : undefined
      }
      title="My Tracks"
    />
  );
};
