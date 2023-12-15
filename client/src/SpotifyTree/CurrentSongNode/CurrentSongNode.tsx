import React, { PropsWithChildren } from "react";
import * as TrackVisualizer from "@app/SpotifyTree/TrackVisualizer";
import { useSpotifyPlayer } from "@app/Spotify/Player";

export const CurrentSongNode: React.FC<PropsWithChildren> = () => {
  const player = useSpotifyPlayer();
  
  return (
    <>
      <TrackVisualizer.TrackTitle track={player.state?.currentTrack} />
      <TrackVisualizer.TrackArtists track={player.state?.currentTrack} />
      <div
        className="cursor-pointer mt-4"
        onClick={() => {
          player.togglePlay();
        }}
      >
        <TrackVisualizer.TrackVisualizer
          track={player.state?.currentTrack}
          duration={player.state?.currentTrack?.duration_ms}
          position={player.state?.progress_ms}
          isPaused={player.state?.is_playing}
          nextTrack={player.state?.nextTrack}
          isLoading={player.isLoading}
        />
      </div>
    </>
  );
};
