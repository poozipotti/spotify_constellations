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
import { useSyncHistoryWebNextTrackEffect } from "./historyHooks";

interface constellationGraph {
  addChild: {
    isPending: boolean;
    mutate: (
      track: TCreateTrackData,
      options?: { onSuccess: () => void }
    ) => void;
  };
  setSelectedTrack: (newState: TrackModel) => void;
  state: {
    selectedTrack?: TrackModel | undefined;
    parentTracks: TrackModel[];
    childTracks: TrackModel[];
    selectedChildTrack: TrackModel | undefined;
    currentTrack: TrackModel | undefined;
    isLoading: boolean;
  };
}

export const ConstellationGraphContext = React.createContext<constellationGraph | undefined>(undefined);

const SpotifyConstellationGraphProviderInternal: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const player = useSpotifyPlayer();
  const currentTrackQuery = useGetTrackBySpotifyId(
    player.state.currentTrack?.id
  );
  const currentTrack = currentTrackQuery?.data?.track;
  const selectedChildTrackQuery = useGetTrackBySpotifyId(
    player.state.nextTrack?.id
  );
  const selectedChildTrack = selectedChildTrackQuery?.data?.track;
  const { data: childrenTracks } = useGetTrackChildren(currentTrack?.id);
  const { data: parentTracks } = useGetTrackParents(currentTrack?.id);
  const { mutate: addChild, ...createTrackMutate } = useCreateTrack();
  const [selectedTrackId, setSelectedTrackId] = React.useState<
    string | undefined
  >(undefined);
  const selectedTrack = childrenTracks?.tracks.find(
    ({ id }) => id === selectedTrackId
  );
  const setSelectedTrack = React.useCallback(
    (track: TrackModel | undefined) => setSelectedTrackId(track?.id),
    []
  );
  const isLoading =
    currentTrackQuery.isLoading || selectedChildTrackQuery.isLoading;
  const state = React.useMemo(
    () => ({
      parentTracks: parentTracks?.tracks || [],
      childTracks: childrenTracks?.tracks || [],
      selectedChildTrack,
      currentTrack,
      selectedTrack,
      isLoading: isLoading,
    }),
    [
      selectedTrack,
      childrenTracks,
      parentTracks,
      selectedChildTrack,
      currentTrack,
      isLoading,
    ]
  );
  useSyncHistoryWebNextTrackEffect(
    childrenTracks?.tracks,
    selectedTrack,
    currentTrack
  );
  return (
    <ConstellationGraphContext.Provider
      value={{
        state,
        setSelectedTrack,
        addChild: {
          ...createTrackMutate,
          mutate: (
            track: TCreateTrackData,
            options?: { onSuccess: () => void }
          ) => {
            if (!isLoading) {
              addChild({ ...track, parent_id: currentTrack?.id }, options);
            }
          },
        },
      }}
    >
      {children}
    </ConstellationGraphContext.Provider>
  );
};
export const SpotifyConstellationGraphProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <SpotifyPlayerProvider>
      <SpotifyConstellationGraphProviderInternal>{children}</SpotifyConstellationGraphProviderInternal>
    </SpotifyPlayerProvider>
  );
};
