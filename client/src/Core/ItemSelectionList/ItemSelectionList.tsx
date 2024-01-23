import React from "react";
import * as TrackVisualizer from "@app/SpotifyConstellationGraph/SpotifyConstellationGraph/TrackVisualizer";
import { useOnScreen } from "@app/hooks";
import { Button } from "@core/Button";
import { Loader } from "@core/Loader";
import { Image, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";

export const SelectionContainer: React.FC<{
  onClick?: (track: Track | SimplifiedPlaylist) => void;
  fetchNextPage?: () => void;
  itemData: Track[] | SimplifiedPlaylist[];
  isLoading: boolean;
  title: string;
}> = ({ onClick, fetchNextPage, itemData, isLoading, title }) => {
  const loadingButtonRef = React.createRef<HTMLButtonElement>();
  const isLoadingButtonOnScreen = useOnScreen(loadingButtonRef);
  React.useEffect(() => {
    if (isLoadingButtonOnScreen && fetchNextPage) {
      fetchNextPage();
    }
  }, [isLoadingButtonOnScreen]);
  const asTracks =
    itemData?.length && "track" in itemData[0] && (itemData as Track[]);
  const asPlaylists =
    itemData?.length &&
    "snapshot_id" in itemData[0] &&
    (itemData as SimplifiedPlaylist[]);
  return (
    <>
      <h2 className="text-xl font-bold uppercase">{title}:</h2>
      <Loader isLoading={isLoading} className="h-full w-full">
        <div className="overflow-auto gap-12 flex flex-wrap pb-24 justify-center px-2 h-full w-full ">
          {!itemData?.length && !isLoading ? (
            <div className="p-4">
              <p>no results!</p>
            </div>
          ) : undefined}
          {asTracks &&
            asTracks?.map((track) => {
              return (
                <TrackSelectorTrack
                  track={track}
                  key={track.id}
                  onClick={() => {
                    onClick && onClick(track);
                  }}
                />
              );
            })}
          {asPlaylists &&
            asPlaylists?.map((playlist) => {
              return (
                <TrackSelectorPlaylist
                  playlist={playlist}
                  key={playlist.id}
                  onClick={() => {
                    onClick && onClick(playlist);
                  }}
                />
              );
            })}

          {itemData?.length && fetchNextPage && (
            <Button
              ref={loadingButtonRef}
              onClick={() => {
                fetchNextPage();
              }}
              isLoading={isLoading}
            >
              load more tracks
            </Button>
          )}
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
