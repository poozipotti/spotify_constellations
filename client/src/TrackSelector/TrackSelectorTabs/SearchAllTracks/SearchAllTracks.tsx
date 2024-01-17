import React from "react";
import { useSearchTracks } from "@app/Spotify/searchHooks";
import { Input } from "@core/Input";
import { Loader } from "@core/Loader";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";
import { TrackSelectorTrack } from "../TrackSelectorTrack";

export const SearchAllTracks: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const [searchData, setSearchTerm] = useSearchTracks();
  const tracks = searchData.data?.tracks.items;
  const loading = searchData.isLoading;
  const constellationGraph = useSpotifyConstellationGraph();

  return (
    <>
      <Input
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="remind you of anything?"
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
        </div>
      </Loader>
    </>
  );
};
