import React from "react";
import { TreeContext } from "@app/SpotifyTree/SpotifyTreeProvider";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";
import { useHistoryPlaylist } from "./historyHooks";
import { useAddTracksToPlaylist } from "@app/Spotify/playlistHooks";
import { usePlayPlaylist } from "@app/Spotify/Player/PlayerHooks";
import { useSpotifyPlayer } from "@app/Spotify/Player";
import TrackModel from "@api/models/track.model";
import { useGetTracksBySpotifyId } from "./apiHooks";

export const useSpotifyTree = () => {
  const tree = React.useContext(TreeContext);

  if (!tree) {
    throw new Error(
      "cannot access spotify player make sure a spotify player provider is being used"
    );
  }
  return tree;
};

export const useSyncToSpotify = () => {
  const tree = useSpotifyTree();
  const player = useSpotifyPlayer();
  const currentTrack = tree.state.currentTrack;
  const [shouldSync, setShouldSync] = React.useState(false);
  const { data: historyPlaylistData } = useHistoryPlaylist();
  const { data: currentTrackSpotify } = useGetSpotifyTrack(currentTrack?.id);
  const { mutate: addTracksToPlaylist } = useAddTracksToPlaylist();
  const { mutate: playPlaylist } = usePlayPlaylist();
  const isSynced = currentTrackSpotify?.id === player.state.currentTrack?.id;
  const isInHistoryPlaylist =
    player.state.context?.uri === historyPlaylistData?.uri;
  useNextSongSyncEffect();
  React.useEffect(() => {
    if (isInHistoryPlaylist && !isSynced && !shouldSync) {
      setShouldSync(true);
    }
  }, [isInHistoryPlaylist, isSynced, shouldSync]);

  React.useEffect(() => {
    if (historyPlaylistData && currentTrackSpotify && shouldSync) {
      const isTrackInHistory = !!historyPlaylistData?.tracks.items.find(
        (track) => track.track.id === currentTrackSpotify.id
      );
      if (!isTrackInHistory) {
        addTracksToPlaylist({
          playlistId: historyPlaylistData.id,
          tracks: [currentTrackSpotify],
        });
      }
      playPlaylist({
        contextUri: historyPlaylistData.uri,
        offset: { uri: currentTrackSpotify.uri },
      });
      setShouldSync(false);
    }
  }, [
    tree.state.currentTrack,
    addTracksToPlaylist,
    currentTrackSpotify,
    historyPlaylistData,
    shouldSync,
    playPlaylist,
  ]);
  return { setShouldSync, isSynced };
};

function useNextSongSyncEffect() {
  const tree = useSpotifyTree();
  const { data: historyPlaylistData } = useHistoryPlaylist();
  const { data: selectedNextSongSpotify } = useGetSpotifyTrack(
    tree.state.selectedNextSong?.spotify_id
  );
  const { mutate: addTracksToPlaylist } = useAddTracksToPlaylist();
  React.useEffect(() => {
    if (selectedNextSongSpotify?.id === tree.state.selectedNextSong?.spotify_id) {
      const nextSongInPlaylist = !!historyPlaylistData?.tracks.items.find(
        (track) => track.track.id === selectedNextSongSpotify?.id
      );
      if (
        !nextSongInPlaylist &&
        historyPlaylistData &&
        selectedNextSongSpotify
      ) {
        addTracksToPlaylist({
          playlistId: historyPlaylistData?.id,
          tracks: [selectedNextSongSpotify],
        });
      }
    }
  }, [
    addTracksToPlaylist,
    historyPlaylistData,
    tree.state.selectedNextSong?.spotify_id,
    selectedNextSongSpotify,
  ]);
}

export const useGetCurrentTrack = () => {
  const [currentTrack, setCurrentTrack] = React.useState<
    TrackModel | undefined
  >();
  const player = useSpotifyPlayer();
  const tree = useSpotifyTree();
  const { data: trackData } = useGetTracksBySpotifyId(
    player.state.currentTrack?.id
  );
  const nextSongSpotify = tree.state.nextSongs?.find(({ spotify_id }) => {
    spotify_id === player.state.currentTrack?.id;
  });
  const webTrackFromHistory = trackData?.tracks;
  React.useEffect(() => {
    if (nextSongSpotify && !tree.state.currentTrack?.id !== nextSongSpotify?.id) {
      setCurrentTrack(nextSongSpotify);
      return;
    }
    if (!tree.state.currentTrack && webTrackFromHistory) {
      setCurrentTrack(webTrackFromHistory[0]);
      return;
    }
  }, [
    nextSongSpotify,
    setCurrentTrack,
    tree.state.currentTrack,
    webTrackFromHistory,
    trackData?.tracks,
  ]);
  return currentTrack;
};

export const useUpdateSelectedNextSongEffect = () => {
  const tree = useSpotifyTree();

  React.useEffect(() => {
    if (tree.state.nextSongs) {
      if (
        !tree.state.selectedNextSong ||
        !tree.state.nextSongs?.find(({ id }) => id === tree.state.selectedNextSong?.id)
      ) {
        tree.setSelectedNextSong(tree.state.nextSongs[0]?.id);
      }
    }
  }, [tree]);
};
