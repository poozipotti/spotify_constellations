import React from "react";
import {
  useGetNextSong,
  useGetSpotifyPlaybackState,
  usePlayPause,
} from "./PlayerHooks";
import { Episode, PlaybackState, Track } from "@spotify/web-api-ts-sdk";

interface player {
  togglePlay: () => void;
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
  const { data: nextTrackData } = useGetNextSong(currentTrack);

  const playPauseQuery = usePlayPause();
  const isLoading = !![playbackStateQuery].find((loading) => {
    loading;
  });
  return (
    <PlayerContext.Provider
      value={{
        togglePlay: playPauseQuery.mutate,
        isLoading,
        state: {
          ...playbackStateQuery.data,
          nextTrack: asTrack(nextTrackData?.track),
          currentTrack,
        },
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
