import { Input } from "@core/Input";
import { PropsWithChildren, useDebugValue, useEffect, useState } from "react";
import {
  useAddTracksToHistoryPlaylist,
  useGetHistorySyncStatus,
  useHistoryLastTrack,
  useHistoryPlaylist,
  usePlayHistoryPlaylist,
} from "../historyPlaylistHooks";
import { Loader } from "@core/Loader";
import { Button } from "@core/Button";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";
import { useSpotifyPlayer } from "@app/Spotify/Player";
import { useQueryClient } from "@tanstack/react-query";
import { useEditPlaylist } from "@app/Spotify/playlistHooks";

export const HistoryPlaylistStatus: React.FC<PropsWithChildren> = () => {
  const { isCurrentlyPlayingHistoryPlaylist } = useGetHistorySyncStatus();
  const historyPlaylist = useHistoryPlaylist();
  const name =
    historyPlaylist?.data?.name.split("]")[1] ?? historyPlaylist?.data?.name;
  const [editingName, setEditingName] = useState(false);
  const [historyPlaylistName, setHistoryPlaylistName] = useState<
    string | undefined
  >(undefined);
  const { mutate: mutateChangeHistoryPlaylistName } = useEditPlaylist();
  useEffect(() => {
    if (!editingName && historyPlaylistName !== name) {
      setHistoryPlaylistName(name);
    }
  }, [historyPlaylistName, name, editingName]);
  const saveNameChange = () => {
    if (historyPlaylist.data?.id) {
      mutateChangeHistoryPlaylistName(
        {
          playlistId: historyPlaylist.data?.id,
          details: {
            name: `[constellations] ${historyPlaylistName}`,
          },
        },
        {
          onSuccess: () => {
            setEditingName(false);
          },
        }
      );
    }
  };

  return (
    <div>
      <Loader isLoading={historyPlaylist.isLoading}>
        <div className="flex gap-2 justify-around items-center flex-wrap ">
          {editingName ? (
            <>
              <div className="flex gap-1">
                <Input
                  secondary={!isCurrentlyPlayingHistoryPlaylist}
                  value={historyPlaylistName}
                  onChange={(e) => {
                    setHistoryPlaylistName(e.target.value);
                  }}
                />
                <Button
                  onClick={() => {
                    saveNameChange();
                  }}
                >
                  save
                </Button>
                <Button
                  onClick={() => {
                    alert("not implemented!");
                    setEditingName(false);
                  }}
                >
                  save as new
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-1 items-center">
              <p className="text-bold text-primary-light text-lg">
                {historyPlaylist.data?.name}
              </p>
              <Button
                onClick={() => {
                  setEditingName(true);
                }}
              >
                edit
              </Button>
            </div>
          )}
          {isCurrentlyPlayingHistoryPlaylist ? undefined : (
            <>
              <AddNewSong />
              <ResumeHistoryFromEnd />
            </>
          )}
        </div>
      </Loader>
    </div>
  );
};
const AddNewSong: React.FC = () => {
  const player = useSpotifyPlayer();
  const currentTrack = player.state.currentTrack;
  const {
    isTrackInConstellationGraph,
    isCurrentlyPlayingHistoryPlaylist,
    isTrackInLastThreeTracks,
    isLoading: syncIsLoading,
  } = useGetHistorySyncStatus(currentTrack);

  const constellationGraph = useSpotifyConstellationGraph();

  const canAdd =
    (!isTrackInConstellationGraph || !isTrackInLastThreeTracks) &&
    !isCurrentlyPlayingHistoryPlaylist &&
    currentTrack;
  const addToHistory = useAddTracksToHistoryPlaylist();

  return (
    <Button
      disabled={!canAdd}
      isLoading={
        syncIsLoading ||
        constellationGraph?.addChildren.isPending ||
        !currentTrack ||
        addToHistory.isPending
      }
      onClick={() => {
        if (currentTrack && !isTrackInLastThreeTracks) {
          addToHistory.mutate(currentTrack);
        }
        if (
          currentTrack &&
          !constellationGraph?.addChildren.isPending &&
          !isTrackInConstellationGraph
        ) {
          constellationGraph?.addChildren.mutate({
            name: currentTrack.name,
            spotify_id: currentTrack.id,
          });
        }
      }}
    >
      Initialize Current Track
    </Button>
  );
};
const ResumeHistoryFromEnd: React.FC = () => {
  const player = useSpotifyPlayer();
  const currentTrack = player.state.currentTrack;
  const {
    isTrackInConstellationGraph,
    isTrackInLastThreeTracks,
    isCurrentlyPlayingHistoryPlaylist,
    isLoading: syncIsLoading,
  } = useGetHistorySyncStatus(currentTrack);

  const canResume =
    isTrackInLastThreeTracks &&
    !isCurrentlyPlayingHistoryPlaylist &&
    isTrackInConstellationGraph;

  const playHistory = usePlayHistoryPlaylist();
  const queryClient = useQueryClient();

  return (
    <Button
      disabled={!canResume}
      isLoading={syncIsLoading || player.isLoading || playHistory.isPending}
      onClick={() => {
        if (canResume) {
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
        }
      }}
    >
      Enter Constellation
    </Button>
  );
};
