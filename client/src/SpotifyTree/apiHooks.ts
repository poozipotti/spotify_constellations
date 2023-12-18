import * as webSdk from "@app/WebSdk";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetAllTracks() {
  const queryData = useQuery(["web-tracks"], webSdk.getAllTracks);
  return queryData;
}
export function useGetTrack(id?: number) {
  const queryData = useQuery(
    ["web-tracks", id],
    () => {
      if (id) {
        return webSdk.getTrack(id);
      }
    },
    {
      enabled: !!id,
    }
  );
  return queryData;
}
export function useGetTracksBySpotifyId(spotifyId?: string) {
  const queryData = useQuery(
    ["web-tracks", spotifyId],
    async () => {
      if (spotifyId) {
        return webSdk.getTracksBySpotifyId(spotifyId);
      }
    },
    { enabled: !!spotifyId }
  );
  return queryData;
}
export function useGetTrackChildren(id?: number) {
  const queryData = useQuery(
    ["web-track-children", id],
    () => {
      if (id) {
        return webSdk.getTrackChildren(id);
      }
    },
    { enabled: !!id }
  );
  return queryData;
}
export function useCreateTrack() {
  const queryClient = useQueryClient();
  const queryData = useMutation(
    ["create-web-track"],
    (track: webSdk.TCreateTrackData) => webSdk.createTrack(track),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("web-tracks");
      },
    }
  );
  return queryData;
}
