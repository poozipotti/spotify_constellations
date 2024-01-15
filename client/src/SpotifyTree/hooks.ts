import React from "react";
import { TreeContext } from "@app/SpotifyTree/SpotifyTreeProvider";
import { useHistoryPlaylist } from "./historyHooks";
import { Track } from "@spotify/web-api-ts-sdk";

export const useSpotifyTree = () => {
  const tree = React.useContext(TreeContext);

  return tree;
};

export const useIsTrackInHistoryPlaylist = (track?: Track) => {
  const { data: historyPlaylistData, ...queryData } = useHistoryPlaylist();
  const inHistory = React.useMemo(
    () =>
      !track || queryData.isLoading
        ? "loading"
        : !!historyPlaylistData?.tracks.items.find(
            (playlistTrack) => playlistTrack.track.id === track.id,
          ),
    [historyPlaylistData?.tracks.items, queryData.isLoading, track],
  );
  return { ...queryData, data: inHistory };
};
