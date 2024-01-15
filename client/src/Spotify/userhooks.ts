import { useQuery } from '@tanstack/react-query';
import { useSpotify } from ".";

export function useGetUser() {
  const sdk = useSpotify();
  const query = useQuery(["current-user"], () => {
    return sdk.currentUser.profile();
  });
  return query;
}
