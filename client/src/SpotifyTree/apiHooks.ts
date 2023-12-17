import { useCreatePlaylist, useGetPlaylist } from "@app/Spotify/playlistHooks";
import * as webSdk from "@app/WebSdk";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
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

export function useHistoryPlaylist() {
  const { mutate: createPlaylist } = useCreatePlaylist();
  const [playlistId, setPlayListId] = useLocalStorage("history-playlist-id");
  const playlistQuery = useGetPlaylist(playlistId);
  useEffect(() => {
    if (playlistQuery.data?.id && playlistId !== playlistQuery.data?.id) {
      setPlayListId(playlistQuery.data?.id);
    }
  }, [playlistQuery.data?.id, playlistId, setPlayListId]);
  useEffect(() => {
    if (!playlistId || playlistQuery.isError) {
      createPlaylist("[quantum] history playlist", {
        onSuccess: (data) => {
          setPlayListId(data?.id);
        },
      });
    }
  }, [createPlaylist, playlistQuery.isError, playlistId, setPlayListId]);
  return playlistQuery;
}
