import React, { PropsWithChildren } from "react";
import * as TrackVisualizer from "../TrackVisualizer";
import { useGetSpotifyPlaybackState } from "../../Spotify/Player/PlayerHooks";

export const CurrentSongNode: React.FC<PropsWithChildren> = () => {
  const { data: playbackState,isLoading:isPlaybackStateLoading } = useGetSpotifyPlaybackState();
  const track =
    playbackState?.item && "artists" in playbackState?.item
      ? playbackState?.item
      : undefined;

  return (
    <>
      <TrackVisualizer.TrackTitle track={track} />
      <TrackVisualizer.TrackArtists track={track} />
      <div
        className="cursor-pointer mt-4"
        onClick={() => {
          /* TODO play/pause */
        }}
      >
        <TrackVisualizer.TrackVisualizer
          track={track}
          duration={track?.duration_ms}
          position={playbackState?.progress_ms}
          isPaused={playbackState?.is_playing}
          nextTrack={undefined}
          isLoading={isPlaybackStateLoading}
        />
      </div>
    </>
  );
};
