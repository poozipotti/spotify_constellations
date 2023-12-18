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
import {
  useInitCurrentTrackEffect,
  useSyncToPlayerEffect,
  useSyncToSpotify,
} from "./hooks";

interface tree {
  currentSong: TrackModel | undefined;
  selectedNextSong: TrackModel | undefined;
  setSelectedNextSong: (id: number) => void;
  addSuggestion: (track: TCreateTrackData) => void;
  sync: () => void;
  nextSongs: TrackModel[];
  rootNodes: TrackModel[];
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
  rootNodes: [],
  isSynced: false,
  prevSong: undefined,
};
export const TreeContext = React.createContext<tree>(INIT_TREE);

const SpotifyTreeProviderInternal: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { data: allTracks } = useGetAllTracks();
  const [currentTrack, setCurrentTrack] = React.useState<
    TrackModel | undefined
  >();
  const [selectedNextSong, _setSelectedNextSong] = React.useState<
    TrackModel | undefined
  >();
  const { data: nextTracks } = useGetTrackChildren(currentTrack?.id);
  const { data: prevTrack } = useGetTrack(currentTrack?.parent_id);
  const { mutate: addSuggestion } = useCreateTrack();
  const { setShouldSync, isSynced } = useSyncToSpotify();
  useSyncToPlayerEffect(setCurrentTrack);
  useInitCurrentTrackEffect(setCurrentTrack);

  const rootNodes = allTracks?.tracks.filter(({ parent_id }) => !parent_id);

  const nextSongs = isSynced ? nextTracks?.tracks : rootNodes;
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

  return (
    <TreeContext.Provider
      value={{
        isSynced,
        setSelectedNextSong: setSelectedNextSong,
        currentSong: currentTrack,
        addSuggestion: (track: TCreateTrackData) => {
          addSuggestion({ ...track, parent_id: currentTrack?.id });
        },
        nextSongs: nextSongs || [],
        rootNodes: rootNodes || [],
        prevSong: prevTrack?.track,
        sync: () => {
          setShouldSync(true);
        },
        selectedNextSong: selectedNextSong,
        isLoading: false,
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
