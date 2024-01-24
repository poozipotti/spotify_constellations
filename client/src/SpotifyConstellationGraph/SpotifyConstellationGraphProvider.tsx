import { SpotifyPlayerProvider } from "@app/Spotify/Player/PlayerProvider";
import React from "react";
import TrackModel from "@api/models/track.model";
import {
  useGetTrackChildren,
  useGetTrackBySpotifyId,
  useGetTrackParents,
  useCreateTracks,
} from "./apiHooks";
import { TCreateTrackData } from "@app/WebSdk";
import { useSpotifyPlayer } from "@app/Spotify/Player";
import { useSyncHistoryWebNextTrackEffect } from "@app/SpotifyConstellationGraph/constellationGraphHistoryHooks";

interface constellationGraph {
  addChildren: {
    isPending: boolean;
    mutate: (
      tracks: TCreateTrackData[] | TCreateTrackData,
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

export const ConstellationGraphContext = React.createContext<
  constellationGraph | undefined
>(undefined);

const SpotifyConstellationGraphProviderInternal: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
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
  const { mutate: addChildren, ...createTrackMutate } = useCreateTracks();
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
  useSyncHistoryWebNextTrackEffect(selectedTrack, currentTrack);
  return (
    <ConstellationGraphContext.Provider
      value={{
        state,
        setSelectedTrack,
        addChildren: {
          ...createTrackMutate,
          mutate: (
            tracks: TCreateTrackData[] | TCreateTrackData,
            options?: { onSuccess: () => void }
          ) => {
            if (!isLoading) {
              if ("length" in tracks) {
                return addChildren(
                  [
                    { parent_id: currentTrack?.id, ...tracks[0] },
                    ...tracks.slice(1),
                  ],
                  options
                );
              }
              return addChildren(
                [{ ...tracks, parent_id: currentTrack?.id }],
                options
              );
            }
          },
        },
      }}
    >
      {children}
    </ConstellationGraphContext.Provider>
  );
};
export const SpotifyConstellationGraphProvider: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  return (
    <SpotifyPlayerProvider>
      <SpotifyConstellationGraphProviderInternal>
        {children}
      </SpotifyConstellationGraphProviderInternal>
    </SpotifyPlayerProvider>
  );
};
