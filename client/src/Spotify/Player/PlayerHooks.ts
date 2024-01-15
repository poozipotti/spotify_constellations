import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSpotify } from "..";
import { useEffect } from "react";

export function useGetSpotifyPlaybackState() {
  const sdk = useSpotify();
  const queryData = useQuery({
    queryKey: ["playbackState"],

    queryFn: () => {
      return sdk.player.getPlaybackState();
    }
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
        queryClient.invalidateQueries("user-queue");
      },
    }
  );
  return queryData;
}
export function usePlayPlaylist() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation(
    async ({ contextUri, offset }: { contextUri: string; offset?: object }) => {
      if (deviceId && !queryData?.isLoading) {
        sdk.player.startResumePlayback(deviceId, contextUri, undefined, offset);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("playbackState");
        queryClient.invalidateQueries("user-queue");
      },
    }
  );
  return queryData;
}
export function useGetUserQueue() {
  const sdk = useSpotify();
  const queryData = useQuery({
    queryKey: ["user-queue"],

    queryFn: () => {
      return sdk.player.getUsersQueue();
    }
  });
  return queryData;
}
export function useGetNextSong() {
  const queueQuery = useGetUserQueue();
  return { ...queueQuery, data: queueQuery.data?.queue[0] };
}

export function useTransitionTrackWhenDoneEffect() {
  const queryClient = useQueryClient();
  const playbackContext = useGetSpotifyPlaybackState();
  const context = playbackContext?.data;

  useEffect(() => {
    if (context?.item.duration_ms && context?.progress_ms) {
      const songTransition = setTimeout(() => {
        queryClient.invalidateQueries("playbackState");
        queryClient.invalidateQueries("user-queue");
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
        queryClient.invalidateQueries("user-queue");
      },
    }
  );
  return queryData;
}
export function useSkipToPrevSong() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation(
    ["skip"],
    async () => {
      if (deviceId && !queryData?.isLoading) {
        return sdk.player.skipToPrevious(deviceId);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("playbackState");
        queryClient.invalidateQueries("user-queue");
      },
    }
  );
  return queryData;
}
export function useSetShuffle() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const { data: playbackState } = useGetSpotifyPlaybackState();
  const deviceId = playbackState?.device.id;
  const queryData = useMutation(
    ["skip"],
    async ({shouldShuffle}:{shouldShuffle:boolean}) => {
      if (deviceId && !queryData?.isLoading) {
        return sdk.player.togglePlaybackShuffle(shouldShuffle);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("playbackState");
        queryClient.invalidateQueries("user-queue");
      },
    }
  );
  return queryData;
}
