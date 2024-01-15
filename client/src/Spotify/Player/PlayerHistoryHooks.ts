import React from "react";
import { player } from "./PlayerProvider";
import {
  useHistoryLastThreeSongs,
  useHistoryPlaylist,
} from "@app/SpotifyTree/historyHooks";
import { useGetNextSong, useGetUserQueue, useSetShuffle } from "./PlayerHooks";
import {useAddTracksToPlaylist} from "../playlistHooks";

export function useSyncHistoryPlaylistEffect({
  playerState,
}: {
  playerState?: player["state"];
}) {
  const historyPlaylistQuery = useHistoryPlaylist({ canCreate: true });

  const nextTrack = useGetNextSong();
  const currentTrack = playerState?.currentTrack;
  const lastThreeSongsQuery = useHistoryLastThreeSongs();
  const lastThreeTracks = lastThreeSongsQuery.data?.items;

  const { mutate: setShuffle } = useSetShuffle();
  const { mutate: addToPlaylist } = useAddTracksToPlaylist(historyPlaylistQuery);

  React.useEffect(() => {
      /** 
       * [web]delete from very last if not in children
       * [web]delete last two if 
       * [player]  
       *
       *
      * */
  }, []);

  React.useEffect(() => {
    if (playerState?.shuffle_state) {
      setShuffle({ shouldShuffle: false });
    }
  }, [playerState?.shuffle_state, setShuffle]);
}
export function useKeepShuffleOff() {}
