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
export function useCreateTracks() {
  const queryClient = useQueryClient();
  const queryData = useMutation({
    mutationFn: (
      tracks: (webSdk.TCreateTrackData & { parent_id?: number })[]
    ) => webSdk.createTracks(tracks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["web-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["web-track-children"] });
      queryClient.invalidateQueries({ queryKey: ["web-track-parents"] });
    },
  });
  return queryData;
}
