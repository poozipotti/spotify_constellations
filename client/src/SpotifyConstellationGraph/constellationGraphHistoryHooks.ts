import TrackModel from "@api/models/track.model";
import {
  useAddTracksToPlaylist,
  useDeleteTracksFromPlaylist,
} from "@app/Spotify/playlistHooks";
import { useEffect, useMemo } from "react";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";
import { Track } from "@spotify/web-api-ts-sdk";
import {
  useHistoryLastThreeTracks,
  useHistoryPlaylist,
} from "@app/HistoryPlaylist/historyPlaylistHooks";


export function useSyncHistoryWebNextTrackEffect(
  selectedTrack?: TrackModel,
  currentTrack?: TrackModel
) {
  useSyncHistoryWebEffectAddTracks(
    selectedTrack,
    currentTrack
  );
  useSyncHistoryWebEffectDeleteTracks(
    selectedTrack,
    currentTrack
  );
}

export function useSyncHistoryWebEffectDeleteTracks(
  selectedTrack?: TrackModel,
  currentTrack?: TrackModel
) {
  const historyPlaylistQuery = useHistoryPlaylist();

  const lastThreeTracksQuery = useHistoryLastThreeTracks();
  const lastThreeTracks = useMemo(
    () => lastThreeTracksQuery.data?.items,
    [lastThreeTracksQuery.data]
  );
  const lastTrack = useMemo(
    () =>
      lastThreeTracks?.length
        ? (lastThreeTracks[lastThreeTracks?.length - 1].track as Track)
        : undefined,
    [lastThreeTracks]
  );
  const spotifyselectedTrack = useGetSpotifyTrack(selectedTrack?.spotify_id);

  const { mutate: deleteFromPlaylist, isPending: deleteFromPlaylistIsLoading } =
    useDeleteTracksFromPlaylist();

  useEffect(() => {
    if (currentTrack && spotifyselectedTrack.data && lastTrack) {
      const canAddTrack = lastTrack.id === currentTrack.spotify_id;

      const lastTrackNotSyncedToSelected =
        lastTrack.id !== spotifyselectedTrack.data?.id;

      const shouldDeleteLastTrack =
        !canAddTrack && lastTrackNotSyncedToSelected;

      const playlistId = historyPlaylistQuery.data?.id;

      if (playlistId && shouldDeleteLastTrack && !deleteFromPlaylistIsLoading) {
        deleteFromPlaylist({
          playlistId,
          tracks: [lastTrack],
        });
      }
    }
  }, [
    currentTrack,
    deleteFromPlaylistIsLoading,
    historyPlaylistQuery.data?.id,
    lastTrack,
    spotifyselectedTrack.data,
  ]);
}
export function useSyncHistoryWebEffectAddTracks(
  selectedTrack?: TrackModel,
  currentTrack?: TrackModel
) {
  const historyPlaylistQuery = useHistoryPlaylist();

  const lastThreeTracksQuery = useHistoryLastThreeTracks();
  const lastThreeTracks = useMemo(
    () => lastThreeTracksQuery.data?.items,
    [lastThreeTracksQuery.data]
  );
  const spotifyCurrentTrack = useGetSpotifyTrack(currentTrack?.spotify_id);
  const spotifyselectedTrack = useGetSpotifyTrack(selectedTrack?.spotify_id);

  const { mutate: addToPlaylist, isPending: addToPlaylistIsLoading } =
    useAddTracksToPlaylist();

  const playlistId = historyPlaylistQuery.data?.id;

  useEffect(() => {
    if (
      spotifyCurrentTrack.data &&
      lastThreeTracks?.length &&
      spotifyselectedTrack.data &&
      playlistId &&
      !addToPlaylistIsLoading &&
      (spotifyselectedTrack.data || spotifyCurrentTrack.data)
    ) {
      const canAddTrack =
        lastThreeTracks[lastThreeTracks.length - 1].track.id ===
        spotifyCurrentTrack.data.id;
      if (canAddTrack) {
        addToPlaylist({
          playlistId,
          tracks: [spotifyselectedTrack.data],
        });
      }
    }
  }, [
    lastThreeTracks,
    spotifyselectedTrack.data,
    historyPlaylistQuery.data?.id,
    spotifyCurrentTrack,
    addToPlaylistIsLoading,
    playlistId
  ]);
}

