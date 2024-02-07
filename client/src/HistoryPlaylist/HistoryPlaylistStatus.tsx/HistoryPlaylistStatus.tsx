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
import { useDebounce } from "use-debounce";
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
  const [debouncedHistoryPlaylistName] = useDebounce(historyPlaylistName, 300);
  const { mutate: mutateChangeHistoryPlaylistName } = useEditPlaylist();
  useEffect(() => {
    if (!historyPlaylistName && name) {
      setHistoryPlaylistName(name);
    }
  }, [historyPlaylistName, name]);

  useEffect(() => {
    if (
      debouncedHistoryPlaylistName &&
      debouncedHistoryPlaylistName !== name &&
      historyPlaylist.data &&
      !historyPlaylist.isLoading
    ) {
      mutateChangeHistoryPlaylistName({
        playlistId: historyPlaylist.data?.id,
        details: { name: `[constellations] ${debouncedHistoryPlaylistName}` },
      });
    }
  }, [
    debouncedHistoryPlaylistName,
    historyPlaylist.data,
    historyPlaylist.isLoading,
    name,
  ]);

  return (
    <div>
      <p>
        current Constellation playlist{" "}
        {isCurrentlyPlayingHistoryPlaylist ? "(playing)" : "(not-playing)"}:
      </p>
      <Loader isLoading={historyPlaylist.isLoading}>
        <div className="flex gap-2 justify-stretch">
          {editingName ? (
            <Input
              secondary={!isCurrentlyPlayingHistoryPlaylist}
              value={historyPlaylistName}
              stretch={isCurrentlyPlayingHistoryPlaylist}
              onChange={(e) => {
                setHistoryPlaylistName(e.target.value);
              }}
            />
          ) : (
            <Button
              onClick={() => {
                setEditingName(true);
              }}
            >
              {historyPlaylist.data?.name}
            </Button>
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
  const { data: lastTrackData, isLoading: lastTrackLoading } =
    useHistoryLastTrack();
  const {
    isTrackInConstellationGraph,
    isCurrentlyPlayingHistoryPlaylist,
    isTrackInLastThreeTracks,
  } = useGetHistorySyncStatus(lastTrackData);

  const canResume =
    isTrackInLastThreeTracks &&
    !isCurrentlyPlayingHistoryPlaylist &&
    isTrackInConstellationGraph;

  const playHistory = usePlayHistoryPlaylist();
  const queryClient = useQueryClient();

  return (
    <Button
      disabled={!canResume}
      isLoading={lastTrackLoading || playHistory.isPending}
      onClick={() => {
        if (canResume) {
          playHistory.mutate(lastTrackData, {
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
