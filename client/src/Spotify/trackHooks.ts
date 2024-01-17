import { useQuery } from "@tanstack/react-query";
import { useSpotify } from ".";

export function useGetSpotifyTrack(id?: string) {
  const sdk = useSpotify();
  const queryData = useQuery({
    queryKey: ["spotify_track", id],

    queryFn: () => {
      if (!id) {
        throw new Error(
          "cannot get track if no id is provided!! (this query should not be enabled)",
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
          "cannot get track if no id is provided!! (this query should not be enabled)",
        );
      }
      return sdk.tracks.get(ids);
    },

    enabled: !!ids?.length,
  });
  return queryData;
}

