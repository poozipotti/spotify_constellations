import * as webSdk from "@app/WebSdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetAllTracks() {
  const queryData = useQuery({
    queryKey: ["web-tracks"],
    ...webSdk.getAllTracks,
  });
  return queryData;
}
export function useGetTrack(id?: number) {
  const queryData = useQuery({
    queryKey: ["web-tracks", id],

    queryFn: () => {
      if (id) {
        return webSdk.getTrack(id);
      }
    },

    enabled: !!id,
  });
  return queryData;
}
export function useGetTrackBySpotifyId(spotifyId?: string) {
  const queryData = useQuery({
    queryKey: ["web-tracks", spotifyId],

    queryFn: async () => {
      if (spotifyId) {
        return webSdk.getTrackBySpotifyId(spotifyId);
      }
    },

    enabled: !!spotifyId,

    retry: (count, error) => {
      if ((error as webSdk.WebApiError).statusCode === 404) {
        return false;
      }
      return count < 3;
    },
  });
  return queryData;
}
export function useGetTrackChildren(id?: number) {
  const queryData = useQuery({
    queryKey: ["web-track-children", id],

    queryFn: () => {
      if (id) {
        return webSdk.getTrackChildren(id);
      }
    },

    enabled: !!id,
  });
  return queryData;
}
export function useGetTrackParents(id?: number) {
  const queryData = useQuery({
    queryKey: ["web-track-parents", id],

    queryFn: () => {
      if (id) {
        return webSdk.getTrackParents(id);
      }
    },

    enabled: !!id,
  });
  return queryData;
}
export function useCreateTrack() {
  const queryClient = useQueryClient();
  const queryData = useMutation(
    ["create-web-track"],
    (track: webSdk.TCreateTrackData & { parent_id?: number }) =>
      webSdk.createTrack(track),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("web-tracks");
        queryClient.invalidateQueries("web-track-children");
        queryClient.invalidateQueries("web-track-parents");
      },
    },
  );
  return queryData;
}
