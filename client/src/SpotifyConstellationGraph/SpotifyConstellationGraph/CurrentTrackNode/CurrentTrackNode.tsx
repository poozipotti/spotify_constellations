import React, { PropsWithChildren } from "react";
import * as TrackVisualizer from "@app/SpotifyConstellationGraph/SpotifyConstellationGraph/TrackVisualizer";
import { useSpotifyPlayer } from "@app/Spotify/Player";
import { Button } from "@core/Button";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";
import { useHistoryPlaylist } from "@app/HistoryPlaylist/historyPlaylistHooks";

export const CurrentTrackNode: React.FC<PropsWithChildren> = () => {
  const player = useSpotifyPlayer();
  const constellationGraph = useSpotifyConstellationGraph();
  const inConstellationGraph = !!(constellationGraph?.state.currentTrack && !constellationGraph?.state.isLoading);
  const currentTrack = player.state?.currentTrack;
  const historyPlaylist = useHistoryPlaylist();
  const playingHistoryPlaylist =
    player.state.context?.uri === historyPlaylist.data?.uri;
  return (
    <div>
      <TrackVisualizer.TrackTitle track={player.state?.currentTrack} />
      <TrackVisualizer.TrackArtists track={player.state?.currentTrack} />
      <div className="flex justify-center gap-4">
        <PrevButton />
        <div
          className="cursor-pointer mt-4"
          onClick={() => {
            player.togglePlay();
          }}
        >
          <TrackVisualizer.TrackVisualizer
            track={currentTrack}
            duration={currentTrack?.duration_ms}
            position={player.state?.progress_ms}
            isPaused={!player.state?.is_playing}
            nextTrack={player.state?.nextTrack}
            isLoading={player.isLoading}
          />
        </div>
        <NextButton />
      </div>
      {!(inConstellationGraph && playingHistoryPlaylist) && (
        <div className="flex flex-col items-center gap-4 p-t-4">
          {!inConstellationGraph && (
            <Button
              onClick={() => {
                if (currentTrack && !constellationGraph?.addChild.isPending) {
                  constellationGraph?.addChild.mutate({
                    name: currentTrack.name,
                    spotify_id: currentTrack.id,
                  });
                }
              }}
            >
              Add Track To Spotify Constellation
            </Button>
          )}
          {!playingHistoryPlaylist && inConstellationGraph && (
            <Button
              onClick={() => {
                player.playHistoryPlaylist();
              }}
            >
              Enter Spotify constellation
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const NextButton: React.FC = () => {
  const player = useSpotifyPlayer();
  return (
    <Button
      hideBorder
      onClick={() => {
        player.skipToNextTrack();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        className="drop-shadow-lg fill-current"
      >
        <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path>
      </svg>
    </Button>
  );
};

const PrevButton: React.FC = () => {
  const player = useSpotifyPlayer();
  return (
    <Button
      hideBorder
      onClick={() => {
        player.skipToPrevTrack();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        className="drop-shadow-lg fill-current"
      >
        <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path>
      </svg>
    </Button>
  );
};
