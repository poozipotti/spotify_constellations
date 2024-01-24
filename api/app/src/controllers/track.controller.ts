import { Request, Response } from "express";
import TrackModel from "../models/track.model";
import TrackJunctionModel from "../models/trackJunctionModel.model";
import { parentPort } from "worker_threads";

type createTrackBody = {
  parent_id?: number;
  spotify_id: string;
  name: string;
};
type sequelizeError = { errors: Error[] };
const normalizeError = (e: unknown) => {
  const error = e as sequelizeError | Error;
  const errorMsg =
    "errors" in error
      ? error.errors.map((e) => e.message).join(" | ")
      : error.message;
  console.error(e);
  return { message: errorMsg };
};
const createTrackHelper = async (
  trackData: createTrackBody
): Promise<{
  error?: { message: string; status: number };
  data?: TrackModel;
}> => {
  const oldTrack = await TrackModel.findOne({
    where: { spotify_id: trackData.spotify_id },
  });
  if (oldTrack && !trackData.parent_id) {
    return {
      error: {
        message: "no operation, track already in db and no parent_id found",
        status: 304,
      },
    };
  }
  const newTrack = !oldTrack && (await createTrackModel(trackData));
  const track = oldTrack || newTrack;
  if (!track) {
    return { error: { message: "no track created", status: 500 } };
  }
  if (trackData.parent_id === track.id) {
    return { error: { message: "cannot lookup to self", status: 300 } };
  }
  if (trackData.parent_id) {
    await TrackJunctionModel.create({
      parent_id: trackData.parent_id,
      child_id: track.id,
    });
    track.reload();
  }
  return { data: track };
};

export const createTracks = async (
  req: Request<{}, { tracks: TrackModel[] }, { tracks: createTrackBody[] }>,
  res: Response<{ tracks: TrackModel[] } | { error: any }>
) => {
  try {
    const {
      retData,
      errors,
    }: {
      retData: TrackModel[];
      errors: { message: string; status: number }[];
    } = { retData: [], errors: [] };
    for (let i = 0; i < req.body.tracks.length; i++) {
      const track = req.body.tracks[i];
      const prevTrack = i > 0 ? req.body.tracks[i - 1] : undefined;
      const prevTrackData = prevTrack && await TrackModel.findOne({
        where: { spotify_id: prevTrack?.spotify_id },
      });

      const { data, error } = await createTrackHelper({
        name: track.name,
        spotify_id: track.spotify_id,
        parent_id: track.parent_id || prevTrackData?.id,
      });
      if (data) {
        retData.push(data);
      }
      if (error) {
        errors.push(error);
      }
    }

    if (retData?.length) {
      return res.status(201).json({ tracks: retData });
    }
    return res.status(500).json({ error: errors });
  } catch (e) {
    return res.status(500).json({ error: normalizeError(e).message });
  }
};
async function createTrackModel({ spotify_id, name }: createTrackBody) {
  return TrackModel.create({
    spotify_id,
    name,
  });
}

export const getAllTracks = async (
  req: Request,
  res: Response<{ tracks: TrackModel[] } | { error: any }>
) => {
  try {
    const tracks = await TrackModel.findAll({
      include: [
        { model: TrackModel, as: "children" },
        { model: TrackModel, as: "parents" },
      ],
    });
    return res.status(200).json({ tracks });
  } catch (e) {
    return res.status(500).json({ error: normalizeError(e).message });
  }
};
export const getTrackById = async (
  req: Request<{ id: number }>,
  res: Response<{ track: TrackModel | null } | { error: any }>
) => {
  try {
    const track = await TrackModel.findByPk(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "could not find track" });
    }
    return res.status(200).json({ track });
  } catch (e) {
    return res.status(500).json({ error: normalizeError(e).message });
  }
};
export const getTracksBySpotifyId = async (
  req: Request<{ spotifyId: string }>,
  res: Response<{ track: TrackModel | null } | { error: any }>
) => {
  try {
    const track = await TrackModel.findOne({
      where: { spotify_id: req.params.spotifyId },
    });
    if (!track) {
      return res.status(404).json({ error: "could not find track" });
    }
    return res.status(200).json({ track });
  } catch (e) {
    return res.status(500).json({ error: normalizeError(e).message });
  }
};

export const getTrackChildrenById = async (
  req: Request<{ id: number }>,
  res: Response<{ tracks: TrackModel[] } | { error: any }>
) => {
  try {
    const tracks = await TrackJunctionModel.findAll({
      where: { parent_id: req.params.id },
      include: "child",
    });
    return res.status(200).json({ tracks: tracks.map((track) => track.child) });
  } catch (e) {
    return res.status(500).json({ error: normalizeError(e).message });
  }
};
export const getTrackParentsById = async (
  req: Request<{ id: number }>,
  res: Response<{ tracks: TrackModel[] } | { error: any }>
) => {
  try {
    const tracks = await TrackJunctionModel.findAll({
      where: { child_id: req.params.id },
      include: "parent",
    });
    return res
      .status(200)
      .json({ tracks: tracks.map((track) => track.parent) });
  } catch (e) {
    return res.status(500).json({ error: normalizeError(e).message });
  }
};
