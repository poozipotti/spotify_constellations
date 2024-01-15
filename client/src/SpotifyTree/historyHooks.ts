import TrackModel from "@api/models/track.model";
import {
  useAddTracksToPlaylist,
  useCreatePlaylist,
  useGetPlaylist,
  useGetPlaylistLastThreeTracks,
} from "@app/Spotify/playlistHooks";
import { useGetUser } from "@app/Spotify/userhooks";
import { useLocalStorage } from "@app/hooks";
import { Track } from "@spotify/web-api-ts-sdk";
import { useEffect, useMemo } from "react";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";
import { useDebounce, useDebouncedCallback } from "use-debounce";

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
  const spotifyFirstChild = useGetSpotifyTrack(currentTrack?.spotify_id);
  const spotifyselectedTrack = useGetSpotifyTrack(selectedTrack?.spotify_id);

  const { mutate: addToPlaylist, isLoading: addToPlaylistIsLoading } =
    useAddTracksToPlaylist();
  const addToPlaylistDebounce = useDebouncedCallback((data) => {
    addToPlaylist(data);
  }, 5000);
  const { mutate: deleteFromPlaylist, isLoading: deleteFromPlaylistIsLoading } =
    useAddTracksToPlaylist();

  useEffect(() => {
    if (currentTrack && lastThreeTracks && spotifyselectedTrack.data) {
      const canAddTrack =
        lastThreeTracks[lastThreeTracks.length - 1].track.id ===
        currentTrack.spotify_id;
      const lastTrackNotSyncedToSelected =
        lastThreeTracks[lastThreeTracks.length - 1].track.id !==
        selectedTrack?.spotify_id;
      const shouldDeleteLastTrack =
        !canAddTrack && lastTrackNotSyncedToSelected;
      const playlistId = historyPlaylistQuery.data?.id;
      console.log({
        canAddTrack,
        lastTrackNotSyncedToSelected,
        shouldDeleteLastTrack,
      });
      if (
        playlistId &&
        canAddTrack &&
        (spotifyselectedTrack.data || spotifyFirstChild.data) &&
        !addToPlaylistIsLoading
      ) {
        console.log("adding");
        addToPlaylistDebounce({
          playlistId,
          tracks: [spotifyselectedTrack.data],
        });
      }
      if (playlistId && shouldDeleteLastTrack && !deleteFromPlaylistIsLoading) {
        console.log("deleting");
        deleteFromPlaylist({
          playlistId,
          tracks: [lastThreeTracks[lastThreeTracks.length - 1].track],
        });
      }
    }
  }, [
    addToPlaylistIsLoading,
    childrenTracks,
    currentTrack,
    addToPlaylistIsLoading,
    deleteFromPlaylistIsLoading,
    historyPlaylistQuery?.data,
    selectedTrack?.spotify_id,
    lastThreeTracks,
    spotifyFirstChild?.data,
    spotifyselectedTrack?.data,
  ]);
}
