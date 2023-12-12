import React from "react";
import {
  SpotifyApi,
} from "@spotify/web-api-ts-sdk";
export * from "./searchHooks";
export * from "./authHooks";

if (!process.env.REACT_APP_SPOTIFY_CLIENT_ID) {
  throw new Error(
    `No spotify client id provided check env is ${JSON.stringify(process.env)}`
  );
}

const sdk = SpotifyApi.withUserAuthorization(
  process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  "http://localhost:3000",
  [
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-library-read",
    "user-modify-playback-state",
    "user-read-playback-state",
    "app-remote-control",
    "streaming",
  ]
);

const SpotifyContext = React.createContext(sdk);

export const SpotifyProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <SpotifyContext.Provider value={sdk}>{children}</SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const sdk = React.useContext(SpotifyContext);
  if (!sdk) {
    throw new Error(
      "cannot access spotify sdk make sure a spotify provider is being used"
    );
  }
  return sdk;
};
