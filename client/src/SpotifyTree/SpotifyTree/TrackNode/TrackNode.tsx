import React, { PropsWithChildren } from "react";
import * as TrackVisualizer from "@app/SpotifyTree/SpotifyTree/TrackVisualizer";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";
import { useSpotifyTree } from "@app/SpotifyTree/hooks";

export const TrackNode: React.FC<
  PropsWithChildren<{
    track: { spotify_id: string; id?: number };
    selected: boolean;
  }>
> = ({ track, selected }) => {
  const {
    data: TrackData,
    isLoading: trackLoading,
    error: trackError,
  } = useGetSpotifyTrack(track.spotify_id);
  const tree = useSpotifyTree();
  return (
    <div>
      <TrackVisualizer.AlbumContainer
        selected={selected}
        track={TrackData}
        isLoading={trackLoading}
        onClick={() => {
          if (track.id) {
            tree.setSelectedNextSong(track.id);
          }
        }}
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
