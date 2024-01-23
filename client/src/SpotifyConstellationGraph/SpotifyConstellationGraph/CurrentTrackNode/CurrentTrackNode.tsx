import React, { PropsWithChildren } from "react";
import * as TrackVisualizer from "@app/SpotifyConstellationGraph/SpotifyConstellationGraph/TrackVisualizer";
import { useSpotifyPlayer } from "@app/Spotify/Player";
import { Button } from "@core/Button";
import {
  useAddTracksToHistoryPlaylist,
  useGetHistorySyncStatus,
  usePlayHistoryPlaylist,
} from "@app/HistoryPlaylist/historyPlaylistHooks";
import { useQueryClient } from "@tanstack/react-query";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";

export const CurrentTrackNode: React.FC<PropsWithChildren> = () => {
  const {
    isCurrentSongInConstellationGraph,
    isCurrentSongInLastThreeTracks,
    isCurrentlyPlayingHistoryPlaylist,
  } = useGetHistorySyncStatus();
  const player = useSpotifyPlayer();
  const constellationGraph = useSpotifyConstellationGraph();
  const currentTrack = player.state?.currentTrack;
  const addToHistory = useAddTracksToHistoryPlaylist();
  const playHistory = usePlayHistoryPlaylist();
  const queryClient = useQueryClient();
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
            imageUrl={currentTrack?.album.images[0].url}
            duration={currentTrack?.duration_ms}
            position={player.state?.progress_ms}
            isPaused={!player.state?.is_playing}
            nextTrack={player.state?.nextTrack}
            isLoading={player.isLoading}
          />
        </div>
        <NextButton />
      </div>
      {!(
        isCurrentSongInConstellationGraph && isCurrentlyPlayingHistoryPlaylist
      ) && (
        <div className="flex flex-col items-center gap-4 p-t-4">
          {(!isCurrentSongInConstellationGraph ||
            !isCurrentSongInLastThreeTracks) && (
            <Button
              isLoading={
                constellationGraph?.addChild.isPending ||
                !currentTrack ||
                addToHistory.isPending
              }
              onClick={() => {
                if (currentTrack && !isCurrentSongInLastThreeTracks) {
                  addToHistory.mutate(currentTrack);
                }
                if (
                  currentTrack &&
                  !constellationGraph?.addChild.isPending &&
                  !isCurrentSongInConstellationGraph
                ) {
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
          {!isCurrentlyPlayingHistoryPlaylist &&
            isCurrentSongInConstellationGraph &&
            isCurrentSongInLastThreeTracks && (
              <Button
                isLoading={player.isLoading || playHistory.isPending}
                onClick={() => {
                  playHistory.mutate(currentTrack, {
                    onSuccess: () => {
                      queryClient.invalidateQueries({
                        queryKey: ["user-queue"],
                      });
                      return queryClient.invalidateQueries({
                        queryKey: ["playbackState"],
                      });
                    },
                  });
                }}
              >
                Enter Spotify Constellation
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
