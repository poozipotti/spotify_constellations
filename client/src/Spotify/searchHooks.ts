import React from "react";
import {
  Artist,
  Page,
  SimplifiedAlbum,
  Track,
} from "@spotify/web-api-ts-sdk";
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from "use-debounce";
import {useSpotify} from ".";

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
        ((spotify.search as (
          q: string,
          type: ["track"]
        ) => Promise<SearchResults>)(searchTerm, ["track"]))
      );
    },
    {enabled: searchTerm?.length > 0}
  );
  return [searchQuery, debouncedSearchSetSearchTerm] as [
    typeof searchQuery,
    typeof debouncedSearchSetSearchTerm
  ];
};
