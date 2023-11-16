import React from "react";
import {
  Artist,
  Page,
  SimplifiedAlbum,
  SpotifyApi,
  Track,
} from "@spotify/web-api-ts-sdk";
import { useQuery } from "react-query";
import { useDebouncedCallback } from "use-debounce";
import { SearchExecutionFunction } from "@spotify/web-api-ts-sdk/dist/mjs/endpoints/SearchEndpoints";

console.log(process.env);
if (!process.env.REACT_APP_SPOTIFY_CLIENT_ID) {
  throw new Error(`No spotify client id provided check env is ${JSON.stringify(process.env)}`);
}

const sdk = SpotifyApi.withUserAuthorization(
  process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  "http://localhost:3000",
  [
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-library-read",
    "user-modify-playback-state",
    "user-read-playback-state",
  ]
);

const SpotifyContext = React.createContext(sdk);

export const SpotifyProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <SpotifyContext.Provider value={sdk}>{children}</SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const sdk = React.useContext(SpotifyContext);
  if (!sdk) {
    throw new Error(
      "cannot access spotify sdk make sure a spotify provider is being used"
    );
  }
  return sdk;
};

export const useSearchTracks = () => {
  const spotify = useSpotify();
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchSetSearchTerm = useDebouncedCallback((searchTerm) => {
    setSearchTerm(searchTerm);
  }, 1000);

  type SearchResults = {
    tracks: Page<Track>;
    artists: Page<Artist>;
    albums: Page<SimplifiedAlbum>;
  };
  const searchQuery = useQuery(
    ["songSearch", searchTerm],
    () => {
      return (
        //this alias is because something seems to be broken in the spotify apk
        (
          spotify.search as (
            q: string,
            type: ["track"]
          ) => Promise<SearchResults>
        )(searchTerm, ["track"])
      );
    },
    {enabled: searchTerm?.length > 0}
  );
  return [searchQuery, debouncedSearchSetSearchTerm] as [
    typeof searchQuery,
    typeof debouncedSearchSetSearchTerm
  ];
};
