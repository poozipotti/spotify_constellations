import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { useSpotify } from ".";
import { ItemTypes } from "@spotify/web-api-ts-sdk";

export const useSearchTracks = () => {
  const searchTracks = useSearchItems("track");
  return searchTracks;
};

export const useSearchPlaylists = () => {
  const searchPlaylist = useSearchItems("playlist");
  return searchPlaylist;
};

const SEARCH_PAGE_SIZE = 25;
const useSearchItems = (type: ItemTypes) => {
  const spotify = useSpotify();
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchSetSearchTerm = useDebouncedCallback((searchTerm) => {
    setSearchTerm(searchTerm);
  }, 1000);

  const searchQuery = useInfiniteQuery({
    queryKey: ["search", type, searchTerm],
    staleTime: Infinity,
    queryFn: ({ pageParam }) => {
      return spotify.search(
        searchTerm,
        [type],
        undefined,
        SEARCH_PAGE_SIZE,
        pageParam
      );
    },
    enabled: searchTerm?.length > 0,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      //weird data issue because ItemTypes is not pluralized
      const typeKey = `${type}s` as "playlists" | "tracks";
      return lastPage[typeKey].next
        ? pages.length * lastPage[typeKey].limit
        : undefined;
    },
  });
  return [searchQuery, debouncedSearchSetSearchTerm] as [
    typeof searchQuery,
    typeof debouncedSearchSetSearchTerm
  ];
};
