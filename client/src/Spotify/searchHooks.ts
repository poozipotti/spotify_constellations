import React from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { useSpotify } from ".";

const SEARCH_PAGE_SIZE = 25;
export const useSearchTracks = () => {
  const spotify = useSpotify();
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchSetSearchTerm = useDebouncedCallback((searchTerm) => {
    setSearchTerm(searchTerm);
  }, 1000);

  const searchQuery = useInfiniteQuery({
    queryKey: ["trackSearch", searchTerm],
    queryFn: ({pageParam}) => {
      return spotify.search(
        searchTerm,
        ["track"],
        undefined,
        SEARCH_PAGE_SIZE,
        pageParam
      );
    },
    enabled: searchTerm?.length > 0,
    initialPageParam: 0,
    getNextPageParam: (lastPage,pages) =>
      lastPage.tracks.next
        ? pages.length * lastPage.tracks.limit
        : undefined,
  });
  return [searchQuery, debouncedSearchSetSearchTerm] as [
    typeof searchQuery,
    typeof debouncedSearchSetSearchTerm
  ];
};
