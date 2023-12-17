import { useInfiniteQuery, useMutation, useQuery } from "react-query";
import { useSpotify } from ".";
import { useGetUser } from "./userhooks";

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

export function useCreatePlaylist() {
  const sdk = useSpotify();
  const { data: userData } = useGetUser();
  const query = useMutation(["create-playlist"], async (name: string) => {
    if (userData) {
      return sdk.playlists.createPlaylist(userData?.id, {
        name,
      });
    }
  });
  return query;
}
