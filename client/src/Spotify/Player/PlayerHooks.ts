import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSpotify } from "..";
import { Track } from "@spotify/web-api-ts-sdk";
import { useGetPlaylistItems } from "@app/Spotify/playlistHooks";
import { useEffect } from "react";

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
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const playbackContext = playbackState?.context;
  const playlistId = playbackContext?.href.split("/").at(-1);

  const queryData = useGetPlaylistItems(playlistId);
  return queryData;
}
export function useGetNextSong(currentSong?: Track) {
  const query = useGetContextPlaylist();
  const trackPages = query.data?.pages;
  const tracks = trackPages?.flatMap((trackPage) => trackPage.items);
  if (tracks && currentSong) {
    const currentIndex = tracks?.findIndex(
      (track) => track.track.id === currentSong.id
    );
    if (!currentIndex) {
      query.hasNextPage && query.fetchNextPage();
      return { ...query, data: undefined };
    }
    return { ...query, data: tracks[(currentIndex + 1) % tracks?.length] };
  }
  return { ...query, data: undefined };
}
export function useTransitionTrackWhenDoneEffect() {
  const queryClient = useQueryClient();
  const playbackContext = useGetSpotifyPlaybackState();
  const context = playbackContext?.data;

  useEffect(() => {
    if (context?.item.duration_ms && context?.progress_ms) {
      const songTransition = setTimeout(() => {
        queryClient.invalidateQueries("playbackState");
      }, context.item.duration_ms - context.progress_ms);
      return () => {
        clearTimeout(songTransition);
      };
    }
  }, [context?.item.duration_ms, context?.progress_ms, queryClient]);
}
export function useSkipSong() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation(
    ["skip"],
    async () => {
      if (deviceId && !queryData?.isLoading) {
        return sdk.player.skipToNext(deviceId);
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
