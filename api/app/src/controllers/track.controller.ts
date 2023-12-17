import { Request, Response } from "express";
import TrackModel from "../models/track.model";

type createTrackBody = {
  parent_id?: number;
  spotify_uri: string;
  spotify_id: string;
  name: string;
};

export const createTrack = async (
  req: Request<{}, { track: TrackModel }, createTrackBody>,
  res: Response<{ track: TrackModel } | { error: any }>
) => {
  try {
    const track = await TrackModel.create({
      spotify_id: req.body.spotify_id,
      name: req.body.name,
      parent_id: req.body.parent_id,
    });
    return res.status(201).json({ track });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};

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
  res: Response<{ tracks: TrackModel[] } | { error: any }>
) => {
  try {
    const tracks = await TrackModel.findAll({
      where: { spotify_id: req.params.spotifyId },
    });
    return res.status(200).json({ tracks });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};

export const getTrackChildrenById = async (
  req: Request<{ id: number }>,
  res: Response<{ tracks: TrackModel[] } | { error: any }>
) => {
  try {
    const tracks = await TrackModel.findAll({
      where: { parent_id: req.params.id },
    });
    console.log("gettig by parent_id");
    return res.status(200).json({ tracks });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};
