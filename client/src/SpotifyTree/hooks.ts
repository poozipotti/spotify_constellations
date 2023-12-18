import React, { useEffect } from "react";
import { TreeContext } from "@app/SpotifyTree/SpotifyTreeProvider";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";
import { useHistoryPlaylist } from "./historyHooks";
import { usePlayPlaylist } from "@app/Spotify/Player/PlayerHooks";
import { useSpotifyPlayer } from "@app/Spotify/Player";
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
  return isSynced && !!isCurrentlyPlayingHistoryPlaylist;
};

const useIsTrackInHistoryPlaylist = (
  track?: TrackModel
): "loading" | true | false => {
  const { data: historyPlaylistData, isLoading } = useHistoryPlaylist();
  const inHistory = React.useMemo(
    () =>
      !track || isLoading
        ? "loading"
        : !!historyPlaylistData?.tracks.items.find(
            (playlistTrack) => playlistTrack.track.id === track.spotify_id
          ),
    [historyPlaylistData?.tracks.items, isLoading, track]
  );
  return inHistory;
};

const usePlayCurrentTrackEffect = ({ isSynced }: { isSynced: boolean }) => {
  const tree = useSpotifyTree();
  const currentTrack = tree?.state.currentTrack;
  const { data: historyPlaylistData } = useHistoryPlaylist();
  const { data: currentTrackSpotifyData } = useGetSpotifyTrack(
    currentTrack?.spotify_id
  );
  const { mutate: playPlaylist } = usePlayPlaylist();
  const [hasInit, setHasInit] = React.useState(false);

  React.useEffect(() => {
    if (
      historyPlaylistData &&
      !isSynced &&
      currentTrackSpotifyData?.uri &&
      !hasInit
    ) {
      console.log("resetting");
      playPlaylist({
        contextUri: historyPlaylistData.uri,
        offset: { uri: currentTrackSpotifyData.uri },
      });
      setHasInit(true);
    }
  }, [
    currentTrackSpotifyData,
    historyPlaylistData,
    isSynced,
    playPlaylist,
    hasInit,
  ]);
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
  const currentTrackInPlaylist = useIsTrackInHistoryPlaylist(currentTrack);
  const nextTrackInPlaylist = useIsTrackInHistoryPlaylist(nextTrack);

  const { mutate: addTracksToPlaylist } = useAddTracksToPlaylist();

  useEffect(() => {
    if (
      !currentTrackInPlaylist &&
      historyPlaylistData &&
      currentTrackSpotifyData?.uri
    ) {
      addTracksToPlaylist({
        playlistId: historyPlaylistData?.id,
        tracks: [{ uri: currentTrackSpotifyData?.uri }],
      });
    }
  }, [
    addTracksToPlaylist,
    currentTrackInPlaylist,
    currentTrackSpotifyData,
    historyPlaylistData,
    currentTrack?.spotify_id,
  ]);
  useEffect(() => {
    if (
      currentTrackInPlaylist === true &&
      !nextTrackInPlaylist &&
      historyPlaylistData &&
      nextTrackSpotifyData?.uri &&
      nextTrackSpotifyData?.id === nextTrack?.spotify_id
    ) {
      addTracksToPlaylist({
        playlistId: historyPlaylistData?.id,
        tracks: [{ uri: nextTrackSpotifyData?.uri }],
      });
    }
  }, [
    nextTrack?.spotify_id,
    currentTrackInPlaylist,
    nextTrackSpotifyData,
    addTracksToPlaylist,
    nextTrackInPlaylist,
    historyPlaylistData,
  ]);
};
const useSyncCurrentSongToPlayer = () => {
  const tree = useSpotifyTree();
  const player = useSpotifyPlayer();

  const currentTrackInNext = React.useMemo(
    () =>
      tree?.state.nextSongs?.find((track) => {
        return track.spotify_id === player.state.currentTrack?.id;
      }),
    [tree?.state.nextSongs, player.state.currentTrack]
  );
  useEffect(() => {
    console.log({currentTrackInNext});
    if (tree?.state.selectedNextSong && !tree?.state.currentTrack) {
      tree.setCurrentTrack(() => tree.state.selectedNextSong);
    }
    if (currentTrackInNext) {
      tree?.setCurrentTrack(() => currentTrackInNext);
    }
  }, [tree, currentTrackInNext]);
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
