const BASE_API_HOSTNAME = import.meta.env.VITE_API_HOSTNAME;
import TrackModel from "@api/models/track.model";

export type TCreateTrackData = Pick<TrackModel, "name" | "spotify_id"> &
  Partial<TrackModel>;

export class WebApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
export async function getAllTracks(): Promise<{ tracks: TrackModel[] }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks`);
  if (!response.ok) {
    throw new WebApiError("could not get all tracks", response.status);
  }
  return response.json();
}
export async function getTrack(id: number): Promise<{ track: TrackModel }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks/${id}`);
  if (!response.ok) {
    throw new WebApiError(`could not get track ${id}`,response.status);
  }
  return response.json();
}
export async function getTrackBySpotifyId(
  id: string
): Promise<{ track: TrackModel }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks/spotify/${id}`);
  if (!response.ok) {
    throw new WebApiError(`could not get track ${id}`,response.status);
  }
  return response.json();
}
export async function getTrackChildren(
  id: number
): Promise<{ tracks: TrackModel[] }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks/${id}/children`);
  if (!response.ok) {
    throw new WebApiError("could not get track children",response.status);
  }
  return response.json();
}
export async function getTrackParents(
  id: number
): Promise<{ tracks: TrackModel[] }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks/${id}/parents`);
  if (!response.ok) {
    throw new WebApiError("could not get track children",response.status);
  }
  return response.json();
}

export async function createTrack(
  track: TCreateTrackData & { parent_id?: number }
): Promise<{ track: TrackModel }> {
  const response = await fetch(`${BASE_API_HOSTNAME}/tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(track), // body data type must match "Content-Type" header
  });
  if (!response.ok) {
    throw new WebApiError("could not create Track",response.status);
  }
  return response.json();
}
