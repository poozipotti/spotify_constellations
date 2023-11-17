import React, { PropsWithChildren } from "react";
import {
  useCurrentTrack,
  useSpotifyPlayer,
  useSpotifyState,
} from "spotify-web-playback-sdk-for-react";
import * as TrackVisualizer from "../TrackVisualizer";

export const CurrentSongNode: React.FC<PropsWithChildren> = () => {
  const player = useSpotifyPlayer();
  const state = useSpotifyState();
  const track = useCurrentTrack();

  return (
    <>
      <TrackVisualizer.TrackTitle track={track} />
      <TrackVisualizer.TrackArtists track={track} />
      <div
        className="cursor-pointer"
        onClick={() => {
          player?.togglePlay();
        }}

      >
        <TrackVisualizer.TrackVisualizer
          track={track}
          duration={state?.duration}
          position={state?.position}
          isPaused={state?.paused}
          nextTrack={state?.track_window?.next_tracks[0]}
        />
      </div>
    </>
  );
};
