import React, { PropsWithChildren } from "react";
import * as TrackVisualizer from "@app/SpotifyTree/TrackVisualizer";
import { useGetTrack } from "@app/Spotify/trackHooks";

export const TrackNode: React.FC<PropsWithChildren<{ trackId?: string }>> = ({
  trackId,
}) => {
  const {
    data: TrackData,
    isLoading: trackLoading,
    error: trackError,
  } = useGetTrack(trackId);
  return (
    <div>
      <TrackVisualizer.AlbumContainer
        track={TrackData}
        isLoading={trackLoading}
      >
        {!!trackError && (
          <p className="text-orange-200 p-4 text-center w-full">
            something went wrong
          </p>
        )}
      </TrackVisualizer.AlbumContainer>
      <TrackVisualizer.TrackTitle track={TrackData} />
      <TrackVisualizer.TrackArtists track={TrackData} />
    </div>
  );
};
