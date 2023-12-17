import React, { PropsWithChildren } from "react";
import { CurrentSongNode } from "./CurrentSongNode";
import { useGetAllTracks } from "@app/SpotifyTree/apiHooks";
import { TrackNode } from "@app/SpotifyTree/SpotifyTree/TrackNode/TrackNode";

export const SpotifyTree: React.FC<PropsWithChildren> = () => {
  const { data: tracks } = useGetAllTracks();

  return (
    <div className="flex flex-col gap-12">
      <CurrentSongNode />
      <div className="flex justify-center gap-6 w-screen overflow-auto">
        {tracks?.tracks.map((track) => (
          <TrackNode trackId={track.spotify_id} key={track.id} />
        ))}
      </div>
    </div>
  );
};
