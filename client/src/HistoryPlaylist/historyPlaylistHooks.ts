import { usePlayPlaylist } from "@app/Spotify/Player/PlayerHooks";
import {
  useAddTracksToPlaylist,
  useCreatePlaylist,
  useGetPlaylist,
  useGetPlaylistLastThreeTracks,
} from "@app/Spotify/playlistHooks";
import { useGetUser } from "@app/Spotify/userhooks";
import { useLocalStorage } from "@app/hooks";
import { Track } from "@spotify/web-api-ts-sdk";
import { useCallback, useEffect } from "react";

export function useHistoryPlaylist(
  { canCreate }: { canCreate: boolean } = { canCreate: false }
) {
  const { mutate: createPlaylist, isPending } = useCreatePlaylist(
    "[quantum] history playlist"
  );
  const { data: userData } = useGetUser();
  const [playlistId, setPlayListId] = useLocalStorage("history-playlist-id");
  const playlistQuery = useGetPlaylist(playlistId, {
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!playlistId && userData?.id && !isPending && canCreate) {
      createPlaylist(
        { userId: userData?.id },
        {
          onError: (error) => {
            console.error(error);
          },
          onSuccess: (data) => {
            console.log(data);
            return setPlayListId(data?.id);
          },
        }
      );
    }
  }, [
    playlistId,
    userData?.id,
    isPending,
    canCreate,
    createPlaylist,
    setPlayListId,
  ]);
  return playlistQuery;
}

export function useHistoryLastThreeTracks() {
  const [playlistId] = useLocalStorage("history-playlist-id");
  const historyPlaylistQuery = useGetPlaylistLastThreeTracks(playlistId);
  return historyPlaylistQuery;
}

export function useAddTracksToHistoryPlaylist() {
  const historyPlaylistQuery = useHistoryPlaylist();
  const playlistId = historyPlaylistQuery.data?.id;
  const { mutate: addToPlaylist, isPending: addToPlaylistIsLoading } =
    useAddTracksToPlaylist();

  const addTracksToHistoryPlaylist = useCallback(
    (
      track: Track | undefined,
      options?: Parameters<typeof addToPlaylist>[1]
    ) => {
      if (track && playlistId && !addToPlaylistIsLoading) {
        return addToPlaylist(
          {
            playlistId,
            tracks: [track],
          },
          options
        );
      }
    },
    [addToPlaylist, addToPlaylistIsLoading, playlistId]
  );
  return addTracksToHistoryPlaylist;
}
export function usePlayHistoryPlaylist() {
  const historyPlaylistQuery = useHistoryPlaylist();
  const playPlaylistQuery = usePlayPlaylist();
  const playPlaylist = useCallback(
    (
      track: Track | undefined,
      options?: Parameters<typeof playPlaylistQuery.mutate>[1]
    ) => {
      if (historyPlaylistQuery.data?.uri) {
        const mutationData = track?.uri
          ? {
              contextUri: historyPlaylistQuery.data?.uri,
              offset: { uri: track.uri },
            }
          : {
              contextUri: historyPlaylistQuery.data?.uri,
            };
            console.log(mutationData)
        return playPlaylistQuery.mutate(mutationData, options);
      }
    },
    [historyPlaylistQuery.data?.uri]
  );
  return playPlaylist;
}
