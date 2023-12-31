import { Request, Response } from "express";
import TrackModel from "../models/track.model";
import TrackJunctionModel from "../models/trackJunctionModel.model";

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
export const createTrack = async (
  req: Request<{}, { track: TrackModel }, createTrackBody>,
  res: Response<{ track: TrackModel } | { error: any }>
) => {
  try {
    const oldTrack = await TrackModel.findOne({
      where: { spotify_id: req.body.spotify_id },
    });
    if (oldTrack && !req.body.parent_id) {
      return res.status(304).json({
        error: new Error(
          "no operation, track already in db and no parent_id found"
        ),
      });
    }
    const newTrack =
      !oldTrack &&
      (await createTrackModel({
        spotify_id: req.body.spotify_id,
        name: req.body.name,
        parent_id: req.body.parent_id,
      }));
    const track = oldTrack || newTrack;
    if (!track) {
      return res.status(500).json({ error: "no track created" });
    }
    if (req.body.parent_id) {
      if (req.body.parent_id === track.id) {
        throw new Error("parent_id cannot equal child_id");
      }
      await TrackJunctionModel.create({
        parent_id: req.body.parent_id,
        child_id: track.id,
      });
    }

    track.reload();
    return res.status(201).json({ track });
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
    const tracks = await TrackModel.findAll();
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
    const track = await TrackModel.findByPk(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "could not find track" });
    }
    return res.status(200).json({ tracks: track?.children || [] });
  } catch (e) {
    return res.status(500).json({ error: normalizeError(e).message });
  }
};
export const getTrackParentsById = async (
  req: Request<{ id: number }>,
  res: Response<{ tracks: TrackModel[] } | { error: any }>
) => {
  try {
    const track = await TrackModel.findByPk(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "could not find track" });
    }
    return res.status(200).json({ tracks: track?.parents || [] });
  } catch (e) {
    return res.status(500).json({ error: normalizeError(e).message });
  }
};
