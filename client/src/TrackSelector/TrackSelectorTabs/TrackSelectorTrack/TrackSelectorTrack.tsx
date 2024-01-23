import React from "react";
import * as TrackVisualizer from "@app/SpotifyConstellationGraph/SpotifyConstellationGraph/TrackVisualizer";
import { Playlist, Track } from "@spotify/web-api-ts-sdk";

export const TrackSelectorTrack: React.FC<{
  onClick?: () => void;
  track: Track;
}> = ({ onClick, track }) => {
  return (
    <div className="w-full md:w-max pt-6 ">
      <TrackVisualizer.AlbumContainer
        track={track}
        size={"w-full md:w-max h-24 px-4 pointer "}
        onClick={() => {
          onClick && onClick();
        }}
        imageUrl={track.album.images[0].url}
      >
        <TrackVisualizer.TrackTitle track={track} />
        <div className="h-2 w-full"></div>
        <TrackVisualizer.TrackArtists track={track} />
      </TrackVisualizer.AlbumContainer>
    </div>
  );
};
export const TrackSelectorPlaylist: React.FC<{
  onClick?: () => void;
  playlist: Omit<Playlist, "tracks">;
}> = ({ onClick, playlist }) => {
  const playlistData = {
    artists: [{ name: playlist.owner.display_name }],
    name: playlist.name,
  };
  const image = playlist.images[0] && playlist.images[0].url;
  return (
    <div className="w-full pt-6 ">
      <TrackVisualizer.AlbumContainer
        track={playlistData}
        size={"w-full h-24 px-4 pointer "}
        onClick={() => {
          onClick && onClick();
        }}
        imageUrl={image}
      >
        <TrackVisualizer.TrackTitle track={playlistData} />
        <div className="h-2 w-full"></div>
        <TrackVisualizer.TrackArtists track={playlistData} />
      </TrackVisualizer.AlbumContainer>
    </div>
  );
};
