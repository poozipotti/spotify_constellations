import { SpotifyPlayerProvider } from "@app/Spotify/Player/PlayerProvider";
import React, { useCallback } from "react";
import TrackModel from "@api/models/track.model";
import {
  useCreateTrack,
  useGetAllTracks,
  useGetTrack,
  useGetTrackChildren,
} from "./apiHooks";
import { TCreateTrackData } from "@app/WebSdk";
import { useGetCurrentTrack, useSyncToSpotify } from "./hooks";

interface tree {
  setSelectedNextSong: (id: number) => void;
  addSuggestion: (track: TCreateTrackData) => void;
  sync: () => void;
  state: {
    prevSong: TrackModel | undefined;
    nextSongs: TrackModel[];
    rootNodes: TrackModel[];
    currentTrack: TrackModel | undefined;
    selectedNextSong: TrackModel | undefined;
    isLoading: boolean;
    isSynced: boolean;
  };
}
const INIT_TREE = {
  setSelectedNextSong: () => {},
  addSuggestion: () => {},
  sync: () => {},
  state: {
    nextSongs: [],
    rootNodes: [],
    currentTrack: undefined,
    selectedNextSong: undefined,
    prevSong: undefined,
    isSynced: false,
    isLoading: true,
  },
};
export const TreeContext = React.createContext<tree>(INIT_TREE);

const SpotifyTreeProviderInternal: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { data: allTracks } = useGetAllTracks();
  const [selectedNextSong, _setSelectedNextSong] = React.useState<
    TrackModel | undefined
  >();
  const currentTrack = useGetCurrentTrack();
  const { data: nextTracks } = useGetTrackChildren(currentTrack?.id);
  const { data: prevTrack } = useGetTrack(currentTrack?.parent_id);
  const { mutate: addSuggestion } = useCreateTrack();
  const { setShouldSync, isSynced } = useSyncToSpotify();

  const rootNodes = React.useMemo(
    () => allTracks?.tracks.filter(({ parent_id }) => !parent_id),
    [allTracks?.tracks]
  );

  const nextSongs = React.useMemo(
    () => (isSynced ? nextTracks?.tracks : rootNodes),
    [isSynced, nextTracks?.tracks, rootNodes]
  );
  const setSelectedNextSong = useCallback(
    (id: number) => {
      const nextSong = nextSongs?.find((track) => track.id === id);
      if (!nextSong) {
        throw new Error("could not find next song");
      }

      _setSelectedNextSong(nextSong);
    },
    [nextSongs]
  );
  const state = React.useMemo(
    () => ({
      nextSongs: nextSongs || [],
      rootNodes: rootNodes || [],
      currentTrack,
      selectedNextSong,
      prevSong: prevTrack?.track,
      isSynced,
      isLoading: false,
    }),
    [
      currentTrack,
      isSynced,
      nextSongs,
      prevTrack?.track,
      rootNodes,
      selectedNextSong,
    ]
  );
  return (
    <TreeContext.Provider
      value={{
        state,
        setSelectedNextSong: setSelectedNextSong,
        addSuggestion: (track: TCreateTrackData) => {
          addSuggestion({ ...track, parent_id: currentTrack?.id });
        },
        sync: () => {
          setShouldSync(true);
        },
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
