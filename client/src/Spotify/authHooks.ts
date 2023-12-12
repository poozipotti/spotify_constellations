import { useQuery } from "react-query";
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
