import React, { useState } from "react";
import { Button } from "@core/Button";
import {
  useGetPlaylistItems,
  useGetSpotifySavedPlaylists,
} from "@app/Spotify/playlistHooks";
import { SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { ItemSelectionList } from "@core/ItemSelectionList/ItemSelectionList";
import { useSpotifyConstellationGraph } from "@app/SpotifyConstellationGraph/hooks";
import { useCreateTracks } from "@app/SpotifyConstellationGraph/apiHooks";

export const SavedPlaylistTracks: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    undefined | Omit<SimplifiedPlaylist, "tracks">
  >();
  return selectedPlaylist ? (
    <>
      <Button
        onClick={() => {
          setSelectedPlaylist(undefined);
        }}
      >
        close
      </Button>
      <PlaylistTrackList playlist={selectedPlaylist} onSuccess={onSuccess} />
    </>
  ) : (
    <PlaylistList
      onClick={(playlist: SimplifiedPlaylist) => setSelectedPlaylist(playlist)}
    />
  );
};

export const PlaylistTrackList: React.FC<{
  playlist: Omit<SimplifiedPlaylist, "tracks">;
  onSuccess?: () => void;
}> = ({ playlist, onSuccess }) => {
  const playlistData = useGetPlaylistItems(playlist.id);
  const tracks: Track[] | undefined = playlistData.data?.pages
    .flatMap((data) => data.items)
    .filter((item) => "track" in item.track)
    .map((playlistedTrack) => playlistedTrack.track as Track);
  const createTracks = useCreateTracks();
  const loading = playlistData.isLoading;
  const constellationGraph = useSpotifyConstellationGraph();

  return (
    <>
      {tracks && (
        <Button
          isLoading={createTracks.isPending}
          onClick={() => {
            createTracks.mutate(
              tracks.map((track) => ({
                name: track.name,
                spotify_id: track.id,
              })),
              {
                onSuccess: () => {
                  onSuccess && onSuccess();
                },
              }
            );
          }}
        >
          Import
        </Button>
      )}
      <ItemSelectionList
        trackData={{
          tracks: tracks,
          onClick: (track) => {
            constellationGraph?.addChild.mutate(
              {
                name: track.name,
                spotify_id: track.id,
              },
              {
                onSuccess: () => {
                  onSuccess && onSuccess();
                },
              }
            );
          },
        }}
        isLoading={loading}
        isFetching={playlistData.isFetching}
        fetchNextPage={
          playlistData.hasNextPage ? playlistData.fetchNextPage : undefined
        }
        title={playlist.name}
      />
    </>
  );
};
export const PlaylistList: React.FC<{
  onSuccess?: () => void;
  onClick: (playlist: SimplifiedPlaylist) => void;
}> = ({ onClick }) => {
  const searchData = useGetSpotifySavedPlaylists();
  const playlists = searchData.data?.pages.flatMap((data) => data.items);
  const loading = searchData.isLoading;

  return (
    <ItemSelectionList
      playlistData={{ playlists, onClick }}
      isLoading={loading}
      fetchNextPage={
        searchData.hasNextPage ? searchData.fetchNextPage : undefined
      }
      isFetching={searchData.isFetching}
      title="My Playlists"
    />
  );
};
