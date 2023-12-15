import React from "react";
import { useSearchTracks } from "@app/Spotify/searchHooks";
import { Input } from "@core/Input";
import { Loader } from "@core/Loader";
import * as TrackVisualizer from "@app/SpotifyTree/TrackVisualizer";

export const SearchSong: React.FC = () => {
  const [searchData, setSearchTerm] = useSearchTracks();
  const tracks = searchData.data?.tracks.items;
  const loading = searchData.isLoading;
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button
        className={
          isOpen
            ? "hidden"
            : "text-primary-light tw-w-full flex justify-end px-6 py-4"
        }
        style={{ width: "1024px", maxWidth: "100vw" }}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{
            fill: "currentColor",
            filter: "drop-shadow(0px 0px 10px rgba(134,239,172,.8))",
            transform: "scale(1.2)",
          }}
        >
          <path d="M5 21h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM5 5h14l.001 14H5V5z"></path>
          <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
        </svg>
      </button>
      <button
        className={
          !isOpen
            ? "hidden"
            : "text-primary-light tw-w-full flex justify-end px-6 py-4"
        }
        onClick={() => {
          setIsOpen(false);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{
            fill: "currentColor",
            filter: "drop-shadow(0px 0px 10px rgba(134,239,172,.8))",
            transform: "scale(1.2)",
          }}
        >
          <path d="M5 21h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM5 5h14l.001 14H5V5z"></path>
          <path d="M12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707-1.414-1.414z"></path>
        </svg>
      </button>
      <div
        className={`
          ${isOpen ? "h-full" : "h-0 overflow-hidden"}
          ${isOpen ? "flex" : "hidden"}

          justify-center flex-col 
          transition-all 
          px-6
        `}
        style={{ width: "1024px", maxWidth: "100vw" }}
      >
        <Input
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="remind you of anything?"
        />
        <Loader isLoading={loading} className="h-full w-full">
          <div
            className="overflow-auto gap-12 flex flex-wrap pb-24 justify-center px-2 h-full w-full "
          >
            {!tracks?.length && !loading ? (
              <div className="p-4">
                <p>no results!</p>
              </div>
            ) : undefined}
            {tracks?.map((track) => (
              <div
                key={track.id}
                className="w-full md:w-max pt-6 "
                style={{
                  filter: "drop-shadow(0px 0px 10px rgba(0,0,0,.8))",
                }}
              >
                <TrackVisualizer.TrackVisualizer
                  track={track}
                  size={"w-full md:w-max h-24 px-4 "}
                >
                  <TrackVisualizer.TrackTitle track={track} />
                  <div className="h-2 w-full"></div>
                  <TrackVisualizer.TrackArtists track={track} />
                </TrackVisualizer.TrackVisualizer>
              </div>
            ))}
          </div>
        </Loader>
      </div>
    </>
  );
};
