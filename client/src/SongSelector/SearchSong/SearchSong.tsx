import React, { PropsWithChildren } from "react";
import { useSearchTracks } from "../../Spotify";
import { Input } from "../../Core/Input";
import { Loader } from "../../Core/Loader";
import * as TrackVisualizer from "../../Core/TrackVisualizer";

export const SearchSong: React.FC = () => {
  const [searchData, setSearchTerm] = useSearchTracks();
  const tracks = searchData.data?.tracks.items;
  const loading = searchData.isLoading;

  return (
    <div className="justify-center flex flex-col p-24 ">
      <Input
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="search songs"
      />
      <Loader isLoading={loading}>
        <div className="overflow-scroll h-64 gap-6 flex flex-wrap pb-24 justify-center">
          {tracks?.map((track) => (
            <div key={track.id}>
              <TrackVisualizer.TrackVisualizer track={track}>
                <TrackVisualizer.TrackTitle track={track} />
                <div className="h-2 w-full"></div>
                <TrackVisualizer.TrackArtists track={track} />
              </TrackVisualizer.TrackVisualizer>
            </div>
          ))}
        </div>
      </Loader>
    </div>
  );
};
