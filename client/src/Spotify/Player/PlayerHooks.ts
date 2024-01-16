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
export function useGetNextTrack() {
  const sdk = useSpotify();
  const queryData = useQuery({
    queryKey: ["user-queue"],

    queryFn: () => {
      return sdk.player.getUsersQueue();
    },
  });
  const currentTrack = useGetSpotifyPlaybackState();
  const hasNextTrack =
    currentTrack && queryData.data?.queue[0]?.id !== currentTrack.data?.item?.id;
  const nextTrack = hasNextTrack ? queryData.data?.queue[0] : undefined;
  return { ...queryData, data: nextTrack };
}

export function useTransitionTrackWhenDoneEffect() {
  const queryClient = useQueryClient();
  const playbackContext = useGetSpotifyPlaybackState();
  const context = playbackContext?.data;

  useEffect(() => {
    if (context?.item.duration_ms && context?.progress_ms) {
      const trackTransition = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["playbackState"] });
        queryClient.invalidateQueries({ queryKey: ["user-queue"] });
      }, context.item.duration_ms - context.progress_ms);
      return () => {
        clearTimeout(trackTransition);
      };
    }
  }, [context?.item.duration_ms, context?.progress_ms, queryClient]);
}
export function useSkipTrack() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const nextTrack = useGetNextTrack();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation({
    mutationFn: async () => {
      if (deviceId && nextTrack) {
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
export function useSkipToPrevTrack() {
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
