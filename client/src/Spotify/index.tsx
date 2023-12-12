import React, { useEffect } from "react";
import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useQuery } from "react-query";
import { SpotifyWebSDK } from "spotify-web-playback-sdk-for-react";
export * from "./searchHooks";

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
      <WebPlayerProvider>{children}</WebPlayerProvider>
    </SpotifyContext.Provider>
  );
};

const WebPlayerProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const token = useSpotifyToken();

  if (!token?.access_token) {
    return <>{children}</>;
  }
  return (
    <SpotifyWebSDK
      name="Spotify Quantum"
      getOAuthToken={(cb) => {
        if (!token?.access_token) {
          console.error(
            `cannot get access token in player tokenData:${JSON.stringify(
              token
            )}`
          );
        }
        if (token?.access_token) {
          cb(token?.access_token);
        }
      }}
      volume={0.5}
    >
      {children}
    </SpotifyWebSDK>
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
