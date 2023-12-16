import * as webSdk from "@app/WebSdk";
import { useMutation, useQuery } from "react-query";

export function useGetAllTracks() {
  const queryData = useQuery(["web-tracks"], webSdk.getAllTracks);
  return queryData;
}
export function useGetTrack(id: number) {
  const queryData = useQuery(["web-track", id], () => webSdk.getTrack(id));
  return queryData;
}
export function useGetTrackChildren(id: number) {
  const queryData = useQuery(["web-track-children", id], () =>
    webSdk.getTrackChildren(id)
  );
  return queryData;
}
export function useCreateTrack() {
  const queryData = useMutation(
    ["web-track-children"],
    (track: webSdk.TCreateTrackData) => webSdk.createTrack(track)
  );
  return queryData
}
