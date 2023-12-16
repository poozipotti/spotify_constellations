import { useQuery } from "react-query";
import { useSpotify } from ".";

export function useGetTrack(id?: string) {
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
