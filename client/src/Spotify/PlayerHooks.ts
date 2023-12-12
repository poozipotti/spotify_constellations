import { useQuery } from "react-query";
import { useSpotify } from ".";

export function useGetSpotifyPlaybackState() {
  const sdk = useSpotify();
  const queryData = useQuery(["playbackState"], () => {
    return sdk.player.getPlaybackState()
  });
  return queryData;
}
