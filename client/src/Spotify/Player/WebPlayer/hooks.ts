import React from "react";
import {
  useSpotifyDevice,
  useSpotifyPlayer,
  useSpotifyState,
} from "spotify-web-playback-sdk-for-react";
import { useGetSpotifyPlaybackState } from "../PlayerHooks";
import { useMutation } from "react-query";

export function usePlayerState() {
  const player = useSpotifyPlayer();
  const state = useSpotifyState();
  const device = useSpotifyDevice();
  const activatePlayer = useMutation("activatePlayer", async () => {
    return player?.activateElement;
  });
  const {
    data: playBackData,
    isLoading: spotifyDataLoading,
    ...queryData
  } = useGetSpotifyPlaybackState();
  React.useEffect(() => {
    if (!playBackData?.device.is_active && !spotifyDataLoading) {
      activatePlayer.mutate();
    }
  }, [activatePlayer, playBackData, spotifyDataLoading]);
  if (spotifyDataLoading) {
    return { data: playBackData, isLoading: spotifyDataLoading, ...queryData };
  }
  if (playBackData?.device.id === device?.device_id) {
    return { data: state, ...queryData };
  }
  return { data: playBackData, isLoading: spotifyDataLoading, ...queryData };
}
