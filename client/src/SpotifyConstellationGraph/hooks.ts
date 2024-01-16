import React from "react";
import { ConstellationGraphContext } from "@app/SpotifyConstellationGraph/SpotifyConstellationGraphProvider";
import { useHistoryPlaylist } from "./historyHooks";
import { Track } from "@spotify/web-api-ts-sdk";

export const useSpotifyConstellationGraph = () => {
  const constellationGraph = React.useContext(ConstellationGraphContext);

  return constellationGraph;
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
