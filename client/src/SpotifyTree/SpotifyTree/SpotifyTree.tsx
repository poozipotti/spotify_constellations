import React, { PropsWithChildren } from "react";
import { CurrentSongNode } from "./CurrentSongNode";
import { TrackNode } from "@app/SpotifyTree/SpotifyTree/TrackNode/TrackNode";
import { useSpotifyTree } from "../hooks";

export const SpotifyTree: React.FC<PropsWithChildren> = () => {
  const tree = useSpotifyTree();

  return (
    <div className="flex flex-col gap-12">
      <CurrentSongNode />
      <div className="flex justify-center gap-6 w-screen overflow-auto">
        {tree.nextSongs.map((track) => (
          <TrackNode
            track={track}
            key={track.id}
            selected={tree.selectedNextSong?.id === track.id}
          />
        ))}
      </div>
    </div>
  );
};