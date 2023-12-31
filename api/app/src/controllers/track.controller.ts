import { Request, Response } from "express";
import TrackModel, { TrackJunctionModel } from "../models/track.model";

type createTrackBody = {
  parent_id?: number;
  spotify_id: string;
  name: string;
};

export const createTrack = async (
  req: Request<{}, { track: TrackModel }, createTrackBody>,
  res: Response<{ track: TrackModel } | { error: any }>
) => {
  try {
    const oldTrack = await TrackModel.findOne({
      where: { spotify_id: req.body.spotify_id },
    });
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
      TrackJunctionModel.create({
        parent_id: req.body.parent_id,
        child_id: track.id,
      });
    }

    track.reload();
    return res.status(201).json({ track });
  } catch (e) {
    return res.status(500).json({ error: e });
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
    return res.status(500).json({ error: e });
  }
};
export const getTrackById = async (
  req: Request<{ id: number }>,
  res: Response<{ track: TrackModel | null } | { error: any }>
) => {
  try {
    const track = await TrackModel.findByPk(req.params.id);
    return res.status(200).json({ track });
  } catch (e) {
    return res.status(500).json({ error: e });
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
    return res.status(200).json({ track });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e });
  }
};

export const getTrackChildrenById = async (
  req: Request<{ id: number }>,
  res: Response<{ tracks: TrackModel[] } | { error: any }>
) => {
  try {
    const track = await TrackModel.findByPk(req.params.id);
    return res.status(200).json({ tracks: track?.children || [] });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};
export const getTrackParentsById = async (
  req: Request<{ id: number }>,
  res: Response<{ tracks: TrackModel[] } | { error: any }>
) => {
  try {
    const track = await TrackModel.findByPk(req.params.id);
    return res.status(200).json({ tracks: track?.parents || [] });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};
