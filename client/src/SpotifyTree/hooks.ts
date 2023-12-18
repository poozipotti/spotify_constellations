import React, { SetStateAction, useEffect } from "react";
import { TreeContext } from "@app/SpotifyTree/SpotifyTreeProvider";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";
import { useHistoryPlaylist } from "./historyHooks";
import { usePlayPlaylist } from "@app/Spotify/Player/PlayerHooks";
import { useSpotifyPlayer } from "@app/Spotify/Player";
import { useGetTracksBySpotifyId } from "./apiHooks";
import TrackModel from "@api/models/track.model";
import { useAddTracksToPlaylist } from "@app/Spotify/playlistHooks";

export const useSpotifyTree = () => {
  const tree = React.useContext(TreeContext);

  return tree;
};

export const useSyncSpotify = () => {
  const isSynced = useCheckSynced();

  usePlayCurrentTrackEffect({ isSynced });
  useSyncTracksToHistory();
  useSyncCurrentSongToPlayer();
  useUpdateSelectedNextSongEffect();
  return { isSynced };
};

const useCheckSynced = () => {
  const tree = useSpotifyTree();
  const player = useSpotifyPlayer();
  const currentTrack = tree?.state.currentTrack;
  const { data: historyPlaylistData } = useHistoryPlaylist();
  const isCurrentlyPlayingHistoryPlaylist =
    historyPlaylistData &&
    player.state.context?.uri === historyPlaylistData?.uri;
  const isSynced = !!(
    currentTrack && currentTrack?.spotify_id === player.state.currentTrack?.id
  );
  return isSynced && isCurrentlyPlayingHistoryPlaylist;
};

const useIsTrackInHistoryPlaylist = (track?: TrackModel) => {
  const { data: historyPlaylistData } = useHistoryPlaylist();
  if (!track) {
    return false;
  }
  return !!historyPlaylistData?.tracks.items.find((playlistTrack) => {
    playlistTrack.track.id === track.spotify_id;
  });
};

const usePlayCurrentTrackEffect = ({ isSynced }: { isSynced: boolean }) => {
  const tree = useSpotifyTree();
  const currentTrack = tree?.state.currentTrack;
  const { data: historyPlaylistData } = useHistoryPlaylist();
  const { data: currentTrackSpotifyData } = useGetSpotifyTrack(
    currentTrack?.id
  );
  const { mutate: playPlaylist } = usePlayPlaylist();
  React.useEffect(() => {
    console.log({currentTrack})
    if (historyPlaylistData && currentTrackSpotifyData && !isSynced) {
      playPlaylist({
        contextUri: historyPlaylistData.uri,
        offset: { uri: currentTrackSpotifyData.uri },
      });
    }
  }, [currentTrackSpotifyData, historyPlaylistData, isSynced, playPlaylist,currentTrack]);
};

const useSyncTracksToHistory = () => {
  const tree = useSpotifyTree();
  const { data: historyPlaylistData } = useHistoryPlaylist();
  const currentTrack = tree?.state.currentTrack;
  const nextTrack = tree?.state.selectedNextSong;
  const { data: currentTrackSpotifyData } = useGetSpotifyTrack(
    currentTrack?.spotify_id
  );
  const { data: nextTrackSpotifyData } = useGetSpotifyTrack(
    nextTrack?.spotify_id
  );
  const currentTrackInPlaylsit = useIsTrackInHistoryPlaylist(currentTrack);
  const nextTrackInPlaylsit = useIsTrackInHistoryPlaylist(nextTrack);

  const { mutate: addTracksToPlaylist } = useAddTracksToPlaylist();

  useEffect(() => {
    if (
      !currentTrackInPlaylsit &&
      historyPlaylistData &&
      currentTrackSpotifyData
    ) {
      addTracksToPlaylist({
        playlistId: historyPlaylistData?.id,
        tracks: [{ uri: currentTrackSpotifyData?.uri }],
      });
    }
  }, [
    addTracksToPlaylist,
    currentTrackInPlaylsit,
    currentTrackSpotifyData,
    historyPlaylistData,
  ]);
  useEffect(() => {
    if (
      currentTrackInPlaylsit &&
      !nextTrackInPlaylsit &&
      historyPlaylistData &&
      nextTrackSpotifyData
    ) {
      addTracksToPlaylist({
        playlistId: historyPlaylistData?.id,
        tracks: [{ uri: nextTrackSpotifyData?.uri }],
      });
    }
  }, [
    nextTrackInPlaylsit,
    nextTrackSpotifyData,
    addTracksToPlaylist,
    currentTrackInPlaylsit,
    historyPlaylistData,
  ]);
};
const useSyncCurrentSongToPlayer = () => {
  const player = useSpotifyPlayer();
  const tree = useSpotifyTree();

  useEffect(() => {
    if (tree?.state.selectedNextSong && !tree?.state.currentTrack) {
      tree.setCurrentTrack(() => tree.state.selectedNextSong);
    }
  }, [tree]);
};

const useUpdateSelectedNextSongEffect = () => {
  const tree = useSpotifyTree();

  React.useEffect(() => {
    if (tree?.state.nextSongs[0]) {
      if (
        !tree.state.selectedNextSong ||
        !tree.state.nextSongs?.find(
          ({ id }) => id === tree.state.selectedNextSong?.id
        )
      ) {
        tree.setSelectedNextSong(tree.state.nextSongs[0]?.id);
      }
    }
  }, [tree]);
};
