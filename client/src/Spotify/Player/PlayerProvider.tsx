import React, { useEffect } from "react";
import {
  useGetNextSong,
  useGetSpotifyPlaybackState,
  usePlayPause,
  usePlayPlaylist,
  useSkipSong,
  useSkipToPrevSong,
  useTransitionTrackWhenDoneEffect,
} from "./PlayerHooks";
import { Episode, PlaybackState, Track } from "@spotify/web-api-ts-sdk";
import { useGetTrackBySpotifyId } from "@app/SpotifyTree/apiHooks";
import { useHistoryPlaylist } from "@app/SpotifyTree/historyHooks";
import { useIsTrackInHistoryPlaylist } from "@app/SpotifyTree/hooks";
import { useAddTracksToPlaylist } from "../playlistHooks";
import { useDebouncedCallback } from "use-debounce";

export interface player {
  togglePlay: () => void;
  skipToNextSong: () => void;
  skipToPrevSong: () => void;
  isLoading: boolean;
  state: Partial<PlaybackState> & {
    nextTrack: Track | undefined;
    currentTrack: Track | undefined;
  };
}
export const PlayerContext = React.createContext<player>({
  isLoading: true,
  togglePlay: () => {},
  skipToNextSong: () => {},
  skipToPrevSong: () => {},
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
  const { data: nextTrackData } = useGetNextSong();
  const currentTrackWebQuery = useGetTrackBySpotifyId(
    playbackStateQuery?.data?.item.id
  );
  const historyPlaylistQuery = useHistoryPlaylist({canCreate:true});
  const playPlaylist = usePlayPlaylist();
  const addTrack = useAddTracksToPlaylist();
  const inHistoryPlaylist = useIsTrackInHistoryPlaylist(currentTrack);
  const playHistoryPlaylistDebounced = useDebouncedCallback(() => {
    if (historyPlaylistQuery.data?.uri) {
      playPlaylist.mutate({
        contextUri: historyPlaylistQuery.data.uri,
        offset: currentTrack,
      });
    }
  }, 1000);
  const addTrackToHistoryPlaylistDebounced = useDebouncedCallback(() => {
    if (historyPlaylistQuery.data?.id && currentTrack) {
      addTrack.mutate({
        playlistId: historyPlaylistQuery.data?.id,
        tracks: [currentTrack],
      });
    }
  }, 1000);
  useEffect(() => {
    if (
      currentTrackWebQuery.data?.track &&
      historyPlaylistQuery?.data?.id &&
      inHistoryPlaylist.data &&
      historyPlaylistQuery?.data?.uri !==
        playbackStateQuery.data?.context?.uri &&
      !playPlaylist.isLoading &&
      !playbackStateQuery.isLoading
    ) {
      playHistoryPlaylistDebounced();
    }
  }, [
    playHistoryPlaylistDebounced,
    currentTrackWebQuery.data?.track,
    historyPlaylistQuery?.data,
    inHistoryPlaylist.data,
    playPlaylist,
    playbackStateQuery.data?.context?.uri,
    currentTrack,
    playbackStateQuery.isLoading,
  ]);
  useEffect(() => {
    if (
      currentTrackWebQuery.data?.track &&
      !inHistoryPlaylist.isLoading &&
      !inHistoryPlaylist.data &&
      historyPlaylistQuery.data?.id &&
      currentTrack &&
      !addTrack.isLoading &&
      !playbackStateQuery.isLoading
    ) {
      addTrackToHistoryPlaylistDebounced();
    }
  }, [
    currentTrack,
    addTrack,
    currentTrackWebQuery.data?.track,
    inHistoryPlaylist,
    historyPlaylistQuery,
    playbackStateQuery.isLoading,
  ]);

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
