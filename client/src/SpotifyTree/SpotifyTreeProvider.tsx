import { SpotifyPlayerProvider } from "@app/Spotify/Player/PlayerProvider";
import React from "react";
import TrackModel from "@api/models/track.model";
import {
  useCreateTrack,
  useGetTrackChildren,
  useGetTrackBySpotifyId,
  useGetTrackParents,
} from "./apiHooks";
import { TCreateTrackData } from "@app/WebSdk";
import { useSpotifyPlayer } from "@app/Spotify/Player";

interface tree {
  addSuggestion: {
    isLoading: boolean;
    mutate: (
      track: TCreateTrackData,
      options?: { onSuccess: () => void }
    ) => void;
  };
  state: {
    parentTracks: TrackModel[];
    childTracks: TrackModel[];
    selectedChildTrack: TrackModel | undefined;
    currentTrack: TrackModel | undefined;
    isLoading: boolean;
  };
}

export const TreeContext = React.createContext<tree | undefined>(undefined);

const SpotifyTreeProviderInternal: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const player = useSpotifyPlayer();
  const currentTrackQuery = useGetTrackBySpotifyId(
    player.state.currentTrack?.id
  );
  const currentTrack = currentTrackQuery?.data?.track;
  const selectedChildSongQuery = useGetTrackBySpotifyId(
    player.state.nextTrack?.id
  );
  const selectedChildTrack = selectedChildSongQuery?.data?.track;
  const { data: childrenTracks } = useGetTrackChildren(currentTrack?.id);
  const { data: parentTracks } = useGetTrackParents(currentTrack?.id);
  const { mutate: addSuggestion, ...createTrackMutate } = useCreateTrack();
  const isLoading =
    currentTrackQuery.isLoading || selectedChildSongQuery.isLoading;
  const state = React.useMemo(
    () => ({
      parentTracks: parentTracks?.tracks || [],
      childTracks: childrenTracks?.tracks || [],
      selectedChildTrack,
      currentTrack,
      isLoading: isLoading,
    }),
    [childrenTracks, parentTracks, selectedChildTrack, currentTrack, isLoading]
  );
  return (
    <TreeContext.Provider
      value={{
        state,
        addSuggestion: {
          ...createTrackMutate,
          mutate: (
            track: TCreateTrackData,
            options?: { onSuccess: () => void }
          ) => {
            if (!isLoading) {
              addSuggestion({ ...track, parent_id: currentTrack?.id }, options);
            }
          },
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
