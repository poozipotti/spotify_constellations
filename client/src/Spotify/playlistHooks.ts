import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSpotify } from ".";
import {
  Page,
  Playlist,
  PlaylistedTrack,
  Track,
} from "@spotify/web-api-ts-sdk";

export function useGetPlaylistLastThreeTracks(playlistId?: string) {
  const sdk = useSpotify();
  const playlistQuery = useGetPlaylist(playlistId);
  const totalItems = playlistQuery?.data?.tracks.total;
  const query = useQuery({
    queryKey: ["playlist-last-three", playlistId],
    staleTime: Infinity,
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
  options?: { staleTime: number }
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
    staleTime: Infinity,
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
      tracks: Track[];
    }) => {
      return sdk.playlists.addItemsToPlaylist(
        playlistId,
        tracks.map((track) => track.uri)
      );
    },
    onSuccess: (_data, variables) => {
      const newTracksFormatted = variables.tracks.map(formatTrackForPlaylist);
      queryClient.setQueryData(
        ["playlist", variables.playlistId],
        (oldPlaylist?: Playlist) => {
          if (!oldPlaylist) {
            return;
          }
          const newPlaylist: Playlist = {
            ...oldPlaylist,
            tracks: {
              ...oldPlaylist.tracks,
              total: oldPlaylist.tracks.total + 1,
              items: [...oldPlaylist.tracks.items, ...newTracksFormatted],
            },
          };
          return newPlaylist;
        }
      );

      queryClient.setQueryData(
        ["playlist-last-three", variables.playlistId],
        (oldLastThree?: Page<PlaylistedTrack>) => {
          if (!oldLastThree) {
            return;
          }
          const newLastThree: Page<PlaylistedTrack> = {
            ...oldLastThree,
            total: oldLastThree.total + 1,
            items: [...oldLastThree.items, ...newTracksFormatted].slice(-3),
          };
          return newLastThree;
        }
      );

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
      tracks: Track[];
    }) => {
      return sdk.playlists.removeItemsFromPlaylist(playlistId, {
        tracks: tracks,
      });
    },
    onSuccess: (_data, variables) => {
      const isDeletedTrack = (track: PlaylistedTrack) =>
        variables.tracks.find(
          (deletedTrack) => track.track.id === deletedTrack.id
        );
      queryClient.setQueryData(
        ["playlist", variables.playlistId],
        (oldPlaylist?: Playlist) => {
          if (!oldPlaylist?.tracks.items.length) {
            return;
          }
          const newPlaylist: Playlist = {
            ...oldPlaylist,
            tracks: {
              ...oldPlaylist.tracks,
              total: oldPlaylist.tracks.total - 1,
              items: oldPlaylist.tracks.items.filter(
                (track) => !isDeletedTrack(track)
              ),
            },
          };
          return newPlaylist;
        }
      );

      queryClient.setQueryData(
        ["playlist-last-three", variables.playlistId],
        (oldLastThree?: Page<PlaylistedTrack>) => {
          if (!oldLastThree?.items.length) {
            return;
          }
          const newLastThree: Page<PlaylistedTrack> = {
            ...oldLastThree,
            total: oldLastThree.total - 1,
            items: oldLastThree.items.filter((track) => !isDeletedTrack(track)),
          };
          return newLastThree;
        }
      );

      queryClient.invalidateQueries({ queryKey: ["user-queue"] });
    },
  });
  return query;
}

const formatTrackForPlaylist = (track: Track): PlaylistedTrack => ({
  track: track,
  added_at: "",
  is_local: false,
  primary_color: "#000000",
  //TODO this dummy data should be reflected in the typing but we never access it for now
  added_by: {
    external_urls: {
      spotify: "",
    },
    id: "",
    type: "",
    uri: "",
    href: "",
  },
});

const SAVED_PLAYLISTS_PAGE_SIZE = 25;
export const useGetSpotifySavedPlaylists = () => {
  const spotify = useSpotify();

  const searchQuery = useInfiniteQuery({
    queryKey: ["saved_playlists"],
    queryFn: ({ pageParam }) => {
      return spotify.currentUser.playlists.playlists(SAVED_PLAYLISTS_PAGE_SIZE, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.next ? pages.length * lastPage.limit : undefined,
  });
  return searchQuery;
};
