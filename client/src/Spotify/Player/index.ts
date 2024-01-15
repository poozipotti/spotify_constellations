import React from "react";
import { PlayerContext } from "@app/Spotify/Player/PlayerProvider";

export const useSpotifyPlayer = () => {
  const player = React.useContext(PlayerContext);

  if (!player) {
    throw new Error(
      "cannot access spotify player make sure a spotify player provider is being used",
    );
  }
  return player;
};
