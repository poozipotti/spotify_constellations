import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSpotify } from "..";
import { useEffect } from "react";
import { PlaybackState } from "@spotify/web-api-ts-sdk";

export function useGetSpotifyPlaybackState() {
  const sdk = useSpotify();
  const queryData = useQuery({
    queryKey: ["playbackState"],

    queryFn: () => {
      return sdk.player.getPlaybackState();
    },
    staleTime: Infinity,
  });
  return queryData;
}
export function usePlayPause() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation({
    mutationFn: async () => {
      if (deviceId) {
        return playbackState?.is_playing
          ? sdk.player.pausePlayback(deviceId)
          : sdk.player.startResumePlayback(deviceId);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ["playbackState"],
        (oldPlaybackState: PlaybackState) => {
          if (!oldPlaybackState) {
            return undefined;
          }
          const newPlaybackState: PlaybackState = {
            ...oldPlaybackState,
            is_playing: !oldPlaybackState.is_playing,
          };
          return newPlaybackState;
        }
      );
    },
  });
  return queryData;
}
export function usePlayPlaylist() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation({
    mutationFn: async ({
      contextUri,
      offset,
    }: {
      contextUri: string;
      offset?: object;
    }) => {
      if (deviceId) {
        sdk.player.startResumePlayback(deviceId, contextUri, undefined, offset);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbackState"] });
      queryClient.invalidateQueries({ queryKey: ["user-queue"] });
    },
  });
  return queryData;
}
export function useGetNextSong() {
  const sdk = useSpotify();
  const queryData = useQuery({
    queryKey: ["user-queue"],

    queryFn: () => {
      return sdk.player.getUsersQueue();
    },
  });
  const currentSong = useGetSpotifyPlaybackState();
  const hasNextSong =
    currentSong && queryData.data?.queue[0]?.id !== currentSong.data?.item?.id;
  const nextSong = hasNextSong ? queryData.data?.queue[0] : undefined;
  return { ...queryData, data: nextSong };
}

export function useTransitionTrackWhenDoneEffect() {
  const queryClient = useQueryClient();
  const playbackContext = useGetSpotifyPlaybackState();
  const context = playbackContext?.data;

  useEffect(() => {
    if (context?.item.duration_ms && context?.progress_ms) {
      const songTransition = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["playbackState"] });
        queryClient.invalidateQueries({ queryKey: ["user-queue"] });
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
  const nextSong = useGetNextSong();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation({
    mutationFn: async () => {
      if (deviceId && nextSong) {
        return sdk.player.skipToNext(deviceId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbackState"] });
      queryClient.invalidateQueries({ queryKey: ["user-queue"] });
    },
  });
  return queryData;
}
export function useSkipToPrevSong() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation({
    mutationFn: async () => {
      if (deviceId) {
        return sdk.player.skipToPrevious(deviceId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbackState"] });
      queryClient.invalidateQueries({ queryKey: ["user-queue"] });
    },
  });
  return queryData;
}
export function useSetShuffle() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation({
    mutationFn: async ({ shouldShuffle }: { shouldShuffle: boolean }) => {
      if (deviceId) {
        return sdk.player.togglePlaybackShuffle(shouldShuffle);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbackState"] });
      queryClient.invalidateQueries({ queryKey: ["user-queue"] });
    },
  });
  return queryData;
}
