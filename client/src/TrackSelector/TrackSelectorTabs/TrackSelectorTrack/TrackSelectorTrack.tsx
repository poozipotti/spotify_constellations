import React from "react";
import * as TrackVisualizer from "@app/SpotifyConstellationGraph/SpotifyConstellationGraph/TrackVisualizer";
import { Track } from "@spotify/web-api-ts-sdk";

export const TrackSelectorTrack: React.FC<{
  onClick?: () => void;
  track: Track;
}> = ({ onClick, track }) => {
  return (
    <div className="w-full md:w-max pt-6 ">
      <TrackVisualizer.AlbumContainer
        track={track}
        size={"w-full md:w-max h-24 px-4 pointer "}
        onClick={() => {
          onClick && onClick();
        }}
      >
        <TrackVisualizer.TrackTitle track={track} />
        <div className="h-2 w-full"></div>
        <TrackVisualizer.TrackArtists track={track} />
      </TrackVisualizer.AlbumContainer>
    </div>
  );
};
