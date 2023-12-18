const BASE_API_HOSTNAME = import.meta.env.VITE_API_HOSTNAME;
import TrackModel from "@api/models/track.model";

export type TCreateTrackData = Pick<TrackModel, "name" | "spotify_id"> &
  Partial<Pick<TrackModel, "parent_id">>;
export async function getAllTracks(): Promise<{ tracks: TrackModel[] }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks`);
  if (!response.ok) {
    throw new Error("could not get all tracks");
  }
  return response.json();
}
export async function getTrack(id: number): Promise<{ track: TrackModel }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks/${id}`);
  if (!response.ok) {
    throw new Error(`could not get track ${id}`);
  }
  return response.json();
}
export async function getTracksBySpotifyId(
  id: string
): Promise<{ tracks: TrackModel[] }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks/spotify/${id}`);
  if (!response.ok) {
    throw new Error(`could not get track ${id}`);
  }
  return response.json();
}
export async function getTrackChildren(
  id: number
): Promise<{ tracks: TrackModel[] }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks/${id}/children`);
  if (!response.ok) {
    throw new Error("could not get track children");
  }
  return response.json();
}

export async function createTrack(
  track: TCreateTrackData
): Promise<{ track: TrackModel }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(track), // body data type must match "Content-Type" header
  });
  if (!response.ok) {
    throw new Error("could not create Track");
  }
  return response.json();
}
