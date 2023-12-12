import React from "react";
import { useGetToken } from "../Spotify";
import { SpotifyWebSDK } from "spotify-web-playback-sdk-for-react";

if (!process.env.REACT_APP_SPOTIFY_CLIENT_ID) {
  throw new Error(
    `No spotify client id provided check env is ${JSON.stringify(process.env)}`
  );
}

export const SpotifyPlayerProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { data: tokenData } = useGetToken();

  if (!tokenData?.access_token) {
    return <>{children}</>;
  }
  return (
    <SpotifyWebSDK
      name="Spotify Tree"
      getOAuthToken={(cb) => {
        if (!tokenData?.access_token) {
          console.error(
            `cannot get access token in player tokenData:${JSON.stringify(
              tokenData
            )}`
          );
        }
        if (tokenData?.access_token) {
          cb(tokenData?.access_token);
        }
      }}
      volume={0.5}
    >
      {children}
    </SpotifyWebSDK>
  );
};
