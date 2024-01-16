import React from "react";
import {
  useGetNextTrack,
  useGetSpotifyPlaybackState,
  usePlayPause,
  usePlayPlaylist,
  useSetShuffle,
  useSkipTrack,
  useSkipToPrevTrack,
  useTransitionTrackWhenDoneEffect,
} from "./PlayerHooks";
import { Episode, PlaybackState, Track } from "@spotify/web-api-ts-sdk";
import { useHistoryPlaylist } from "@app/SpotifyTree/historyHooks";
import { useDebouncedCallback } from "use-debounce";

export interface player {
  togglePlay: () => void;
  skipToNextTrack: () => void;
  skipToPrevTrack: () => void;
  playHistoryPlaylist: () => void;
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
  playHistoryPlaylist: () => {},
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
  const historyPlaylistQuery = useHistoryPlaylist({ canCreate: true });
  const playPlaylist = usePlayPlaylist();
  const playHistoryPlaylistDebounced = useDebouncedCallback(() => {
    if (historyPlaylistQuery.data?.uri) {
      playPlaylist.mutate({
        contextUri: historyPlaylistQuery.data.uri,
        offset: currentTrack,
      });
    }
  }, 500);

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
        playHistoryPlaylist: playHistoryPlaylistDebounced,
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
