import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSpotify } from ".";

export function useGetSpotifyTrack(id?: string) {
  const sdk = useSpotify();
  const queryData = useQuery({
    queryKey: ["spotify_track", id],

    queryFn: () => {
      if (!id) {
        throw new Error(
          "cannot get track if no id is provided!! (this query should not be enabled)"
        );
      }
      return sdk.tracks.get(id);
    },

    enabled: !!id,
  });
  return queryData;
}
export function useGetSpotifyTracks(ids?: string[]) {
  const sdk = useSpotify();
  const queryData = useQuery({
    queryKey: ["spotify_track", ids],

    queryFn: () => {
      if (!ids) {
        throw new Error(
          "cannot get track if no id is provided!! (this query should not be enabled)"
        );
      }
      return sdk.tracks.get(ids);
    },

    enabled: !!ids?.length,
  });
  return queryData;
}

const TRACK_PAGE_SIZE = 25;
export const useGetSpotifySavedTracks = () => {
  const spotify = useSpotify();

  const searchQuery = useInfiniteQuery({
    queryKey: ["saved_tracks"],
    queryFn: ({ pageParam }) => {
      return spotify.currentUser.tracks.savedTracks(TRACK_PAGE_SIZE, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.next ? pages.length * lastPage.limit : undefined,
  });
  return searchQuery;
};
