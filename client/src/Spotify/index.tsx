import React from "react";
import { SpotifyContext } from "./SpotifyProvider";


export const useSpotify = () => {
  const sdk = React.useContext(SpotifyContext);

  if (!sdk) {
    throw new Error(
      "cannot access spotify sdk make sure a spotify provider is being used"
    );
  }
  return sdk[0];
};
export const useSpotifyToken = () => {
  const sdk = React.useContext(SpotifyContext);

  if (!sdk) {
    throw new Error(
      "cannot access spotify spotify token make sure a spotify provider is being used"
    );
  }
  return sdk[1];
};
