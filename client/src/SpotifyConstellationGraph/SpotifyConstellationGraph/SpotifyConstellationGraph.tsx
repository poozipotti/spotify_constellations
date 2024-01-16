import React, { PropsWithChildren } from "react";
import { CurrentTrackNode } from "./CurrentTrackNode";
import { TrackNode } from "@app/SpotifyConstellationGraph/SpotifyConstellationGraph/TrackNode/TrackNode";
import { useSpotifyConstellationGraph } from "../hooks";
import { useSpotifyPlayer } from "@app/Spotify/Player";
import { useHistoryPlaylist } from "../historyHooks";

export const SpotifyConstellationGraph: React.FC<PropsWithChildren> = () => {
  const constellationGraph = useSpotifyConstellationGraph();
  const player = useSpotifyPlayer();
  const historyPlaylist = useHistoryPlaylist();
  const playingHistoryPlaylist =
    player.state.context?.uri === historyPlaylist.data?.uri;
  return (
    <div className="flex flex-col gap-12">
      <CurrentTrackNode />
      {playingHistoryPlaylist && (
        <div className="flex justify-center gap-6 w-screen overflow-auto">
          {constellationGraph?.state.childTracks.map((track) => (
            <TrackNode
              track={track}
              key={track.id}
              selected={constellationGraph.state.selectedTrack?.id === track.id}
              onClick={() => {
                constellationGraph.setSelectedTrack(track);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
