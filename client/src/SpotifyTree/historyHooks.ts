import TrackModel from "@api/models/track.model";
import {
  useAddTracksToPlaylist,
  useCreatePlaylist,
  useDeleteTracksFromPlaylist,
  useGetPlaylist,
  useGetPlaylistLastThreeTracks,
} from "@app/Spotify/playlistHooks";
import { useGetUser } from "@app/Spotify/userhooks";
import { useLocalStorage } from "@app/hooks";
import { useEffect, useMemo } from "react";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";
import { Track } from "@spotify/web-api-ts-sdk";

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

export function useHistoryLastThreeSongs() {
  const [playlistId] = useLocalStorage("history-playlist-id");
  const historyPlaylistQuery = useGetPlaylistLastThreeTracks(playlistId);
  return historyPlaylistQuery;
}

export function useSyncHistoryWebNextSongEffect(
  childrenTracks?: TrackModel[],
  selectedTrack?: TrackModel,
  currentTrack?: TrackModel
) {
  useSyncHistoryWebEffectAddTracks(
    childrenTracks,
    selectedTrack,
    currentTrack
  );
  useSyncHistoryWebEffectDeleteTracks(
    childrenTracks,
    selectedTrack,
    currentTrack
  );
}

export function useSyncHistoryWebEffectDeleteTracks(
  childrenTracks?: TrackModel[],
  selectedTrack?: TrackModel,
  currentTrack?: TrackModel
) {
  const historyPlaylistQuery = useHistoryPlaylist();

  const lastThreeSongsQuery = useHistoryLastThreeSongs();
  const lastThreeTracks = useMemo(
    () => lastThreeSongsQuery.data?.items,
    [lastThreeSongsQuery.data]
  );
  const lastTrack = useMemo(
    () =>
      lastThreeTracks
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
        console.log("deleting");
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
  childrenTracks?: TrackModel[],
  selectedTrack?: TrackModel,
  currentTrack?: TrackModel
) {
  const historyPlaylistQuery = useHistoryPlaylist({ canCreate: true });

  const lastThreeSongsQuery = useHistoryLastThreeSongs();
  const lastThreeTracks = useMemo(
    () => lastThreeSongsQuery.data?.items,
    [lastThreeSongsQuery.data]
  );
  const spotifyCurrentTrack = useGetSpotifyTrack(currentTrack?.spotify_id);
  const spotifyselectedTrack = useGetSpotifyTrack(selectedTrack?.spotify_id);

  const { mutate: addToPlaylist, isPending: addToPlaylistIsLoading } =
    useAddTracksToPlaylist();

  const playlistId = historyPlaylistQuery.data?.id;

  useEffect(() => {
    if (
      spotifyCurrentTrack.data &&
      lastThreeTracks &&
      spotifyselectedTrack.data &&
      playlistId &&
      !addToPlaylistIsLoading &&
      (spotifyselectedTrack.data || spotifyCurrentTrack.data)
    ) {
      const canAddTrack =
        lastThreeTracks[lastThreeTracks.length - 1].track.id ===
        spotifyCurrentTrack.data.id;
      if (canAddTrack) {
        console.log("adding");
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
  ]);
}
