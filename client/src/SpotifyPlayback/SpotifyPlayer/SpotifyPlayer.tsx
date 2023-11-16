import React from "react";
import { Button } from "../../Core/Button";
import {
  useSpotifyPlayer,
  useSpotifyState,
} from "spotify-web-playback-sdk-for-react";

export const SpotifyPlayer: React.FC = () => {
  const player = useSpotifyPlayer();
  const state = useSpotifyState();
  if (!player) {
    return <></>;
  }
  return (
    <div className="flex gap-4 justify-center">
      <Button
        onClick={() => {
          player.nextTrack();
        }}
      >
        back
      </Button>
      <Button
        onClick={() => {
          player.previousTrack();
        }}
      >
        forward
      </Button>
      <Button
        onClick={() => {
          state?.paused ? player.resume() : player.pause();
        }}
      >
        play
      </Button>
    </div>
  );
};
