import { Track } from "@spotify/web-api-ts-sdk";
import { SpotifyPlayerProvider } from "@app/Spotify/Player/PlayerProvider";
import React, { useCallback, useEffect } from "react";
import { useSpotifyPlayer } from "@app/Spotify/Player";
import TrackModel from "@api/models/track.model";
import {
  useCreateTrack,
  useGetAllTracks,
  useGetTrackChildren,
} from "./apiHooks";
import { useGetSpotifyTrack } from "@app/Spotify/trackHooks";
import { useHistoryPlaylist } from "./historyHooks";
import { useAddTracksToPlaylist } from "@app/Spotify/playlistHooks";
import { usePlayPlaylist } from "@app/Spotify/Player/PlayerHooks";
import { TCreateTrackData } from "@app/WebSdk";

interface tree {
  currentSong: TrackModel | undefined;
  selectedNextSong: TrackModel | undefined;
  setSelectedNextSong: (id: number) => void;
  addSuggestion: (track: TCreateTrackData) => void;
  sync: () => void;
  nextSongs: TrackModel[];
  prevSong: TrackModel | undefined;
  isLoading: boolean;
  isSynced: boolean;
}
const INIT_TREE = {
  currentSong: undefined,
  selectedNextSong: undefined,
  isLoading: true,
  setSelectedNextSong: () => {},
  addSuggestion: () => {},
  sync: () => {},
  nextSongs: [],
  isSynced: false,
  prevSong: undefined,
};
export const TreeContext = React.createContext<tree>(INIT_TREE);

const SpotifyTreeProviderInternal: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const player = useSpotifyPlayer();
  const { data: allTracks } = useGetAllTracks();
  const [currentTrack, setCurrentTrack] = React.useState<
    TrackModel | undefined
  >();
  const isSynced = currentTrack?.spotify_id === player.state.currentTrack?.id;
  const [selectedNextSong, setSelectedNextSong] = React.useState<
    TrackModel | undefined
  >();
  const { data: nextTracks } = useGetTrackChildren(currentTrack?.id);
  const { data: historyPlaylistData } = useHistoryPlaylist();
  const { mutate: addTracksToPlaylist } = useAddTracksToPlaylist();
  const { mutate: addSuggestion } = useCreateTrack();
  const { data: currentTrackSpotify } = useGetSpotifyTrack(
    currentTrack?.spotify_id
  );
  const { data: selectedNextSongSpotify } = useGetSpotifyTrack(
    selectedNextSong?.spotify_id
  );
  const [shouldSync, setShouldSync] = React.useState(false);
  const { mutate: playPlaylist } = usePlayPlaylist();

  useEffect(() => {
    if (historyPlaylistData && currentTrackSpotify && shouldSync) {
      const rootInPlaylist = !!historyPlaylistData?.tracks.items.find(
        (track) => track.track.id === currentTrackSpotify.id
      );
      if (!rootInPlaylist) {
        addTracksToPlaylist({
          playlistId: historyPlaylistData.id,
          tracks: [currentTrackSpotify],
        });
      }
      playPlaylist({
        contextUri: historyPlaylistData.uri,
        offset: { uri: currentTrackSpotify.uri },
      });
    }
  }, [
    addTracksToPlaylist,
    currentTrackSpotify,
    historyPlaylistData,
    shouldSync,
    playPlaylist,
  ]);
  const rootNodes = allTracks?.tracks.filter(({ parent_id }) => !parent_id);
  useEffect(() => {
    if (!currentTrack && rootNodes?.length) {
      setCurrentTrack(rootNodes[0]);
    }
  }, [currentTrack, rootNodes]);
  const nextSongs = isSynced ? nextTracks?.tracks : rootNodes;
  useEffect(() => {
    if (nextSongs) {
      if (
        !selectedNextSong ||
        !nextSongs?.find(({ id }) => id === selectedNextSong?.id)
      ) {
        setSelectedNextSong(nextSongs[0]);
      }
    }
  }, [nextSongs, selectedNextSong]);
  useEffect(() => {
    const playingTrackId = player?.state.currentTrack?.id;
    if (playingTrackId !== currentTrack?.spotify_id) {
      setCurrentTrack(selectedNextSong);
    }
  }, [
    player?.state.currentTrack?.id,
    currentTrack?.spotify_id,
    selectedNextSong,
  ]);
  const setSelectedNextSongExport = useCallback(
    (id: number) => {
      const nextSong = nextSongs?.find((track) => track.id === id);
      if (!nextSong) {
        throw new Error("could not find next song");
      }

      setSelectedNextSong(nextSong);
    },
    [nextSongs]
  );
  useEffect(() => {
    if (selectedNextSongSpotify?.id === selectedNextSong?.spotify_id) {
      const nextSongInPlaylist = !!historyPlaylistData?.tracks.items.find(
        (track) => track.track.id === selectedNextSongSpotify?.id
      );
      console.log(nextSongInPlaylist);
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
    selectedNextSong?.spotify_id,
    selectedNextSongSpotify,
  ]);

  return (
    <TreeContext.Provider
      value={{
        ...INIT_TREE,
        isSynced,
        setSelectedNextSong: setSelectedNextSongExport,
        currentSong: currentTrack,
        addSuggestion: (track: TCreateTrackData) => {
          addSuggestion({ ...track, parent_id: currentTrack?.id });
        },
        nextSongs: nextSongs || [],
        sync: () => {
          setShouldSync(true);
        },
        selectedNextSong: selectedNextSong,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};
export const SpotifyTreeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <SpotifyPlayerProvider>
      <SpotifyTreeProviderInternal>{children}</SpotifyTreeProviderInternal>
    </SpotifyPlayerProvider>
  );
};
