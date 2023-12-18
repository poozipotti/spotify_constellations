import React from "react";
import { TreeContext } from "@app/SpotifyTree/SpotifyTreeProvider";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";
import { useHistoryPlaylist } from "./historyHooks";
import { useAddTracksToPlaylist } from "@app/Spotify/playlistHooks";
import { usePlayPlaylist } from "@app/Spotify/Player/PlayerHooks";
import { useSpotifyPlayer } from "@app/Spotify/Player";
import TrackModel from "@api/models/track.model";

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
  const [shouldSync, setShouldSync] = React.useState(false);
  const { data: historyPlaylistData } = useHistoryPlaylist();
  const { data: currentTrackSpotify } = useGetSpotifyTrack(
    tree.currentSong?.spotify_id
  );
  const { data: selectedNextSongSpotify } = useGetSpotifyTrack(
    tree.selectedNextSong?.spotify_id
  );
  const { mutate: addTracksToPlaylist } = useAddTracksToPlaylist();
  const { mutate: playPlaylist } = usePlayPlaylist();
  const isSynced = currentTrackSpotify?.id === player.state.currentTrack?.id;
  const isInHistoryPlaylist =
    player.state.context?.uri === historyPlaylistData?.uri;
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
    addTracksToPlaylist,
    currentTrackSpotify,
    historyPlaylistData,
    shouldSync,
    playPlaylist,
  ]);
  React.useEffect(() => {
    if (selectedNextSongSpotify?.id === tree.selectedNextSong?.spotify_id) {
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
    tree.selectedNextSong?.spotify_id,
    selectedNextSongSpotify,
  ]);
  return { setShouldSync, isSynced };
};

export const useSyncToPlayerEffect = (
  setCurrentTrack: React.Dispatch<React.SetStateAction<TrackModel | undefined>>
) => {
  const player = useSpotifyPlayer();
  const tree = useSpotifyTree();
  const nextSongs = tree.nextSongs;
  const selectedNextSong = tree.selectedNextSong;

  React.useEffect(() => {
    if (nextSongs) {
      if (
        !selectedNextSong ||
        !nextSongs?.find(({ id }) => id === selectedNextSong?.id)
      ) {
        tree.setSelectedNextSong(nextSongs[0]?.id);
      }
    }
  }, [nextSongs, selectedNextSong, tree]);

  React.useEffect(() => {
    const playingTrackId = player?.state.currentTrack?.id;
    if (playingTrackId !== tree.currentSong?.spotify_id) {
      setCurrentTrack(selectedNextSong);
    }
  }, [
    tree.currentSong?.spotify_id,
    setCurrentTrack,
    player?.state.currentTrack?.id,
    selectedNextSong,
  ]);
};
export const useInitCurrentTrackEffect = (
  setCurrentTrack: React.Dispatch<React.SetStateAction<TrackModel | undefined>>
) => {
  const tree = useSpotifyTree();

  React.useEffect(() => {
    if (!tree.currentSong && tree.rootNodes?.length) {
      setCurrentTrack(tree.rootNodes[0]);
    }
  }, [tree.currentSong, tree.rootNodes, setCurrentTrack]);
};
