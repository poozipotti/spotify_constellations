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
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

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

export function usePlayHistoryPlaylist(currentTrack?: Track) {
  const [needsToPlay, setNeedsToPlay] = useState(false);
  const historyPlaylistQuery = useHistoryPlaylist({ canCreate: true });
  const playlistId = historyPlaylistQuery.data?.id;
  const playlistUri = historyPlaylistQuery.data?.uri;
  const lastThreeTracksQuery = useHistoryLastThreeTracks();
  const isCurrentTrackInLastThreeTracks =
    !!lastThreeTracksQuery.data?.items.find(
      (playlistedTrack) => playlistedTrack.track.id === currentTrack?.id
    );
  const { mutate: addToPlaylist, isPending: addToPlaylistIsLoading } =
    useAddTracksToPlaylist();

  const playPlaylist = usePlayPlaylist();
  const playHistoryPlaylistDebounced = useDebouncedCallback(() => {
    setNeedsToPlay(true);
  }, 500);
  useEffect(() => {
    if (
      currentTrack &&
      !isCurrentTrackInLastThreeTracks &&
      needsToPlay &&
      playlistId &&
      !addToPlaylistIsLoading
    ) {
      addToPlaylist({
        playlistId,
        tracks: [currentTrack],
      });
    }
  }, [
    addToPlaylistIsLoading,
    currentTrack,
    isCurrentTrackInLastThreeTracks,
    needsToPlay,
    playlistId,
  ]);
  useEffect(() => {
    if (
      needsToPlay &&
      playlistUri &&
      isCurrentTrackInLastThreeTracks &&
      historyPlaylistQuery.data?.tracks.total
    )
      playPlaylist.mutate(
        {
          contextUri: playlistUri,
        },
        {
          onSuccess: () => {
            setNeedsToPlay(false);
          },
        }
      );
  }, [
    historyPlaylistQuery.data?.tracks.total,
    needsToPlay,
    currentTrack,
    history,
    isCurrentTrackInLastThreeTracks,
    playlistUri,
  ]);
  return playHistoryPlaylistDebounced;
}
