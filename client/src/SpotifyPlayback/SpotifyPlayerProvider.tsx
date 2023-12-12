import React from "react";
import { SpotifyWebSDK } from "spotify-web-playback-sdk-for-react";
import {useSpotifyToken} from "../Spotify";

if (!process.env.REACT_APP_SPOTIFY_CLIENT_ID) {
  throw new Error(
    `No spotify client id provided check env is ${JSON.stringify(process.env)}`
  );
}

export const SpotifyPlayerProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const token = useSpotifyToken();

  if (!token?.access_token) {
    return <>{children}</>;
  }
  return (
    <SpotifyWebSDK
      name="Spotify Quantumn"
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
