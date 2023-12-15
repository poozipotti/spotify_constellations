import React, { PropsWithChildren } from "react";
import * as TrackVisualizer from "@app/SpotifyTree/TrackVisualizer";
import {
  useGetNextSong,
  useGetSpotifyPlaybackState,
  usePlayPause,
} from "../../Spotify/Player/PlayerHooks";
import { Episode, Track } from "@spotify/web-api-ts-sdk";

function asTrack(item: Track | undefined | Episode) {
  return item && "artists" in item ? (item as Track) : undefined;
}

export const CurrentSongNode: React.FC<PropsWithChildren> = () => {
  const { data: playbackState, isLoading: isPlaybackStateLoading } =
    useGetSpotifyPlaybackState();
  const currentTrack = asTrack(playbackState?.item);
  const { mutate } = usePlayPause();
  const { data: nextTrackData } = useGetNextSong(currentTrack);
  const nextTrack = asTrack(nextTrackData?.track);

  return (
    <>
      <TrackVisualizer.TrackTitle track={currentTrack} />
      <TrackVisualizer.TrackArtists track={currentTrack} />
      <div
        className="cursor-pointer mt-4"
        onClick={() => {
          mutate();
        }}
      >
        <TrackVisualizer.TrackVisualizer
          track={currentTrack}
          duration={currentTrack?.duration_ms}
          position={playbackState?.progress_ms}
          isPaused={!playbackState?.is_playing}
          nextTrack={nextTrack}
          isLoading={isPlaybackStateLoading}
        />
      </div>
    </>
  );
};
