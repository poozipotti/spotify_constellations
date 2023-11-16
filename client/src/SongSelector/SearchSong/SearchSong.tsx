import React, { PropsWithChildren } from "react";
import { useSearchTracks } from "../../Spotify";
import { Input } from "../../Core/Input";
import { Loader } from "../../Core/Loader";

export const SearchSong: React.FC = () => {
  const [searchData, setSearchTerm] = useSearchTracks();
  const tracks = searchData.data?.tracks.items;
  const loading = searchData.isLoading;

  return (
    <div className="justify-center flex flex-col p-24 ">
      <Input
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="search songs"
      />
      <Loader isLoading={loading}>
        <div className="overflow-scroll h-64 gap-6 flex flex-wrap pb-24 justify-center">
          {tracks?.map((track) => (
            <div className="grid w-36 h-36 grid-cols-1 grid-rows-3 mt-6">
              <img
                src={track.album.images[0].url}
                alt={`album art for the album ${track.album.name}`}
                className="w-full h-full row-start-1 row-span-3 col-start-1"
              ></img>
              <p className="bg-background/75 row-start-1 row-span-3 col-start-1 z-10 mt-auto">
                {track.name}
              </p>
            </div>
          ))}
        </div>
      </Loader>
    </div>
  );
};
