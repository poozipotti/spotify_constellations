import React, { useEffect } from "react";
import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useQuery } from "react-query";
export * from "./searchHooks";

const clientId =import.meta.env.VITE_SPOTIFY_CLIENT_ID ;
if (!clientId) {
  throw new Error(
    `No spotify client id provided in .env ${JSON.stringify(import.meta.env)}`
  );
}

const sdk = SpotifyApi.withUserAuthorization(
  clientId,
  "http://localhost:3000",
  [
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-library-read",
    "user-modify-playback-state",
    "user-read-playback-state",
    "app-remote-control",
    "streaming",
  ]
);

const SpotifyContext = React.createContext([sdk, undefined] as [
  SpotifyApi,
  undefined | null | AccessToken
]);

export const SpotifyProvider: React.FC<
  React.PropsWithChildren<{ enabled: boolean }>
> = ({ children, enabled }) => {
  const { data: tokenData } = useGetToken(sdk);
  useEffect(() => {
    if (!tokenData && enabled) {
      sdk.authenticate();
    }
  }, [tokenData, enabled]);
  return (
    <SpotifyContext.Provider value={[sdk, tokenData]}>
      {children}
    </SpotifyContext.Provider>
  );
};

function useGetToken(
  sdk: SpotifyApi,
  options?: { cacheTime?: number; staleTime?: number; enabled?: boolean }
) {
  const tokenQuery = useQuery(
    ["auth-token"],
    () => {
      return sdk.getAccessToken();
    },
    options
  );
  return tokenQuery;
}

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
