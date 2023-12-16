import * as webSdk from "@app/WebSdk";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetAllTracks() {
  const queryData = useQuery(["web-tracks"], webSdk.getAllTracks);
  return queryData;
}
export function useGetTrack(id: number) {
  const queryData = useQuery(["web-tracks", id], () => webSdk.getTrack(id));
  return queryData;
}
export function useGetTrackChildren(id: number) {
  const queryData = useQuery(["web-tracks", "children", id], () =>
    webSdk.getTrackChildren(id)
  );
  return queryData;
}
export function useCreateTrack() {
  const queryClient = useQueryClient();
  const queryData = useMutation(
    ["web-track-children"],
    (track: webSdk.TCreateTrackData) => webSdk.createTrack(track),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("web-tracks");
      },
    }
  );
  return queryData;
}
