import React from "react";
import {
  useGetNextSong,
  useGetSpotifyPlaybackState,
  usePlayPause,
  useSkipSong,
  useSkipToPrevSong,
  useTransitionTrackWhenDoneEffect,
} from "./PlayerHooks";
import { Episode, PlaybackState, Track } from "@spotify/web-api-ts-sdk";

export interface player {
  togglePlay: () => void;
  skipToNextSong: () => void;
  skipToPrevSong: () => void;
  isLoading: boolean;
  state:
    | (Partial<PlaybackState> & {
        nextTrack: Track | undefined;
        currentTrack: Track | undefined;
      })
    | undefined;
}
export const PlayerContext = React.createContext<player>({
  isLoading: true,
  togglePlay: ()=>{},
  skipToNextSong: ()=>{},
  skipToPrevSong: ()=>{},
  state: undefined,

});

function asTrack(item: Track | undefined | Episode) {
  return item && "artists" in item ? (item as Track) : undefined;
}

export const SpotifyPlayerProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const playbackStateQuery = useGetSpotifyPlaybackState();
  const currentTrack = asTrack(playbackStateQuery?.data?.item);
  const { data: nextTrackData } = useGetNextSong();


  const playPauseQuery = usePlayPause();
  const skipQuery = useSkipSong();
  const skipToPrevSong = useSkipToPrevSong();

  const isLoading = !![playbackStateQuery].find((loading) => {
    loading;
  });
  useTransitionTrackWhenDoneEffect();
  return (
    <PlayerContext.Provider
      value={{
        togglePlay: playPauseQuery.mutate,
        skipToNextSong: skipQuery.mutate,
        skipToPrevSong: skipToPrevSong.mutate, 
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
