import React, { useEffect } from "react";
import { useSearchTracks } from "@app/Spotify/searchHooks";
import { Input } from "@core/Input";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";
import { useOnScreen } from "@app/hooks";
import { ItemSelectionList } from "@core/ItemSelectionList/ItemSelectionList";

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
        isFetching={searchData.isFetching}
        fetchNextPage={
          searchData.hasNextPage ? searchData.fetchNextPage : undefined
        }
        title="My Tracks"
      />
    </>
  );
};
