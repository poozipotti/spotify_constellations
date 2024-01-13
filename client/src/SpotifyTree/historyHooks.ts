import { useCreatePlaylist, useGetPlaylist } from "@app/Spotify/playlistHooks";
import { useGetUser } from "@app/Spotify/userhooks";
import { useLocalStorage } from "@app/hooks";
import { useEffect } from "react";

export function useHistoryPlaylist(
  { canCreate }: { canCreate: boolean } = { canCreate: false }
) {
  const { mutate: createPlaylist, isLoading } = useCreatePlaylist(
    "[quantum] history playlist"
  );
  const { data: userData } = useGetUser();
  const [playlistId, setPlayListId] = useLocalStorage("history-playlist-id");
  const playlistQuery = useGetPlaylist(playlistId);

  useEffect(() => {
    if (!playlistId && userData?.id && !isLoading && canCreate) {
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
    isLoading,
    canCreate,
    createPlaylist,
    setPlayListId,
  ]);
  return playlistQuery;
}
