import { useSpotifyPlayer } from "@app/Spotify/Player";
import { usePlayPlaylist } from "@app/Spotify/Player/PlayerHooks";
import { player } from "@app/Spotify/Player/PlayerProvider";
import {
  useAddTracksToPlaylist,
  useCreatePlaylist,
  useGetPlaylist,
  useGetPlaylistLastThreeTracks,
} from "@app/Spotify/playlistHooks";
import { useGetUser } from "@app/Spotify/userhooks";
import { useGetTrackBySpotifyId } from "@app/SpotifyConstellationGraph/apiHooks";
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
export function useHistoryLastTrack() {
  const lastThreeTracks = useHistoryLastThreeTracks();
  const lastThreeTracksLength = lastThreeTracks?.data?.items?.length || 0;
  const lastTrack = lastThreeTracksLength
    ? lastThreeTracks.data?.items[lastThreeTracksLength - 1].track
    : undefined;
  const lastTrackFormatted: Track | undefined =
    lastTrack && "track" in lastTrack ? (lastTrack as Track) : undefined;
  return { ...lastThreeTracks, data: lastTrackFormatted };
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
export function useGetHistorySyncStatus(track?: Track) {
  const player = useSpotifyPlayer();
  const lastThreeTracks = useHistoryLastThreeTracks();
  const webTrack = useGetTrackBySpotifyId(track?.id);

  const isTrackInConstellationGraph = !!webTrack;
  const isTrackInLastThreeTracks = !!lastThreeTracks.data?.items.find(
    (PlaylistedTrack) => track && PlaylistedTrack?.track.id === track?.id
  );

  const historyPlaylist = useHistoryPlaylist();
  const isCurrentlyPlayingHistoryPlaylist =
    player.state.context?.uri === historyPlaylist.data?.uri;

  const data = useMemo(
    () => ({
      isTrackInConstellationGraph,
      isTrackInLastThreeTracks,
      isCurrentlyPlayingHistoryPlaylist,
      isLoading: track
        ? lastThreeTracks.isLoading || webTrack.isLoading
        : player.isLoading,
    }),
    [
      isTrackInConstellationGraph,
      isTrackInLastThreeTracks,
      isCurrentlyPlayingHistoryPlaylist,
      lastThreeTracks.isLoading,
      player.isLoading,
      webTrack.isLoading,
      track
    ]
  );
  return data;
}
