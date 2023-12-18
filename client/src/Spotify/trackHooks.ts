import { useQuery } from "react-query";
import { useSpotify } from ".";

export function useGetSpotifyTrack(id?: string) {
  const sdk = useSpotify();
  const queryData = useQuery(
    ["spotify_track", id],
    () => {
      if (!id) {
        throw new Error(
          "cannot get track if no id is provided!! (this query should not be enabled)"
        );
      }
      return sdk.tracks.get(id);
    },
    { enabled: !!id }
  );
  return queryData;
}
export function useGetSpotifyTracks(ids?: string[]) {
  const sdk = useSpotify();
  const queryData = useQuery(
    ["spotify_track", ids],
    () => {
      if (!ids) {
        throw new Error(
          "cannot get track if no id is provided!! (this query should not be enabled)"
        );
      }
      return sdk.tracks.get(ids);
    },
    { enabled: !!ids?.length }
  );
  return queryData;
}
