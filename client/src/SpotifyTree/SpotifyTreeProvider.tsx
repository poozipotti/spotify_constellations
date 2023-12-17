import { Track } from "@spotify/web-api-ts-sdk";
import {
  SpotifyPlayerProvider,
  player,
} from "@app/Spotify/Player/PlayerProvider";
import React from "react";

interface tree {
  currentSong: Track | undefined;
  selectedNextSong: Track | undefined;
  setSelectedNextSong: (track: Track) => void;
  nextSongs: Track[];
  prevSong: Track | undefined;
  player: player | undefined;
  isLoading: boolean;
}
const INIT_TREE = {
  currentSong: undefined,
  selectedNextSong: undefined,
  isLoading: true,
  setSelectedNextSong: () => {},
  nextSongs: [],
  prevSong: undefined,
  player: undefined,
};
export const PlayerContext = React.createContext<tree>(INIT_TREE);

const SpotifyTreeProviderInternal: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <PlayerContext.Provider value={INIT_TREE}>
      {children}
    </PlayerContext.Provider>
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
