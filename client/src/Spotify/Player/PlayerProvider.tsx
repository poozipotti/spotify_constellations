import React from "react";
import {
  useGetNextTrack,
  useGetSpotifyPlaybackState,
  usePlayPause,
  useSetShuffle,
  useSkipTrack,
  useSkipToPrevTrack,
  useTransitionTrackWhenDoneEffect,
} from "./PlayerHooks";
import { Episode, PlaybackState, Track } from "@spotify/web-api-ts-sdk";

export interface player {
  togglePlay: () => void;
  skipToNextTrack: () => void;
  skipToPrevTrack: () => void;
  isLoading: boolean;
  state: Partial<PlaybackState> & {
    nextTrack: Track | undefined;
    currentTrack: Track | undefined;
  };
}
export const PlayerContext = React.createContext<player>({
  isLoading: true,
  togglePlay: () => {},
  skipToNextTrack: () => {},
  skipToPrevTrack: () => {},
  state: { nextTrack: undefined, currentTrack: undefined },
});

function asTrack(item: Track | undefined | Episode) {
  return item && "artists" in item ? (item as Track) : undefined;
}

export const SpotifyPlayerProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const playbackStateQuery = useGetSpotifyPlaybackState();
  const currentTrack = asTrack(playbackStateQuery?.data?.item);
  const { data: nextTrackData } = useGetNextTrack();

  const playPauseQuery = usePlayPause();
  const skipQuery = useSkipTrack();
  const skipToPrevTrack = useSkipToPrevTrack();

  const isLoading = !![playbackStateQuery].find((loading) => {
    loading;
  });

  const { mutate: setShuffle } = useSetShuffle();
  React.useEffect(() => {
    if (playbackStateQuery.data?.shuffle_state) {
      setShuffle({ shouldShuffle: false });
    }
  }, [playbackStateQuery.data?.shuffle_state, setShuffle]);
  useTransitionTrackWhenDoneEffect();
  return (
    <PlayerContext.Provider
      value={{
        togglePlay: playPauseQuery.mutate,
        skipToNextTrack: skipQuery.mutate,
        skipToPrevTrack: skipToPrevTrack.mutate,
        isLoading,
        state: {
          ...playbackStateQuery.data,
          nextTrack: asTrack(nextTrackData),
          currentTrack,
        },
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
