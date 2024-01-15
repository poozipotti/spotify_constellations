import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSpotify } from ".";

export function useGetPlaylistLastThreeTracks(playlistId?: string) {
  const sdk = useSpotify();
  const playlistQuery = useGetPlaylist(playlistId);
  const totalItems = playlistQuery?.data?.tracks.total;
  const query = useQuery({
    queryKey: ["playlist-last-three", playlistId],

    queryFn: () => {
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

    enabled: !!playlistId && !!totalItems,
  });

  return query;
}

export function useGetPlaylist(
  playlistId?: string,
  options?: { onError: () => void }
) {
  const sdk = useSpotify();
  const query = useQuery({
    queryKey: ["playlist", playlistId],

    queryFn: () => {
      if (!playlistId) {
        throw new Error("no playlistId passed cannot get playlist");
      }
      return sdk.playlists.getPlaylist(playlistId);
    },

    enabled: !!playlistId,
    ...(options || {}),
  });

  return query;
}

export function useCreatePlaylist(name: string) {
  const sdk = useSpotify();
  const query = useMutation({
    mutationKey: ["create-playlist", name],
    mutationFn: async ({ userId }: { userId: string }) => {
      return sdk.playlists.createPlaylist(userId, {
        name,
      });
    },
  });
  return query;
}
export function useAddTracksToPlaylist() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const query = useMutation({
    mutationFn: async ({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist"] });
      queryClient.invalidateQueries({ queryKey: ["playbackState"] });
      queryClient.invalidateQueries({ queryKey: ["playlist-last-three"] });
      queryClient.invalidateQueries({ queryKey: ["user-queue"] });
    },
  });
  return query;
}
export function useDeleteTracksFromPlaylist() {
  const sdk = useSpotify();
  const queryClient = useQueryClient();
  const query = useMutation({
    mutationFn: async ({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist"] });
      queryClient.invalidateQueries({ queryKey: ["playbackState"] });
      queryClient.invalidateQueries({ queryKey: ["playlist-last-three"] });
      queryClient.invalidateQueries({ queryKey: ["user-queue"] });
    },
  });
  return query;
}
