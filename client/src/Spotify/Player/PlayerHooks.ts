import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSpotify } from "..";
import { Track } from "@spotify/web-api-ts-sdk";

export function useGetSpotifyPlaybackState() {
  const sdk = useSpotify();
  const queryData = useQuery(["playbackState"], () => {
    return sdk.player.getPlaybackState();
  });
  return queryData;
}
export function usePlayPause() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation(
    ["playpause"],
    async () => {
      if (deviceId && !queryData?.isLoading) {
        return playbackState?.is_playing
          ? sdk.player.pausePlayback(deviceId)
          : sdk.player.startResumePlayback(deviceId);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("playbackState");
      },
    }
  );
  return queryData;
}
export function useGetContextPlaylist() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const playbackContext = playbackState?.context;
  const playlistId = playbackContext?.href.split("/").at(-1);
  const queryData = useQuery(
    ["currentPlaybackContext", playlistId],
    () => {
      if (playbackContext?.type !== "playlist") {
        throw new Error("cannot get context unless inside playlist");
      }
      if (!playlistId) {
        throw new Error("no playlist in context");
      }
      return sdk.playlists.getPlaylist(playlistId);
    },
    { enabled: !!playlistId }
  );
  return queryData;
}
export function useGetNextSong(currentSong?: Track) {
  const query = useGetContextPlaylist();
  const tracks = query.data?.tracks.items;
  if (tracks && currentSong) {
    const currentIndex = tracks?.findIndex(
      (track) => track.track.id === currentSong.id
    );
    return { ...query, data: tracks[(currentIndex + 1) % tracks?.length] };
  }
  return { ...query, data: undefined };
}
