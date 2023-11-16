import React from "react";
import { useQuery } from "react-query";
import { useDebouncedCallback } from "use-debounce";
import { useSpotify } from ".";

export const useGetToken = () => {
  const spotify = useSpotify();

  const tokenQuery = useQuery(
    ["auth-token"],
    () => {
      return spotify.getAccessToken();
    },
  );
  return tokenQuery;
};
