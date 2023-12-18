import { useCreatePlaylist, useGetPlaylist } from "@app/Spotify/playlistHooks";
import { useGetUser } from "@app/Spotify/userhooks";
import { useLocalStorage } from "@app/hooks";
import { useEffect } from "react";

export function useHistoryPlaylist() {
  const { mutate: createPlaylist } = useCreatePlaylist();
  const { data: userData } = useGetUser();
  const [playlistId, setPlayListId] = useLocalStorage("history-playlist-id");
  const playlistQuery = useGetPlaylist(playlistId);
  useEffect(() => {
    if (playlistQuery.data?.id && playlistId !== playlistQuery.data?.id) {
      setPlayListId(playlistQuery.data?.id);
    }
  }, [playlistQuery.data?.id, playlistId, setPlayListId]);
  useEffect(() => {
    if (userData?.id && !playlistId) {
      createPlaylist(
        { name: "[quantum] history playlist", userId: userData?.id },
        {
          onError: (error) => {
            console.error(error);
          },
          onSuccess: (data) => {
            setPlayListId(data?.id);
          },
        }
      );
    }
  }, [
    playlistQuery.isIdle,
    createPlaylist,
    playlistQuery.isError,
    playlistId,
    setPlayListId,
    userData?.id,
  ]);
  return playlistQuery;
}
