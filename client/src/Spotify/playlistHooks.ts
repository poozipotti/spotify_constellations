import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useSpotify } from ".";

const PAGE_SIZE = 49;

export function useGetPlaylistItems(playlistId?: string) {
  const sdk = useSpotify();
  const query = useInfiniteQuery(
    ["playlist-items", playlistId],
    ({ pageParam = 0 }) => {
      if (!playlistId) {
        throw new Error("no playlistId passed cannot get playlist");
      }
      return sdk.playlists.getPlaylistItems(
        playlistId,
        undefined,
        undefined,
        PAGE_SIZE,
        pageParam
      );
    },
    {
      enabled: !!playlistId,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.next && allPages.length * PAGE_SIZE,
    }
  );

  return query;
}
export function useGetPlaylistLastThreeTracks(playlistId?: string) {
  const sdk = useSpotify();
  const playlistQuery = useGetPlaylist(playlistId);
  const totalItems = playlistQuery?.data?.tracks.total;
  const query = useQuery(
    ["playlist-last-three", playlistId],
    () => {
      if (!playlistId || typeof totalItems === "undefined") {
        throw new Error("Error getting playlist state please refresh");
      }
      return sdk.playlists.getPlaylistItems(
        playlistId,
        undefined,
        undefined,
        Math.min(totalItems, 3) as 0 | 1 | 2 | 3,
        Math.max(totalItems - Math.min(totalItems, 3))
      );
    },
    {
      enabled: !!playlistId && !!totalItems,
    }
  );

  return query;
}

export function useGetPlaylist(
  playlistId?: string,
  options?: { onError: () => void }
) {
  const sdk = useSpotify();
  const query = useQuery(
    ["playlist", playlistId],
    () => {
      if (!playlistId) {
        throw new Error("no playlistId passed cannot get playlist");
      }
      return sdk.playlists.getPlaylist(playlistId);
    },
    {
      enabled: !!playlistId,
      ...(options || {}),
    }
  );

  return query;
}

export function useCreatePlaylist(name: string) {
  const sdk = useSpotify();
  const query = useMutation(
    ["create-playlist", name],
    async ({ userId }: { userId: string }) => {
      return sdk.playlists.createPlaylist(userId, {
        name,
      });
    }
  );
  return query;
}
export function useAddTracksToPlaylist() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const query = useMutation(
    async ({
      playlistId,
      tracks,
    }: {
      playlistId: string;
      tracks: { uri: string }[];
    }) => {
      return sdk.playlists.addItemsToPlaylist(
        playlistId,
        tracks.map((track) => track.uri)
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("playlist");
        queryClient.invalidateQueries("playbackState");
        queryClient.invalidateQueries("user-queue");
      },
    }
  );
  return query;
}
export function useDeleteTracksFromPlaylist() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const query = useMutation(
    async ({
      playlistId,
      tracks,
    }: {
      playlistId: string;
      tracks: { uri: string }[];
    }) => {
      return sdk.playlists.removeItemsFromPlaylist(playlistId, {
        tracks: tracks,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("playlist");
        queryClient.invalidateQueries("playbackState");
        queryClient.invalidateQueries("user-queue");
      },
    }
  );
  return query;
}
