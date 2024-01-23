import { useSpotifyPlayer } from "@app/Spotify/Player";
import { usePlayPlaylist } from "@app/Spotify/Player/PlayerHooks";
import {
  useAddTracksToPlaylist,
  useCreatePlaylist,
  useGetPlaylist,
  useGetPlaylistLastThreeTracks,
} from "@app/Spotify/playlistHooks";
import { useGetUser } from "@app/Spotify/userhooks";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";
import { useLocalStorage } from "@app/hooks";
import { Track } from "@spotify/web-api-ts-sdk";
import { useCallback, useEffect, useMemo } from "react";

export function useHistoryPlaylist(
  { canCreate }: { canCreate: boolean } = { canCreate: false }
) {
  const { mutate: createPlaylist, isPending } = useCreatePlaylist(
    "[constellations] history playlist"
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
  const { mutate: addToPlaylist, ...mtnData } = useAddTracksToPlaylist();

  const addTracksToHistoryPlaylist = useCallback(
    (
      track: Track | undefined,
      options?: Parameters<typeof addToPlaylist>[1]
    ) => {
      if (track && playlistId && !mtnData.isPending) {
        return addToPlaylist(
          {
            playlistId,
            tracks: [track],
          },
          options
        );
      }
    },
    [addToPlaylist, mtnData.isPending, playlistId]
  );
  return { ...mtnData, mutate: addTracksToHistoryPlaylist };
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
        return playPlaylistQuery.mutate(mutationData, options);
      }
    },
    [historyPlaylistQuery.data?.uri]
  );
  return { ...playPlaylistQuery, mutate: playPlaylist };
}
export function useGetHistorySyncStatus() {
  const player = useSpotifyPlayer();
  const constellationGraph = useSpotifyConstellationGraph();
  const currentTrack = player.state?.currentTrack;
  const isCurrentSongInConstellationGraph = !!(
    constellationGraph?.state.currentTrack &&
    !constellationGraph?.state.isLoading
  );
  const lastThreeTracks = useHistoryLastThreeTracks();
  const isCurrentSongInLastThreeTracks = !!lastThreeTracks.data?.items.find(
    (PlaylistedTrack) =>
      currentTrack && PlaylistedTrack?.track.id === currentTrack?.id
  );

  const historyPlaylist = useHistoryPlaylist({ canCreate: true });
  const isCurrentlyPlayingHistoryPlaylist =
    player.state.context?.uri === historyPlaylist.data?.uri;
  const data = useMemo(
    () => ({
      isCurrentSongInConstellationGraph,
      isCurrentSongInLastThreeTracks,
      isCurrentlyPlayingHistoryPlaylist,
    }),
    [
      isCurrentSongInConstellationGraph,
      isCurrentSongInLastThreeTracks,
      isCurrentlyPlayingHistoryPlaylist,
    ]
  );
  return data;
}
