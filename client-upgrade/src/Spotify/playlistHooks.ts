import { useInfiniteQuery } from "react-query";
import { useSpotify } from ".";

const PAGE_SIZE = 49;
export function useGetPlaylistItems(playlistId?: string) {
  const sdk = useSpotify();
  const query = useInfiniteQuery(
    ["playlist", playlistId],
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
