import React from "react";
import * as TrackVisualizer from "@app/SpotifyConstellationGraph/SpotifyConstellationGraph/TrackVisualizer";
import { useOnScreen } from "@app/hooks";
import { Button } from "@core/Button";
import { Loader } from "@core/Loader";
import { Image, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";

export const ItemSelectionList: React.FC<{
  trackData?: { tracks?: Track[]; onClick?: (track: Track) => void };
  playlistData?: {
    playlists?: Omit<SimplifiedPlaylist, "tracks">[];
    onClick?: (playlist: Omit<SimplifiedPlaylist, "tracks">) => void;
  };
  fetchNextPage?: () => void;
  isLoading: boolean;
  isFetching: boolean;
  title: string;
}> = ({
  fetchNextPage,
  trackData,
  playlistData,
  isLoading,
  title,
  isFetching,
}) => {
  const loadingButtonRef = React.createRef<HTMLButtonElement>();
  const isLoadingButtonOnScreen = useOnScreen(loadingButtonRef);
  React.useEffect(() => {
    if (isLoadingButtonOnScreen && fetchNextPage) {
      fetchNextPage();
    }
  }, [isLoadingButtonOnScreen]);
  if (trackData?.tracks && playlistData?.playlists) {
    throw new Error(
      "cannot pass both playlists and tracks to item selection List"
    );
  }
  const hasItems = trackData?.tracks?.length || playlistData?.playlists?.length;
  return (
    <>
      <h2 className="text-xl font-bold uppercase">{title}:</h2>
      <Loader isLoading={isLoading} className="h-full w-full">
        <div className="overflow-auto gap-12 flex flex-wrap pb-24 justify-center px-2 h-full w-full">
          {!hasItems && !isLoading ? (
            <div className="p-4">
              <p>no results!</p>
            </div>
          ) : undefined}
          {trackData?.tracks?.map((track) => {
            return (
              <TrackSelectorTrack
                track={track}
                key={track.id}
                onClick={() => {
                  trackData.onClick && trackData.onClick(track);
                }}
              />
            );
          })}
          {playlistData?.playlists?.map((playlist) => {
            return (
              <TrackSelectorPlaylist
                playlist={playlist}
                key={playlist.id}
                onClick={() => {
                  playlistData.onClick && playlistData.onClick(playlist);
                }}
              />
            );
          })}

          <div className="w-full flex justify-center h-24">
            {hasItems && fetchNextPage && (
              <Button
                ref={loadingButtonRef}
                onClick={() => {
                  fetchNextPage();
                }}
                isLoading={isLoading || isFetching}
              >
                load more tracks
              </Button>
            )}
          </div>
        </div>
      </Loader>
    </>
  );
};

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
type playlistProp = {
  name: string;
  owner: { display_name: string };
  images: Image[];
};
export const TrackSelectorPlaylist: React.FC<{
  onClick?: () => void;
  playlist: playlistProp;
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
