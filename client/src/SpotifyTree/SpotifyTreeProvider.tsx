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

interface tree {
  setSelectedNextSong: (id: number) => void;
  setCurrentTrack: React.Dispatch<React.SetStateAction<TrackModel | undefined>>;
  addSuggestion: (track: TCreateTrackData) => void;
  state: {
    prevSong: TrackModel | undefined;
    nextSongs: TrackModel[];
    rootNodes: TrackModel[];
    currentTrack: TrackModel | undefined;
    selectedNextSong: TrackModel | undefined;
    isLoading: boolean;
  };
}

export const TreeContext = React.createContext<tree | undefined>(undefined);

const SpotifyTreeProviderInternal: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = React.useState<
    TrackModel | undefined
  >();
  const { data: allTracks } = useGetAllTracks();
  const [selectedNextSong, _setSelectedNextSong] = React.useState<
    TrackModel | undefined
  >();
  const { data: nextTracks } = useGetTrackChildren(currentTrack?.id);
  const { data: prevTrack } = useGetTrack(currentTrack?.parent_id);
  const { mutate: addSuggestion } = useCreateTrack();

  const rootNodes = React.useMemo(
    () => allTracks?.tracks.filter(({ parent_id }) => !parent_id),
    [allTracks?.tracks]
  );

  const nextSongs = React.useMemo(
    () => (nextTracks?.tracks.length ? nextTracks?.tracks : rootNodes),
    [ nextTracks?.tracks, rootNodes]
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
      isLoading: false,
    }),
    [currentTrack, nextSongs, prevTrack?.track, rootNodes, selectedNextSong]
  );
  return (
    <TreeContext.Provider
      value={{
        state,
        setSelectedNextSong: setSelectedNextSong,
        setCurrentTrack,
        addSuggestion: (track: TCreateTrackData) => {
          addSuggestion({ ...track, parent_id: currentTrack?.id });
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
