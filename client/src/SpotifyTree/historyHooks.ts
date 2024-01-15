import TrackModel from "@api/models/track.model";
import { useGetNextSong, useSetShuffle } from "@app/Spotify/Player/PlayerHooks";
import {
  useAddTracksToPlaylist,
  useCreatePlaylist,
  useGetPlaylist,
  useGetPlaylistLastThreeTracks,
} from "@app/Spotify/playlistHooks";
import { useGetUser } from "@app/Spotify/userhooks";
import { useLocalStorage } from "@app/hooks";
import { Track } from "@spotify/web-api-ts-sdk";
import { useEffect } from "react";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";

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

export function useHistoryLastThreeSongs() {
  const [playlistId] = useLocalStorage("history-playlist-id");
  const historyPlaylistQuery = useGetPlaylistLastThreeTracks(playlistId);
  return historyPlaylistQuery;
}

export function useSyncHistoryWebEffect(
  childrenTracks: TrackModel[],
  selectedTrack?: TrackModel,
  currentTrack?: TrackModel
) {
  const historyPlaylistQuery = useHistoryPlaylist({ canCreate: true });

  const nextTrack = useGetNextSong();
  const lastThreeSongsQuery = useHistoryLastThreeSongs();
  const lastThreeTracks = lastThreeSongsQuery.data?.items;
  const spotifyFirstChild = useGetSpotifyTrack(currentTrack?.spotify_id);
  const spotifyselectedTrack = useGetSpotifyTrack(selectedTrack?.spotify_id);

  const { mutate: setShuffle } = useSetShuffle();
  const { mutate: addToPlaylist, isLoading: addToPlaylistIsLoading } =
    useAddTracksToPlaylist();
  const { mutate: deleteFromPlaylist, isLoading: deleteFromPlaylistIsLoading } =
    useAddTracksToPlaylist();

  useEffect(() => {
    if (currentTrack && lastThreeTracks) {
      const canAddTrack =
        lastThreeTracks[lastThreeTracks.length - 1].track.id ===
        currentTrack.id;

      const lastTrackInChildren = childrenTracks.find((childTrack) => {
        lastThreeTracks[lastThreeTracks.length - 1].track.id !== childTrack.id;
      });
      const selectedTrackNeedsSync = selectedTrack?.id !== currentTrack.id;
      const shouldDeleteLastTrack =
        (!canAddTrack && !lastTrackInChildren) || selectedTrackNeedsSync;
      const playlistId = historyPlaylistQuery.data?.id;
      if (
        playlistId &&
        canAddTrack &&
        (spotifyselectedTrack.data || spotifyFirstChild.data) &&
        !addToPlaylistIsLoading
      ) {
        addToPlaylist({
          playlistId,
          tracks: [
            (spotifyselectedTrack.data || spotifyFirstChild.data) as Track,
          ],
        });
      }
      if (
        playlistId &&
        shouldDeleteLastTrack &&
        lastThreeTracks[2] &&
        deleteFromPlaylistIsLoading
      ) {
        deleteFromPlaylist({ playlistId, tracks: [lastThreeTracks[2].track] });
      }
    }
  }, [
    addToPlaylist,
    addToPlaylistIsLoading,
    childrenTracks,
    currentTrack,
    deleteFromPlaylist,
    deleteFromPlaylistIsLoading,
    historyPlaylistQuery?.data,
    lastThreeTracks,
    selectedTrack?.id,
    spotifyFirstChild?.data,
    spotifyselectedTrack?.data,
  ]);
}
