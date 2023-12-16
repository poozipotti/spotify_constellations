import React, { PropsWithChildren } from "react";
import { CurrentSongNode } from "./CurrentSongNode";
import { useGetAllTracks } from "./hooks";

export const SpotifyTree: React.FC<PropsWithChildren> = () => {
  const { data: tracks } = useGetAllTracks();

  return (
    <>
      <CurrentSongNode />
      {tracks?.tracks.map((track) => (
        <div>{track.name}</div>
      ))}
    </>
  );
};
